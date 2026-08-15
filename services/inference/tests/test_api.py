import io
from dataclasses import replace
from PIL import Image
from fastapi.testclient import TestClient

from app import main, security


class FakeProvider:
    ready = True
    def start(self):
        self.ready = True
    def remove_background(self, image: Image.Image) -> bytes:
        output = image.convert("RGBA")
        output.putalpha(Image.new("L", output.size, 180))
        buf = io.BytesIO(); output.save(buf, "PNG"); return buf.getvalue()
    def record_feedback(self, feedback: str):
        return {"mask_gamma": 1.0, "feedback_total": 1}


def png_bytes():
    image = Image.new("RGB", (24, 18), (20, 100, 180))
    buf = io.BytesIO(); image.save(buf, "PNG"); return buf.getvalue()


def test_processing_requires_internal_secret(monkeypatch):
    monkeypatch.setattr(main, "provider", FakeProvider())
    monkeypatch.setattr(security, "settings", replace(security.settings, api_secret="test-secret"))
    with TestClient(main.app) as client:
        response = client.post("/v1/remove-background", files={"image": ("x.png", png_bytes(), "image/png")})
    assert response.status_code == 401


def test_success_returns_alpha_png(monkeypatch):
    monkeypatch.setattr(main, "provider", FakeProvider())
    monkeypatch.setattr(security, "settings", replace(security.settings, api_secret="test-secret"))
    with TestClient(main.app) as client:
        response = client.post(
            "/v1/remove-background",
            headers={"x-inference-secret": "test-secret"},
            files={"image": ("x.png", png_bytes(), "image/png")},
        )
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("image/png")
    result = Image.open(io.BytesIO(response.content))
    assert result.mode == "RGBA"
    assert result.getchannel("A").getextrema() == (180, 180)


def test_feedback_uses_short_lived_run_token(monkeypatch):
    monkeypatch.setattr(main, "provider", FakeProvider())
    monkeypatch.setattr(security, "settings", replace(security.settings, api_secret="test-secret"))
    main.recent_runs.clear()
    with TestClient(main.app) as client:
        processed = client.post(
            "/v1/remove-background",
            headers={"x-inference-secret": "test-secret"},
            files={"image": ("x.png", png_bytes(), "image/png")},
        )
        run_id = processed.headers.get("x-flythebg-run-id")
        assert run_id
        feedback = client.post(
            "/v1/feedback",
            headers={"x-inference-secret": "test-secret"},
            json={"run_id": run_id, "feedback": "great"},
        )
        replay = client.post(
            "/v1/feedback",
            headers={"x-inference-secret": "test-secret"},
            json={"run_id": run_id, "feedback": "great"},
        )
    assert feedback.status_code == 200
    assert replay.status_code == 410
