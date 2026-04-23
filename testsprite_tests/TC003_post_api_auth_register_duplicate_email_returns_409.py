import requests
import time

def test_post_api_auth_register_duplicate_email_returns_409():
    base_url = "http://localhost:3000"
    register_url = f"{base_url}/api/auth/register"
    timestamp = int(time.time() * 1000)
    email = f"duplicateemail+{timestamp}@example.com"
    password = "StrongPass123"
    full_name = "Test User"
    role = "investor"
    headers = {"Content-Type": "application/json"}
    register_payload = {
        "email": email,
        "password": password,
        "full_name": full_name,
        "role": role
    }

    try:
        response1 = requests.post(register_url, json=register_payload, headers=headers, timeout=30)
        assert response1.status_code == 201, f"Expected 201 Created, got {response1.status_code}"
        json_data1 = response1.json()
        assert "userId" in json_data1, "userId not found in registration success response"

        response2 = requests.post(register_url, json=register_payload, headers=headers, timeout=30)
        assert response2.status_code == 409, f"Expected 409 Conflict, got {response2.status_code}"
        json_data2 = response2.json()
        error_message = json_data2.get("error", "").lower()
        assert "email" in error_message and "already exists" in error_message, f"Unexpected error message: {error_message}"
    except requests.RequestException as e:
        assert False, f"Request failed: {str(e)}"


test_post_api_auth_register_duplicate_email_returns_409()