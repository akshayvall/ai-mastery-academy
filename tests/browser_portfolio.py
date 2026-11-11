import re
import unittest

from playwright.sync_api import expect, sync_playwright
from browser_smoke import local_server


class PortfolioTests(unittest.TestCase):
    def setUp(self):
        self.context = self.browser.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
        self.addCleanup(self.context.close)
        self.page = self.context.new_page()
        self.page.goto(self.base_url + "#more", wait_until="networkidle")

    def test_dossier_draft_export_and_track_resume(self):
        expect(self.page.locator("#portfolioWorkbench")).to_be_visible()
        self.page.locator('#portfolioForm details').first.locator('summary').click()
        text = "Synthetic museum need; inspect the manual baseline and record remaining uncertainty."
        self.page.locator("#dossier-problem").fill(text)
        self.page.locator("#dossierAssistance").select_option("scaffolded")
        self.page.reload(wait_until="networkidle")
        self.page.locator('#portfolioForm details').first.locator('summary').click()
        expect(self.page.locator("#dossier-problem")).to_have_value(text)
        with self.page.expect_download() as downloaded:
            self.page.get_by_role("button", name="Export dossier Markdown").click()
        from pathlib import Path
        exported = Path(downloaded.value.path()).read_text(encoding="utf-8")
        self.assertIn(text, exported)
        self.assertIn("not independently verified", exported)
        self.assertIn("scaffolded", exported)
        self.page.locator('[data-portfolio-action="track"][data-track="builder"]').click()
        self.assertIn("portfolio=builder", self.page.url)
        self.page.reload(wait_until="networkidle")
        expect(self.page.locator('[data-track="builder"]')).to_have_attribute("aria-pressed", "true")
        self.assertEqual(self.page.evaluate("() => ProgressManager.getProgress().moduleMastery"), {})

    def test_source_queue_and_local_notes(self):
        self.page.locator("#sourceReview summary").first.click()
        expect(self.page.locator("#reviewQueue")).to_contain_text("Source-reviewed")
        self.page.locator("#reviewClaim").select_option("openai")
        self.page.locator("#reviewOwner").fill("Course maintainer")
        self.page.locator("#reviewNotes").fill("Checked the official lifecycle notice; a model-specific migration review is required.")
        self.page.get_by_role("button", name="Save local review note").click()
        expect(self.page.locator("#reviewFeedback")).to_contain_text("published facts unchanged")
        date = self.page.evaluate("() => MODEL_LANDSCAPE.verifiedDate")
        self.page.reload(wait_until="networkidle")
        self.page.locator("#sourceReview summary").first.click()
        expect(self.page.locator("#reviewQueue")).to_contain_text("Course maintainer")
        self.assertEqual(self.page.evaluate("() => MODEL_LANDSCAPE.verifiedDate"), date)
        self.assertFalse(self.page.evaluate("document.documentElement.scrollWidth > innerWidth"))


if __name__ == "__main__":
    expect.set_options(timeout=10000)
    with local_server() as server, sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="msedge", headless=True)
        try:
            PortfolioTests.browser = browser
            PortfolioTests.base_url = server.base_url
            result = unittest.main(verbosity=2, exit=False).result
        finally:
            browser.close()
    raise SystemExit(0 if result.wasSuccessful() else 1)
