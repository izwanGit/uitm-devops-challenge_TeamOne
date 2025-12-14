"""
CORS Test Script for RentVerse AI Service
Tests CORS functionality for all endpoints using FastAPI TestClient
"""

import pytest
from fastapi.testclient import TestClient
from rentverse.main import app

client = TestClient(app)

ENDPOINTS = [
    "/",
    "/api/v1/health",
    "/api/v1/classify/price",
    "/api/v1/classify/approval",
]

@pytest.mark.parametrize("endpoint", ENDPOINTS)
def test_cors_preflight(endpoint):
    """Test CORS preflight request (OPTIONS)."""
    # Origin header is required for CORS middleware to respond with Access-Control-* headers
    headers = {"Origin": "http://example.com", "Access-Control-Request-Method": "GET"}
    response = client.options(endpoint, headers=headers)
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers

@pytest.mark.parametrize("endpoint", ["/", "/api/v1/health"])
def test_cors_get_request(endpoint):
    """Test actual GET request with CORS headers."""
    headers = {'Origin': 'https://example.com'}
    response = client.get(endpoint, headers=headers)
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "https://example.com" or response.headers["access-control-allow-origin"] == "*"

def test_cors_post_request():
    """Test actual POST request with CORS headers."""
    endpoint = "/api/v1/classify/price"
    headers = {'Origin': 'https://example.com'}
    data = {
        "property_type": "Condominium",
        "bedrooms": 3,
        "bathrooms": 2,
        "area": 1200,
        "furnished": "Yes",
        "location": "KLCC, Kuala Lumpur"
    }
    # We accept 404/422/200/500 etc as long as CORS headers are present.
    # Validation errors (422) are fine for this test.
    response = client.post(endpoint, json=data, headers=headers)
    assert "access-control-allow-origin" in response.headers
