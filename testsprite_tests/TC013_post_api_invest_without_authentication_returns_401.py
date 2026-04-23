import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_post_api_invest_without_authentication_returns_401():
    url = f"{BASE_URL}/api/invest"
    payload = {
        "projectId": "00000000-0000-0000-0000-000000000000",  # Placeholder UUID, assuming format required
        "amount": 5000
    }
    headers = {
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed with exception: {e}"
    assert response.status_code == 401, f"Expected status code 401, got {response.status_code}"
    try:
        response_json = response.json()
    except ValueError:
        assert False, "Response is not a valid JSON"
    assert response_json.get("success") is False, "Expected success: false in response"
    
test_post_api_invest_without_authentication_returns_401()