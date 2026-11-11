import re
import unittest

from playwright.sync_api import expect, sync_playwright

from browser_smoke import ROOT, local_server


class UnitLearningTests(unittest.TestCase):
    def setUp(self):
        self.context = self.browser.new_context(
            viewport={"width": 390, "height": 844}, reduced_motion="reduce"
        )
        self.addCleanup(self.context.close)
        self.page = self.context.new_page()
        self.errors = []
        self.page.on("pageerror", lambda error: self.errors.append(str(error)))
        self.page.goto(self.base_url, wait_until="networkidle")

    def tearDown(self):
        self.assertEqual(self.errors, [])

    def start(self):
        self.page.get_by_role("link", name="Start here", exact=True).click()
        expect(self.page.locator("#unitView")).to_have_class("view active")

    def choose(self, name, index):
        self.page.locator(f'input[name="{name}"][value="{index}"]').check()

    def current(self):
        return self.page.evaluate("""() => ({
            moduleId: UnitEngine.current.moduleId, unitId: UnitEngine.current.unit.id,
            practice: UnitEngine.current.unit.practice.correct,
            check: UnitEngine.current.unit.check.correct
        })""")

    def test_first_use_and_mobile_trace(self):
        self.start()
        expect(self.page.locator("#unitView h1")).to_be_visible()
        expect(self.page.locator(".unit-steps button")).to_have_count(3)
        self.assertEqual(self.page.locator(".unit-body fieldset").count(), 0)
        self.assertGreater(self.page.locator(".unit-prose p").count(), 1)
        self.assertEqual(self.page.evaluate("""() => {
            const trace = document.querySelector('.unit-trace');
            return trace.scrollWidth > trace.clientWidth + 1 ||
                document.documentElement.scrollWidth > innerWidth + 1;
        }"""), False)
        self.page.get_by_role("button", name="Try it yourself", exact=True).click()
        expect(self.page.locator('input[name="unitPractice"]')).to_have_count(3)

    def test_resume_failed_check_and_legacy_evidence(self):
        self.start()
        current = self.current()
        self.page.get_by_role("button", name="Try it yourself", exact=True).click()
        self.choose("unitPractice", current["practice"])
        self.page.get_by_role("button", name="Check prediction", exact=True).click()
        self.page.get_by_role("link", name="Your path", exact=True).click()
        self.page.get_by_role("link", name="Continue learning", exact=True).click()
        expect(self.page.locator('.unit-steps [aria-current="step"]')).to_have_text("2. Try")
        self.page.reload(wait_until="networkidle")
        expect(self.page.locator('input[name="unitPractice"]:checked')).to_have_value(str(current["practice"]))
        self.page.get_by_role("button", name="Try a changed situation").click()
        self.choose("unitCheck", (current["check"] + 1) % 3)
        self.page.locator("#unitReflection").fill("I would inspect the supplied evidence before deciding.")
        self.page.get_by_role("button", name="Check answer and save explanation").click()
        expect(self.page.locator("#unitNext")).to_be_disabled()
        expect(self.page.locator("#unitFeedback")).to_contain_text("Revisit")
        self.choose("unitCheck", current["check"])
        self.page.get_by_role("button", name="Check answer and save explanation").click()
        expect(self.page.locator("#unitNext")).to_be_enabled()
        exported = self.page.evaluate("() => ProgressManager.createExport()")
        self.assertNotIn(current["moduleId"], exported["moduleMastery"])
        self.assertTrue(exported["unitLearning"][current["moduleId"]]["records"][current["unitId"]]["passed"])
        self.page.locator("#unitNext").click()
        self.assertNotEqual(self.current()["unitId"], current["unitId"])
        self.page.go_back(wait_until="domcontentloaded")
        expect(self.page.locator('.unit-steps [aria-current="step"]')).to_have_text("3. Check")

    def test_every_module_and_reference_links(self):
        ids = self.page.evaluate("() => Object.keys(ACADEMY_UNITS.modules)")
        expected = self.page.evaluate("() => MasteryEngine.getRealModules(MODULES, ACADEMY_MASTERY).map(module => module.id)")
        self.assertEqual(set(ids), set(expected))
        self.assertEqual(len(ids), 31)
        for module_id in ids:
            self.page.goto(self.base_url + "#" + module_id, wait_until="networkidle")
            expect(self.page.locator("#unitView")).to_have_class("view active")
            for step in ("learn", "try", "check"):
                self.page.locator(f'.unit-steps [data-step="{step}"]').click()
                expect(self.page.locator(".unit-body")).to_be_visible()
            self.page.locator(".unit-reference summary").click()
            self.page.get_by_role("link", name="Open the full reference lesson", exact=True).click()
            expect(self.page.locator("#moduleView")).to_have_class(re.compile(r"\bactive\b"))
            self.assertEqual(self.page.evaluate("() => app.currentMode"), "browse")
            headings = self.page.locator("#tab-learn h2").all_text_contents()
            self.assertFalse(headings[0].startswith("Worked case:"))
            self.page.goto(self.base_url + "#" + module_id + "?tab=quiz", wait_until="networkidle")
            expect(self.page.locator("#tab-quiz")).to_have_class("tab-content active")

    def test_storage_failure_is_recoverable(self):
        self.start()
        self.page.get_by_role("button", name="Try it yourself", exact=True).click()
        current = self.current()
        self.page.evaluate("""() => {
            window.originalSetItem = Storage.prototype.setItem;
            Storage.prototype.setItem = function(key, value) {
                if (key === ProgressManager.STORAGE_KEY) throw new DOMException('Test quota', 'QuotaExceededError');
                return window.originalSetItem.call(this, key, value);
            };
        }""")
        self.choose("unitPractice", current["practice"])
        expect(self.page.locator("#unitSaveStatus")).to_contain_text("not saved")
        self.page.get_by_role("link", name="Your path", exact=True).click()
        self.page.get_by_role("link", name="Continue learning", exact=True).click()
        expect(self.page.locator('input[name="unitPractice"]:checked')).to_have_value(str(current["practice"]))
        self.page.evaluate("() => { Storage.prototype.setItem = window.originalSetItem; }")
        self.page.locator('#storageNotice [data-learning-action="retry-save"]').click()
        expect(self.page.locator("#unitSaveStatus")).to_contain_text("Saved on this device")
        self.page.reload(wait_until="networkidle")
        expect(self.page.locator('input[name="unitPractice"]:checked')).to_have_value(str(current["practice"]))

    def test_duplicate_route_events_do_not_rerender_or_save_the_current_unit(self):
        self.start()
        self.page.get_by_role("button", name="Try it yourself", exact=True).click()
        control = self.page.locator('input[name="unitPractice"]').first
        control.focus()
        result = self.page.evaluate("""() => {
            const original = ProgressManager.saveProgress;
            let writes = 0;
            ProgressManager.saveProgress = function(...args) {
                writes++;
                return original.apply(this, args);
            };
            const focused = document.activeElement;
            const body = document.querySelector('.unit-body');
            try {
                app.syncHashRoute();
                app.syncHashRoute();
                return { writes, sameBody: body === document.querySelector('.unit-body'),
                    sameFocus: focused === document.activeElement };
            } finally { ProgressManager.saveProgress = original; }
        }""")
        self.assertEqual(result, {"writes": 0, "sameBody": True, "sameFocus": True})

    def test_old_backup_and_malicious_draft_remain_safe(self):
        self.page.evaluate("""() => {
            const progress = ProgressManager.defaultProgress();
            delete progress.unitLearning;
            progress.notes = {'phase1-prompting': 'Original note'};
            progress.quizScores = {'phase1-prompting': {score: 8, total: 8}};
            ProgressManager.saveProgress(progress);
        }""")
        self.start()
        self.page.locator('.unit-steps [data-step="check"]').click()
        self.page.locator("#unitReflection").fill('<img src=x onerror="window.injected=true">')
        self.page.reload(wait_until="networkidle")
        self.assertFalse(self.page.evaluate("() => Boolean(window.injected)"))
        expect(self.page.locator("#unitReflection")).to_have_value('<img src=x onerror="window.injected=true">')
        self.assertEqual(self.page.evaluate("() => ProgressManager.getProgress().notes['phase1-prompting']"), "Original note")
        self.assertEqual(self.page.evaluate("() => ProgressManager.getProgress().quizScores['phase1-prompting'].score"), 8)

    def test_pilot_assets_work_offline(self):
        self.start()
        self.page.evaluate("() => navigator.serviceWorker.ready")
        self.page.wait_for_function("() => Boolean(navigator.serviceWorker.controller)")
        url = self.page.url
        self.context.set_offline(True)
        self.page.reload(wait_until="domcontentloaded")
        expect(self.page.locator("#unitView")).to_have_class("view active")
        self.assertEqual(self.page.url, url)
        self.page.get_by_role("button", name="Try it yourself", exact=True).click()
        expect(self.page.locator('input[name="unitPractice"]')).to_have_count(3)

    def test_primary_destinations_match_visible_headings(self):
        self.page.locator('.bottom-nav [data-destination="build"]').click()
        expect(self.page.locator("#destinationTitle")).to_have_text("Lab")
        self.page.locator('.bottom-nav [data-destination="more"]').click()
        expect(self.page.locator("#destinationTitle")).to_have_text("Progress")

    def test_unknown_unit_and_new_content_version_start_safely(self):
        self.start()
        current = self.current()
        self.page.locator('.unit-steps [data-step="check"]').click()
        self.page.locator("#unitReflection").fill("My earlier explanation should remain in the notebook.")
        self.page.goto(self.base_url + "#" + current["moduleId"] + "?unit=not-a-unit&step=check")
        expect(self.page.locator('.unit-steps [aria-current="step"]')).to_have_text("1. Learn")
        self.page.evaluate("""moduleId => {
            const progress = ProgressManager.getProgress();
            progress.unitLearning[moduleId].version = 'older-content';
            ProgressManager.saveProgress(progress);
        }""", current["moduleId"])
        self.page.reload(wait_until="networkidle")
        expect(self.page.locator("#unitView")).to_contain_text("This lesson has changed")
        self.page.locator('.unit-steps [data-step="check"]').click()
        expect(self.page.locator("#unitReflection")).to_have_value("My earlier explanation should remain in the notebook.")
        expect(self.page.locator("#unitNext")).to_be_disabled()

    def test_local_lab_guide_is_available_without_claiming_an_archive(self):
        self.page.locator('.bottom-nav [data-destination="build"]').click()
        expect(self.page.locator("#localLabPack")).to_contain_text("Node.js 22")
        expect(self.page.locator("#localLabPack li")).to_have_count(6)
        expect(self.page.locator("#localLabPack")).to_contain_text("Archive creation was not authorized")
        expect(self.page.locator("#localLabPack [download]")).to_have_count(0)
        response = self.page.request.get(self.base_url + "labs/local/README.md")
        self.assertTrue(response.ok)
        self.assertEqual(response.body(), (ROOT / "labs" / "local" / "README.md").read_bytes())

    def test_optional_specialties_are_discoverable_without_becoming_core_requirements(self):
        self.page.locator('.bottom-nav [data-destination="build"]').click()
        self.page.locator('#specializations summary').click()
        links = self.page.locator('#specializations a')
        expect(links).to_have_count(8)
        links.first.click()
        expect(self.page.locator("#unitView")).to_have_class("view active")
        self.assertTrue(self.page.evaluate("() => UnitEngine.current.unit.optional"))
        expect(self.page.locator("#unitView")).to_contain_text("not required for the core route")


if __name__ == "__main__":
    expect.set_options(timeout=10000)
    with local_server() as server, sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="msedge", headless=True)
        try:
            UnitLearningTests.browser = browser
            UnitLearningTests.base_url = server.base_url
            result = unittest.main(verbosity=2, exit=False).result
        finally:
            browser.close()
    raise SystemExit(0 if result.wasSuccessful() else 1)
