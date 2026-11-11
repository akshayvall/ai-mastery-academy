"""Local diagram contract; isolated Edge contexts, no existing profile or provider calls."""
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import unittest

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ("landscape", "modules-100", "modules-200", "modules-300",
           "modules-extras", "modules-pm", "modules-builder", "diagrams")


@contextmanager
def local_server():
    class Handler(SimpleHTTPRequestHandler):
        def log_message(self, *_):
            pass

        def do_GET(self):
            if self.path == "/diagram-test.html":
                scripts = "".join(f'<script src="/js/{name}.js"></script>' for name in SCRIPTS)
                page = ('<!doctype html><html lang="en"><meta charset="utf-8">'
                        '<meta name="viewport" content="width=device-width">'
                        '<title>Diagram contract</title>'
                        '<link rel="stylesheet" href="/css/styles.css">'
                        '<link rel="stylesheet" href="/css/diagram-learning.css">'
                        '<body><main id="tab-diagrams"></main><aside id="preview"></aside>'
                        f'{scripts}</body></html>').encode()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(page)))
                self.end_headers()
                self.wfile.write(page)
                return
            super().do_GET()

    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(Handler, directory=str(ROOT)))
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}"
    finally:
        server.shutdown()
        server.server_close()
        thread.join()


class DiagramLearningTests(unittest.TestCase):
    def test_all_instances_widths_motion_and_keyboard(self):
        with local_server() as base, sync_playwright() as playwright:
            browser = playwright.chromium.launch(channel="msedge", headless=True)
            try:
                snapshots = {}
                for motion in ("no-preference", "reduce"):
                    for width in (320, 390, 768, 1440):
                        with self.subTest(motion=motion, width=width):
                            context = browser.new_context(
                                viewport={"width": width, "height": 900}, reduced_motion=motion,
                                service_workers="block")
                            context.route("**/*", lambda route: route.continue_()
                                          if route.request.url.startswith(base + "/") else route.abort())
                            page = context.new_page()
                            errors = []
                            page.on("pageerror", lambda error: errors.append(str(error)))
                            page.goto(base + "/diagram-test.html", wait_until="networkidle")
                            instances = page.evaluate("""() => {
                                window.diagrams = [...MODULES_100, ...MODULES_200, ...MODULES_300,
                                    ...MODULES_EXTRAS, ...MODULES_PM, ...MODULES_BUILDER]
                                    .flatMap(module => module.diagrams || []);
                                return diagrams.map(d => ({id:d.id, type:d.type, count:d.steps.length}));
                            }""")
                            self.assertEqual(len(instances), 39)
                            self.assertEqual(len({d["type"] for d in instances}), 20)
                            for index, instance in enumerate(instances):
                                page.evaluate("(i) => DiagramEngine.render([diagrams[i]])", index)
                                card = page.locator(".visual-diagram")
                                self.assertTrue(card.locator(".diagram-overview").is_visible(), instance["id"])
                                self.assertEqual(card.locator(".diagram-state-list > li").count(), instance["count"])
                                self.assertFalse(card.locator(".diagram-canvas").is_visible())
                                self.assertFalse(page.evaluate(
                                    "() => document.documentElement.scrollWidth > innerWidth"), instance["id"])
                                self.assertTrue(card.locator(".diagram-state-list").evaluate(
                                    "(el) => el.scrollWidth <= el.clientWidth"), instance["id"])
                                states = []
                                next_button = card.locator('[data-diagram-action="step"]')
                                previous = card.locator('[data-diagram-action="previous"]')
                                reset = card.locator('[data-diagram-action="reset"]')
                                self.assertTrue(previous.is_disabled())
                                self.assertTrue(reset.is_disabled())
                                next_button.focus()
                                for step in range(1, instance["count"] + 1):
                                    page.keyboard.press("Enter")
                                    self.assertEqual(card.locator(".step-counter span").inner_text(), str(step))
                                    active = card.locator('[data-learning-step][aria-current="step"]')
                                    self.assertEqual(active.count(), 1)
                                    self.assertEqual(active.get_attribute("data-learning-step"), str(step))
                                    self.assertGreater(card.locator("svg .step-highlight.active").count(), 0,
                                                       f"{instance['id']}: SVG step {step}")
                                    states.append(card.locator(".step-text").inner_text())
                                self.assertEqual(len(set(states)), instance["count"], instance["id"])
                                self.assertTrue(next_button.is_disabled())
                                self.assertEqual(card.locator(".diagram-canvas").get_attribute("data-playing"), "false")
                                previous.focus()
                                page.keyboard.press("Space")
                                self.assertEqual(card.locator(".step-counter span").inner_text(), str(instance["count"] - 1))
                                page.keyboard.press("Home")
                                self.assertEqual(card.locator(".step-counter span").inner_text(), "0")
                                next_button.focus()
                                page.keyboard.press("ArrowRight")
                                self.assertEqual(card.locator(".step-counter span").inner_text(), "1")
                                reset.focus()
                                page.keyboard.press("Enter")
                                self.assertEqual(card.locator(".step-counter span").inner_text(), "0")
                                summary = card.locator(".diagram-detail > summary")
                                summary.focus()
                                page.keyboard.press("Enter")
                                self.assertTrue(card.locator(".diagram-canvas").is_visible())
                                self.assertTrue(card.locator("svg > desc").text_content())
                                self.assertFalse(page.evaluate(
                                    "() => document.documentElement.scrollWidth > innerWidth"), instance["id"])
                                self.assertEqual(card.locator("animateMotion").count(), 0)
                                key = (width, instance["id"])
                                if motion == "reduce":
                                    self.assertEqual(states, snapshots[key])
                                else:
                                    snapshots[key] = states
                                page.evaluate("""(i) => DiagramEngine.renderPreview(
                                    diagrams[i], document.getElementById('preview'))""", index)
                                self.assertTrue(page.locator("#preview .diagram-overview").is_visible())
                                self.assertFalse(page.locator("#preview .diagram-canvas").is_visible())
                                self.assertFalse(page.evaluate(
                                    "() => document.documentElement.scrollWidth > innerWidth"), instance["id"])
                                page.evaluate("document.getElementById('preview').replaceChildren()")
                            self.assertEqual(errors, [])
                            context.close()
            finally:
                browser.close()


if __name__ == "__main__":
    unittest.main()
