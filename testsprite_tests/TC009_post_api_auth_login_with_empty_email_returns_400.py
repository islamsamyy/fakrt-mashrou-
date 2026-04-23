import requests

BASE_URL = "http://localhost:3000"
LOGIN_ENDPOINT = "/api/auth/login"
TIMEOUT = 30

def test_post_api_auth_login_with_empty_email_returns_400():
    url = BASE_URL + LOGIN_ENDPOINT
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "email": "",
        "password": "somepassword"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    
    try:
        resp_json = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert resp_json.get("success") is False, f"Expected success: false, got {resp_json.get('success')}"
    error_message = resp_json.get("error", "")
    assert error_message != "", "Error message is missing"
    # Arabic error message likely includes "email" required indication in Arabic
    # Just check that error message contains Arabic word for email or required (بريد or مطلوب)
    arabic_keywords = ["البريد", "الايميل", "مطلوب", "حقل البريد", "حقل الايميل"]
    assert any(keyword in error_message for keyword in arabic_keywords), (
        f"Error message does not appear to indicate email is required in Arabic: {error_message}"
    )

test_post_api_auth_login_with_empty_email_returns_400()