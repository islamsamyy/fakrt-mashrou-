import requests
import time

def test_post_api_auth_register_with_valid_data_returns_201():
    base_url = "http://localhost:3000"
    endpoint = "/api/auth/register"
    url = base_url + endpoint

    timestamp = int(time.time() * 1000)
    email = f"testuser_{timestamp}@example.com"

    payload = {
        "email": email,
        "password": "StrongPass123",
        "full_name": "Test User",
        "role": "investor"
    }
    headers = {
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        assert response.status_code == 201, f"Expected status code 201, got {response.status_code}"
        resp_json = response.json()

        # Validate userId field
        assert 'userId' in resp_json, "Response JSON missing 'userId'"
        user_id = resp_json['userId']
        assert user_id and isinstance(user_id, str), "'userId' is empty or not a string"

    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_api_auth_register_with_valid_data_returns_201()
