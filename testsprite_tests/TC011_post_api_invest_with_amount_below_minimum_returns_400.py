import requests
import time
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_post_api_invest_with_amount_below_minimum_returns_400():
    timestamp = int(time.time() * 1000)
    # Register new investor user
    register_url = f"{BASE_URL}/api/auth/register"
    email = f"investor_{timestamp}@example.com"
    password = "StrongPass123!"
    full_name = "Test Investor"
    register_payload = {
        "email": email,
        "password": password,
        "fullName": full_name,
        "role": "investor"
    }
    r = requests.post(register_url, json=register_payload, timeout=TIMEOUT)
    assert r.status_code == 201 or r.status_code == 200, f"Registration failed: {r.text}"
    resp_json = r.json()
    assert ("userId" in resp_json) or ("data" in resp_json and "userId" in resp_json.get("data", {})), f"Unexpected registration response: {resp_json}"

    # Login with the registered investor user
    login_url = f"{BASE_URL}/api/auth/login"
    login_payload = {
        "email": email,
        "password": password
    }
    r = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
    assert r.status_code == 200, f"Login failed: {r.text}"
    resp_json = r.json()
    assert resp_json.get("success") is True, f"Login response not successful: {resp_json}"
    token = resp_json.get("data", {}).get("token")
    assert token, "Token not found in login response"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Need a valid active projectId which is NOT owned by the investor
    # Create a new founder user and a project under that founder, then test invest

    # Register founder user
    founder_email = f"founder_{timestamp}@example.com"
    founder_password = "StrongPass123!"
    founder_full_name = "Test Founder"
    founder_register_payload = {
        "email": founder_email,
        "password": founder_password,
        "fullName": founder_full_name,
        "role": "founder"
    }
    r = requests.post(register_url, json=founder_register_payload, timeout=TIMEOUT)
    assert r.status_code == 201 or r.status_code == 200, f"Founder registration failed: {r.text}"
    founder_resp = r.json()
    assert ("userId" in founder_resp) or ("data" in founder_resp and "userId" in founder_resp.get("data", {})), f"Unexpected founder registration response: {founder_resp}"

    # Login founder
    login_payload_founder = {
        "email": founder_email,
        "password": founder_password
    }
    r = requests.post(login_url, json=login_payload_founder, timeout=TIMEOUT)
    assert r.status_code == 200, f"Founder login failed: {r.text}"
    founder_login_resp = r.json()
    assert founder_login_resp.get("success") is True, f"Founder login not successful: {founder_login_resp}"
    founder_token = founder_login_resp.get("data", {}).get("token")
    assert founder_token, "Founder token not found"

    founder_headers = {
        "Authorization": f"Bearer {founder_token}",
        "Content-Type": "application/json"
    }

    # Create a new project by founder for investment
    create_project_url = f"{BASE_URL}/api/projects"
    project_title = f"Test Project {uuid.uuid4()}"
    project_payload = {
        "title": project_title,
        "category": "SaaS",
        "description": "A test project for investment",
        "funding_goal": 50000,
        "min_invest": 1000
    }
    r = requests.post(create_project_url, headers=founder_headers, json=project_payload, timeout=TIMEOUT)
    assert r.status_code == 201, f"Project creation failed: {r.text}"
    project_resp = r.json()
    project_id = None
    if "projectId" in project_resp:
        project_id = project_resp["projectId"]
    elif "data" in project_resp and "projectId" in project_resp["data"]:
        project_id = project_resp["data"]["projectId"]
    else:
        # Try to find project id field in resp json keys
        for key in project_resp:
            if isinstance(project_resp[key], str):
                project_id = project_resp[key]
                break
    assert project_id, f"Project ID not found in project creation response: {project_resp}"

    # Now try to post an investment with amount below minimum (500 SAR)
    invest_url = f"{BASE_URL}/api/invest"
    invest_payload = {
        "projectId": project_id,
        "amount": 500,
        "notes": "Investment below minimum amount"
    }

    try:
        r = requests.post(invest_url, headers=headers, json=invest_payload, timeout=TIMEOUT)
        # Expecting 400 Bad Request
        assert r.status_code == 400, f"Expected 400 status for investment below minimum, got {r.status_code}, response: {r.text}"
        resp_json = r.json()
        assert resp_json.get("success") is False, "Expected success: false for low amount investment"
        error_msg = resp_json.get("error") or resp_json.get("message") or ""
        assert "minimum" in error_msg.lower() or "too low" in error_msg.lower(), f"Expected error message about minimum investment amount, got: {error_msg}"
    finally:
        # Cleanup: delete the project created by founder
        if project_id:
            delete_project_url = f"{BASE_URL}/api/projects/{project_id}"
            try:
                requests.delete(delete_project_url, headers=founder_headers, timeout=TIMEOUT)
            except Exception:
                pass

test_post_api_invest_with_amount_below_minimum_returns_400()
