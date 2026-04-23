import requests
import time

def test_post_api_auth_register_with_plus_sign():
    base_url = "http://localhost:3000"
    register_url = f"{base_url}/api/auth/register"
    timestamp = int(time.time() * 1000)
    email = f"autotest+{timestamp}@example.com"
    payload = {
        "email": email,
        "password": "StrongPass123!",
        "full_name": "Auto Test User",
        "role": "investor"
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    try:
        response = requests.post(register_url, json=payload, headers=headers, timeout=30)
        assert response.status_code == 201, f"Expected status code 201, got {response.status_code}"
        json_resp = response.json()
        assert "userId" in json_resp, "Response missing 'userId' field"
        assert isinstance(json_resp["userId"], str), "userId should be a string"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_api_auth_register_with_plus_sign()