import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_get_public_pages_return_200_without_authentication():
    public_paths = [
        "/",
        "/discover",
        "/trending",
        "/leaderboard",
        "/login",
        "/register",
        "/terms",
        "/privacy"
    ]

    for path in public_paths:
        url = BASE_URL + path
        try:
            response = requests.get(url, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"Request to {url} failed with exception: {e}"
        assert response.status_code == 200, f"Expected 200 for {url}, got {response.status_code}"

test_get_public_pages_return_200_without_authentication()