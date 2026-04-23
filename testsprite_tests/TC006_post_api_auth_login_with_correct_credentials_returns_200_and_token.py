import requests
import time

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_post_api_auth_login_with_correct_credentials_returns_200_and_token():
    timestamp = str(int(time.time() * 1000))
    email = f"testuser_{timestamp}@example.com"
    password = "StrongPass123"
    full_name = "Test User"
    role = "investor"

    register_url = f"{BASE_URL}/api/auth/register"
    login_url = f"{BASE_URL}/api/auth/login"

    register_payload = {
        "email": email,
        "password": password,
        "fullName": full_name,
        "role": role
    }
    headers = {"Content-Type": "application/json"}

    # Register the user
    try:
        register_resp = requests.post(register_url, json=register_payload, headers=headers, timeout=TIMEOUT)
        assert register_resp.status_code == 201, f"Expected 201 Created but got {register_resp.status_code}"
        register_json = register_resp.json()
        user_id = register_json.get("userId")
        assert user_id and isinstance(user_id, str), "userId missing or invalid in register response"
    except requests.RequestException as e:
        assert False, f"Register request failed: {e}"

    # Login with the same credentials
    login_payload = {
        "email": email,
        "password": password
    }

    try:
        login_resp = requests.post(login_url, json=login_payload, headers=headers, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Expected 200 OK but got {login_resp.status_code}"
        login_json = login_resp.json()
        assert login_json.get("success") is True, "Login response success is not true"
        data = login_json.get("data")
        assert isinstance(data, dict), "Login response data missing or not a dict"
        token = data.get("token")
        user_info = data.get("user")
        assert isinstance(token, str) and token, "Token missing or not a non-empty string"
        assert isinstance(user_info, dict), "User info missing or not a dict"
        assert isinstance(user_info.get("id"), str) and user_info.get("id"), "User id missing or invalid"
        assert user_info.get("email") == email, "User email mismatch in login response"
        # full_name key can be either full_name or fullName depending on API casing - check both
        assert (user_info.get("full_name") == full_name) or (user_info.get("fullName") == full_name), "User full name mismatch"
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"


test_post_api_auth_login_with_correct_credentials_returns_200_and_token()
