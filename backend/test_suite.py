"""
BondBack — Comprehensive Backend AI, Security & Logging Test Suite
Runs end-to-end integration tests using FastAPI TestClient.
"""
import io
import sys
import unittest
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# Helper to create a valid 1x1 JPEG image bytes
def create_dummy_jpeg() -> bytes:
    # Smallest valid JPEG header + EOF
    return (
        b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00"
        b"\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t"
        b"\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a"
        b"\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342"
        b"\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00"
        b"\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b"
        b"\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00"
        b"\xff\xd9"
    )


class TestBondBackBackend(unittest.TestCase):
    def test_01_health_check(self):
        """Verifies health check and system information."""
        res = client.get("/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["service"], "BondBack AI Forensic Engine")

    def test_02_security_headers(self):
        """Verifies that security headers are applied to all responses."""
        res = client.get("/health")
        self.assertIn("x-correlation-id", res.headers)
        self.assertEqual(res.headers.get("x-content-type-options"), "nosniff")
        self.assertEqual(res.headers.get("x-frame-options"), "DENY")
        self.assertEqual(res.headers.get("x-xss-protection"), "1; mode=block")

    def test_03_file_upload_valid_jpeg(self):
        """Verifies upload with magic byte sniffing and SHA-256 computation."""
        jpeg_bytes = create_dummy_jpeg()
        files = {"file": ("IMG_4091.jpg", io.BytesIO(jpeg_bytes), "image/jpeg")}
        res = client.post("/api/upload", files=files)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("file_id", data)
        self.assertEqual(len(data["sha256_hash"]), 64)  # Valid SHA-256 string
        self.assertEqual(data["mime_type"], "image/jpeg")

    def test_04_file_upload_magic_byte_spoof_detection(self):
        """Verifies that spoofed files (e.g. text file renamed to .jpg) are rejected."""
        fake_jpeg = b"This is plain text pretending to be a JPG!"
        files = {"file": ("malicious.jpg", io.BytesIO(fake_jpeg), "image/jpeg")}
        res = client.post("/api/upload", files=files)
        # Should be rejected with 400 Bad Request
        self.assertEqual(res.status_code, 400)
        self.assertIn("does not match", res.json()["detail"])

    def test_05_file_upload_empty_rejection(self):
        """Verifies that 0-byte uploads are rejected."""
        files = {"file": ("empty.jpg", io.BytesIO(b""), "image/jpeg")}
        res = client.post("/api/upload", files=files)
        self.assertEqual(res.status_code, 400)

    def test_06_statutory_depreciation_calculator(self):
        """Verifies straight-line wear and tear depreciation formula."""
        # Carpet: 10 year lifespan, 8.5 years old, claim $850
        # Remaining value = 15% of $850 = $127.50
        res = client.post(
            "/api/calculate/depreciation",
            json={
                "category": "Carpet",
                "claim_amount": 850.0,
                "item_age_years": 8.5,
                "has_pre_existing_proof": False,
            },
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["category"], "Carpet")
        self.assertEqual(data["remaining_value_percentage"], 15.0)
        self.assertEqual(data["statutory_legal_cap"], 127.50)
        self.assertEqual(data["counter_offer"], 127.50)

        # Pre-existing proof -> Counter-offer is $0.00!
        res_proof = client.post(
            "/api/calculate/depreciation",
            json={
                "category": "Carpet",
                "claim_amount": 850.0,
                "item_age_years": 8.5,
                "has_pre_existing_proof": True,
            },
        )
        self.assertEqual(res_proof.status_code, 200)
        self.assertEqual(res_proof.json()["counter_offer"], 0.0)

    def test_07_full_workflow_execution(self):
        """Executes the complete dispute workflow pipeline."""
        # 1. Upload sample photo
        jpeg_bytes = create_dummy_jpeg()
        files = {"file": ("birthday_photo_dog.jpg", io.BytesIO(jpeg_bytes), "image/jpeg")}
        up_res = client.post("/api/upload", files=files)
        file_id = up_res.json()["file_id"]

        # 2. Run full dispute workflow
        workflow_payload = {
            "file_ids": [file_id],
            "claim_text": (
                "From: Apex Property Management\n"
                "We intend to deduct $850.00 for full living room carpet replacement, "
                "$450.00 for entrance wall repainting, and $300.00 for kitchen cleaning. "
                "Total: $1,600.00."
            ),
            "tenant_name": "Sarah Jenkins",
            "property_address": "Apt 4B, 142 Crown Street, Surry Hills NSW 2010",
        }

        res = client.post("/api/analyze/workflow", json=workflow_payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        # Check metrics
        self.assertEqual(data["total_claimed"], 1600.0)
        self.assertEqual(data["counter_offer_total"], 120.0)
        self.assertEqual(data["savings_amount"], 1480.0)
        self.assertEqual(data["savings_percent"], 92.5)

        # Check Vision findings
        self.assertGreater(len(data["vision_findings"]), 0)
        finding = data["vision_findings"][0]
        self.assertTrue(finding["defect_found"])
        self.assertIn("bounding_box", finding)
        box = finding["bounding_box"]
        self.assertEqual(box["ymin"], 650)
        self.assertEqual(box["xmin"], 180)

        # Check Rebuttal drafts
        self.assertEqual(len(data["rebuttal_drafts"]), 3)
        self.assertIn("Section 51(2)", data["rebuttal_drafts"][0]["rebuttal_paragraph"])


if __name__ == "__main__":
    unittest.main()
