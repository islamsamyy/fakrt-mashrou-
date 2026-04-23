import requests

def test_get_protected_pages_redirect_unauthenticated():
    base_url = "http://localhost:3000"
    protected_paths = [
        "/dashboard/investor",
        "/dashboard/founder",
        "/portfolio",
        "/saved",
        "/settings",
        "/notifications"
    ]
    timeout = 30

    session = requests.Session()
    # Ensure no authentication cookies or headers present
    session.cookies.clear()
    headers = {}

    for path in protected_paths:
        url = base_url + path
        try:
            response = session.get(url, headers=headers, timeout=timeout, allow_redirects=False)
        except requests.RequestException as e:
            assert False, f"Request to {url} failed with exception: {e}"

        # Check if the response is a 307, 302 or 303 redirect to /login
        if response.status_code in (307, 302, 303):
            location = response.headers.get('Location', '')
            assert location.endswith("/login") or "/login" in location, (
                f"Redirect location for {url} does not contain '/login': {location}"
            )
        elif response.status_code == 401:
            # Unauthorized is acceptable for unauthenticated requests
            pass
        elif response.status_code == 200:
            # Some servers may serve login page directly on 200 response
            # So check if final URL contains '/login'
            final_url = response.url
            assert "/login" in final_url or final_url == url, (
                f"Unauthenticated request to {url} returned 200 but final URL or content does not indicate login page. Final URL: {final_url}"
            )
        else:
            # Not a redirect nor 401 or 200, try following redirects
            try:
                response_follow = session.get(url, headers=headers, timeout=timeout, allow_redirects=True)
            except requests.RequestException as e:
                assert False, f"Follow request to {url} failed with exception: {e}"

            # The final URL after redirects should contain /login
            final_url = response_follow.url
            assert "/login" in final_url, (
                f"Unauthenticated request to {url} did not redirect to login. Final URL: {final_url}"
            )
            assert response_follow.status_code in (200, 302, 303), (
                f"Unexpected status code {response_follow.status_code} for final response at {final_url}"
            )

test_get_protected_pages_redirect_unauthenticated()