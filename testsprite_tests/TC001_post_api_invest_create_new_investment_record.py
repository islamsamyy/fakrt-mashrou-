import requests
import time

BASE_URL = "http://localhost:3000"
REGISTER_URL = f"{BASE_URL}/api/auth/register"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
PROJECTS_URL = f"{BASE_URL}/api/projects"
INVEST_URL = f"{BASE_URL}/api/invest"

TIMEOUT = 30


def test_post_api_invest_create_new_investment_record():
    timestamp = int(time.time() * 1000)
    investor_email = f"investor{timestamp}@example.com"
    investor_password = "StrongPass123"
    founder_email = f"founder{timestamp}@example.com"
    founder_password = "StrongPass123"
    headers = {"Content-Type": "application/json"}

    # Register investor user
    investor_register_payload = {
        "email": investor_email,
        "password": investor_password,
        "full_name": "Investor User",
        "role": "investor"
    }
    r = requests.post(
        REGISTER_URL, json=investor_register_payload, headers=headers, timeout=TIMEOUT
    )
    assert r.status_code == 201 or r.status_code == 200, f"Unexpected investor register status: {r.status_code}"
    investor_user_id = r.json().get("userId") or r.json().get("data", {}).get("id")

    # Register founder user
    founder_register_payload = {
        "email": founder_email,
        "password": founder_password,
        "full_name": "Founder User",
        "role": "founder"
    }
    r = requests.post(
        REGISTER_URL, json=founder_register_payload, headers=headers, timeout=TIMEOUT
    )
    assert r.status_code == 201 or r.status_code == 200, f"Unexpected founder register status: {r.status_code}"
    founder_user_id = r.json().get("userId") or r.json().get("data", {}).get("id")

    # Login investor
    investor_login_payload = {"email": investor_email, "password": investor_password}
    r = requests.post(
        LOGIN_URL, json=investor_login_payload, headers=headers, timeout=TIMEOUT
    )
    assert r.status_code == 200, f"Investor login failed with status: {r.status_code}"
    invest_data = r.json()
    assert invest_data.get("success") is True
    investor_token = invest_data.get("data", {}).get("access_token") or invest_data.get("access_token")
    assert investor_token

    # Login founder
    founder_login_payload = {"email": founder_email, "password": founder_password}
    r = requests.post(
        LOGIN_URL, json=founder_login_payload, headers=headers, timeout=TIMEOUT
    )
    assert r.status_code == 200, f"Founder login failed with status: {r.status_code}"
    founder_data = r.json()
    assert founder_data.get("success") is True
    founder_token = founder_data.get("data", {}).get("access_token") or founder_data.get("access_token")
    assert founder_token

    # Create project as founder (active status)
    project_payload = {
        "title": f"Test Project {timestamp}",
        "category": "FinTech",
        "description": "Test project for investment",
        "funding_goal": 50000,
        "min_invest": 1000,
    }
    headers_founder = {
        "Authorization": f"Bearer {founder_token}",
        "Content-Type": "application/json",
    }
    r = requests.post(
        PROJECTS_URL, json=project_payload, headers=headers_founder, timeout=TIMEOUT
    )
    assert r.status_code == 201, f"Project creation failed status: {r.status_code}, response: {r.text}"
    project_id = r.json().get("projectId") or r.json().get("data", {}).get("id")
    assert project_id

    created_investment_ids = []

    try:
        # --- Success Case ---
        headers_investor = {
            "Authorization": f"Bearer {investor_token}",
            "Content-Type": "application/json",
        }
        invest_payload = {"projectId": project_id, "amount": 5000, "notes": "Test investment"}
        r = requests.post(
            INVEST_URL, json=invest_payload, headers=headers_investor, timeout=TIMEOUT
        )
        assert r.status_code == 201, f"Investment creation failed: {r.status_code}, {r.text}"
        res_json = r.json()
        assert res_json.get("success") is True
        data = res_json.get("data", {})
        investment_id = data.get("investmentId")
        assert investment_id
        created_investment_ids.append(investment_id)
        assert data.get("projectId") == project_id
        assert data.get("amount") == 5000
        assert data.get("status") == "pending"

        # --- Error Cases ---

        # 400: invalid projectId (random string)
        invalid_payload = {"projectId": "invalid-project-id", "amount": 5000}
        r = requests.post(
            INVEST_URL, json=invalid_payload, headers=headers_investor, timeout=TIMEOUT
        )
        assert r.status_code == 400
        res_json = r.json()
        assert res_json.get("success") is False

        # 400: amount below range (500 < 1000)
        low_amount_payload = {"projectId": project_id, "amount": 500}
        r = requests.post(
            INVEST_URL, json=low_amount_payload, headers=headers_investor, timeout=TIMEOUT
        )
        assert r.status_code == 400
        res_json = r.json()
        assert res_json.get("success") is False

        # 400: amount above range (20000000 > 10000000)
        high_amount_payload = {"projectId": project_id, "amount": 20000000}
        r = requests.post(
            INVEST_URL, json=high_amount_payload, headers=headers_investor, timeout=TIMEOUT
        )
        assert r.status_code == 400
        res_json = r.json()
        assert res_json.get("success") is False

        # 403: investor trying to invest in own project (founder tries)
        headers_founder_auth = {
            "Authorization": f"Bearer {founder_token}",
            "Content-Type": "application/json",
        }
        own_invest_payload = {"projectId": project_id, "amount": 5000}
        r = requests.post(
            INVEST_URL, json=own_invest_payload, headers=headers_founder_auth, timeout=TIMEOUT
        )
        assert r.status_code == 403
        res_json = r.json()
        assert res_json.get("success") is False

        # 401: unauthenticated access (no Authorization header)
        unauth_payload = {"projectId": project_id, "amount": 5000}
        r = requests.post(
            INVEST_URL, json=unauth_payload, timeout=TIMEOUT
        )
        assert r.status_code == 401
        res_json = r.json()
        assert res_json.get("success") is False

        # 404: project not found (UUID does not exist)
        not_found_payload = {"projectId": "00000000-0000-0000-0000-000000000000", "amount": 5000}
        r = requests.post(
            INVEST_URL, json=not_found_payload, headers=headers_investor, timeout=TIMEOUT
        )
        assert r.status_code == 404
        res_json = r.json()
        assert res_json.get("success") is False

        # 409: duplicate investment attempt (same projectId and investor)
        r = requests.post(
            INVEST_URL, json=invest_payload, headers=headers_investor, timeout=TIMEOUT
        )
        # Accept both 409 or failed with message about duplicate
        assert r.status_code == 409 or (r.status_code >= 400 and r.status_code < 500)
        res_json = r.json()
        assert res_json.get("success") is False

    finally:
        # Cleanup: delete created investments and project if possible
        # Cannot delete investments or projects with available endpoints, so skipping actual deletion
        # Assuming environment will reset or has data isolation
        pass


test_post_api_invest_create_new_investment_record()
