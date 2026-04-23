import requests
import time

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_post_api_invest_with_amount_above_maximum_returns_400():
    timestamp = int(time.time() * 1000)
    register_url = f"{BASE_URL}/api/auth/register"
    login_url = f"{BASE_URL}/api/auth/login"
    invest_url = f"{BASE_URL}/api/invest"
    projects_url = f"{BASE_URL}/api/opportunities?limit=1"

    # Generate unique email for registration
    email = f"investor_{timestamp}@example.com"
    password = "StrongPass123"
    full_name = "Test Investor"

    # Step 1: Register new investor user
    register_payload = {
        "email": email,
        "password": password,
        "fullName": full_name,
        "role": "investor"
    }
    try:
        r = requests.post(register_url, json=register_payload, timeout=TIMEOUT)
        assert r.status_code in (200, 201), f"Registration failed with status {r.status_code}, response: {r.text}"
        response_json = r.json()
        assert response_json.get("success", True), f"Registration response success false: {response_json}"

    except Exception as e:
        raise AssertionError(f"Failed to register user: {e}")

    # Step 2: Login with registered user
    login_payload = {
        "email": email,
        "password": password
    }
    try:
        r = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert r.status_code == 200, f"Login failed with status {r.status_code}, response: {r.text}"
        response_json = r.json()
        assert response_json.get("success") is True, f"Login success false: {response_json}"
        token = response_json.get("data", {}).get("access_token")
        assert token and isinstance(token, str), "Token missing or invalid in login response"
    except Exception as e:
        raise AssertionError(f"Failed to login user: {e}")

    headers = {"Authorization": f"Bearer {token}"}

    # Step 3: Get a valid projectId from public opportunities endpoint for investment
    try:
        r = requests.get(projects_url, headers=headers, timeout=TIMEOUT)
        assert r.status_code == 200, f"Failed to get opportunities with status {r.status_code}, response: {r.text}"
        opportunities = r.json()
        projects_list = None
        if isinstance(opportunities, dict):
            for key in ("data", "projects", "items", "opportunities"):
                if key in opportunities and isinstance(opportunities[key], list):
                    projects_list = opportunities[key]
                    break
            if projects_list is None:
                if isinstance(opportunities, list):
                    projects_list = opportunities
        elif isinstance(opportunities, list):
            projects_list = opportunities
        else:
            projects_list = None

        assert projects_list and len(projects_list) > 0, "No project found in opportunities"

        project = projects_list[0]
        project_id = None
        for key in ("id", "projectId", "project_id"):
            if key in project and isinstance(project[key], str) and project[key].strip():
                project_id = project[key]
                break
        assert project_id, "Valid projectId not found in project data"
    except Exception as e:
        raise AssertionError(f"Failed to obtain a valid projectId: {e}")

    # Step 4: Attempt invest with amount above maximum (20,000,000 SAR)
    invest_payload = {
        "projectId": project_id,
        "amount": 20000000
    }
    try:
        r = requests.post(invest_url, json=invest_payload, headers=headers, timeout=TIMEOUT)
        assert r.status_code == 400, f"Expected 400 but got {r.status_code}, response: {r.text}"
        resp_json = r.json()
        assert resp_json.get("success") is False, f"Expected success=false in response, got: {resp_json.get('success')}"
        error_message = resp_json.get("error", "").lower()
        assert error_message and ("maximum" in error_message or "max" in error_message or "amount" in error_message), (
            f"Expected error message about maximum investment amount, got: {resp_json.get('error')}"
        )
    except Exception as e:
        raise AssertionError(f"Invest API call with amount above max failed validation: {e}")


test_post_api_invest_with_amount_above_maximum_returns_400()
