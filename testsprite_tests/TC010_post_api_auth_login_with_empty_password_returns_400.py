import requests
import time

BASE_URL = "http://localhost:3000"
REGISTER_ENDPOINT = f"{BASE_URL}/api/auth/register"
LOGIN_ENDPOINT = f"{BASE_URL}/api/auth/login"
TIMEOUT = 30

def test_post_api_auth_login_with_empty_password_returns_400():
    timestamp = int(time.time() * 1000)
    email = f"testuser_{timestamp}@example.com"
    password = "ValidPass123"
    full_name = "Test User"
    role = "investor"
    headers = {"Content-Type": "application/json"}

    # Register a user first
    register_payload = {
        "email": email,
        "password": password,
        "fullName": full_name,
        "role": role
    }

    # Register the user
    reg_response = requests.post(REGISTER_ENDPOINT, json=register_payload, headers=headers, timeout=TIMEOUT)
    assert reg_response.status_code == 201, f"User registration failed: {reg_response.text}"
    reg_json = reg_response.json()
    assert "userId" in reg_json, f"No userId in registration response: {reg_response.text}"

    # Try to login with valid email but empty password string
    login_payload = {
        "email": email,
        "password": ""
    }
    login_response = requests.post(LOGIN_ENDPOINT, json=login_payload, headers=headers, timeout=TIMEOUT)

    # Validate HTTP 400 response
    assert login_response.status_code == 400, f"Expected status 400, got {login_response.status_code}: {login_response.text}"

    login_json = login_response.json()
    # Expect success: false
    assert login_json.get("success") is False or "success" not in login_json, f"Expected success false, got {login_json.get('success')}"
    # Check for Arabic error message indicating password is required
    error_msg = login_json.get("error", "")
    assert error_msg != "", "Error message missing in response"
    # Basic check for Arabic presence: presence of Arabic letters unicode range
    arabic_chars = [c for c in error_msg if '\u0600' <= c <= '\u06FF']
    assert len(arabic_chars) > 0, "Error message does not contain Arabic characters"
    assert any(word in error_msg for word in ["كلمة المرور", "مطلوبة", "الرجاء إدخال"]), "Error message does not indicate password required in Arabic"

test_post_api_auth_login_with_empty_password_returns_400()
