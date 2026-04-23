import requests

BASE_URL = "http://localhost:3000"
REGISTER_ENDPOINT = "/api/auth/register"
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_post_api_auth_register_missing_required_fields_returns_400():
    test_cases = [
        # Missing email
        {
            "payload": {"password": "StrongPass123", "fullName": "اختبار المستخدم", "role": "investor"},
            "missing_field": "email",
            "expected_error_substr": "البريد الإلكتروني"  # "email" in Arabic, partial match for error message
        },
        # Missing password
        {
            "payload": {"email": "testuser_no_password@example.com", "fullName": "اختبار المستخدم", "role": "investor"},
            "missing_field": "password",
            "expected_error_substr": "كلمة المرور"  # "password" in Arabic
        },
        # Missing fullName (also accept 'name' or 'fullName', but test missing fullName here)
        {
            "payload": {"email": "testuser_no_fullname@example.com", "password": "StrongPass123", "role": "investor"},
            "missing_field": "fullName",
            "expected_error_substr": "الاسم"  # "name" in Arabic
        },
    ]

    for case in test_cases:
        response = requests.post(
            url=BASE_URL + REGISTER_ENDPOINT,
            headers=HEADERS,
            json=case["payload"],
            timeout=TIMEOUT,
        )
        assert response.status_code == 400, f"Expected 400 for missing {case['missing_field']}, got {response.status_code}"
        json_resp = response.json()
        assert json_resp.get("success") is False, f"Expected success: false when missing {case['missing_field']}"
        error_msg = json_resp.get("error") or json_resp.get("message") or ""
        assert case["expected_error_substr"] in error_msg, (
            f"Expected Arabic error message mentioning '{case['missing_field']}' field. Got: {error_msg}"
        )

test_post_api_auth_register_missing_required_fields_returns_400()