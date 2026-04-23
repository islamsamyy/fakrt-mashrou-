import requests
import time

BASE_URL = "http://localhost:3000"
REGISTER_ENDPOINT = f"{BASE_URL}/api/auth/register"
LOGIN_ENDPOINT = f"{BASE_URL}/api/auth/login"

def test_post_api_auth_login_with_wrong_password_returns_401():
    # Generate unique email with timestamp
    timestamp = int(time.time() * 1000)
    email = f"testuser{timestamp}@example.com"
    correct_password = "CorrectPass123!"
    wrong_password = "WrongPass123!"
    full_name = "Test User"

    headers = {
        "Content-Type": "application/json"
    }

    # Register a user first
    register_payload = {
        "email": email,
        "password": correct_password,
        "fullName": full_name,
        "role": "investor"
    }
    register_resp = requests.post(REGISTER_ENDPOINT, json=register_payload, headers=headers, timeout=30)
    assert register_resp.status_code == 201, \
        f"Expected 201 on register but got {register_resp.status_code}, response: {register_resp.text}"
    register_json = register_resp.json()
    assert "success" in register_json and register_json["success"] is True, f"Registration failed unexpectedly: {register_json}"
    
    # Attempt login with wrong password
    login_payload = {
        "email": email,
        "password": wrong_password
    }
    login_resp = requests.post(LOGIN_ENDPOINT, json=login_payload, headers=headers, timeout=30)

    # Validate response is 401 Unauthorized
    assert login_resp.status_code == 401, f"Expected status code 401 but got {login_resp.status_code} - {login_resp.text}"
    login_json = login_resp.json()
    # Check success false
    assert "success" in login_json, "Missing 'success' key in login response"
    assert login_json["success"] is False, f"Expected success: false but got success: {login_json['success']}"
    # Check error message in Arabic indicating invalid credentials
    error_msg = login_json.get("error") or login_json.get("message") or ""
    assert error_msg, "Expected error message in response but none found"
    # Arabic characters range check (basic unicode range for Arabic)
    arabic_range = any('\u0600' <= ch <= '\u06FF' or '\u0750' <= ch <= '\u077F' for ch in error_msg)
    assert arabic_range, f"Error message does not appear to contain Arabic text: {error_msg}"
    # Check for expected Arabic wording
    expected_arabic_phrases = ["بيانات", "تسجيل", "غير صحيحة", "كلمة المرور", "خطأ", "غير صحيح"]
    assert any(phrase in error_msg for phrase in expected_arabic_phrases), f"Error message does not indicate invalid credentials in Arabic: {error_msg}"

test_post_api_auth_login_with_wrong_password_returns_401()
