import requests
import time

def test_post_api_auth_login_with_non_existent_email_returns_401():
    base_url = "http://localhost:3000"
    login_url = f"{base_url}/api/auth/login"
    timestamp = int(time.time() * 1000)
    non_existent_email = f"nonexistent_{timestamp}@example.com"
    password = "AnyPassword123!"

    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "email": non_existent_email,
        "password": password
    }

    try:
        response = requests.post(login_url, json=payload, headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request to {login_url} failed: {e}"

    # Assert status code is 401 Unauthorized
    assert response.status_code == 401, f"Expected status code 401 but got {response.status_code}"

    try:
        json_response = response.json()
    except ValueError:
        assert False, "Response is not in JSON format"

    # Assert success field is false
    assert "success" in json_response, "Response JSON lacks 'success' field"
    assert json_response["success"] is False, "Expected success: false in response"

    # Must NOT return 200 or 404, already asserted 401 above. But check that error message present
    assert "error" in json_response or ("message" in json_response), "Response should contain error or message field"

test_post_api_auth_login_with_non_existent_email_returns_401()