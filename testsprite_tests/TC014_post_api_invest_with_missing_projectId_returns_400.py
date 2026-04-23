import requests
import time

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_post_api_invest_with_missing_projectId_returns_400():
    timestamp = int(time.time() * 1000)
    email = f"investor_{timestamp}@example.com"
    password = "StrongPass123"
    full_name = "Test Investor"

    headers = {"Content-Type": "application/json"}

    # Register new investor user
    register_payload = {
        "email": email,
        "password": password,
        "full_name": full_name,
        "role": "investor"
    }
    reg_resp = requests.post(f"{BASE_URL}/api/auth/register", json=register_payload, headers=headers, timeout=TIMEOUT)
    assert reg_resp.status_code == 201, f"Unexpected register status: {reg_resp.status_code}"
    reg_json = reg_resp.json()
    assert "userId" in reg_json

    # Login as the investor
    login_payload = {"email": email, "password": password}
    login_resp = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload, headers=headers, timeout=TIMEOUT)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.status_code}"
    login_json = login_resp.json()
    # As per PRD, login returns 200 with JWT access token and refresh token in data
    assert isinstance(login_json.get("access_token"), str) or isinstance(login_json.get("data", {}).get("access_token"), str) or isinstance(login_json.get("data", {}).get("token"), str), "Token not found in login response"
    token = login_json.get("data", {}).get("token") or login_json.get("access_token") or login_json.get("data", {}).get("access_token")
    assert token and isinstance(token, str)

    auth_headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

    # Make POST /api/invest call with missing projectId (only amount)
    invest_payload = {"amount": 5000}
    invest_resp = requests.post(f"{BASE_URL}/api/invest", json=invest_payload, headers=auth_headers, timeout=TIMEOUT)
    assert invest_resp.status_code == 400, f"Expected 400 Bad Request, got {invest_resp.status_code}"

    invest_json = invest_resp.json()
    # Validate response contains success: false and error about missing projectId
    assert invest_json.get("success") is False
    error_msg = invest_json.get("error", "").lower()
    assert "projectid" in error_msg or "project id" in error_msg or any(k.lower() == "projectid" for k in invest_json.keys())


test_post_api_invest_with_missing_projectId_returns_400()
