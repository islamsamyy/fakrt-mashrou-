
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** IDEA BUSINESS
- **Date:** 2026-04-23
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 post api invest create new investment record
- **Test Code:** [TC001_post_api_invest_create_new_investment_record.py](./TC001_post_api_invest_create_new_investment_record.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 187, in <module>
  File "<string>", line 31, in test_post_api_invest_create_new_investment_record
AssertionError: Unexpected investor register status: 400

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5e1c140a-0104-424f-97c8-225ec2edcfba/5f56a2d9-2458-4bcb-97f7-f862d820fdd4
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 post api auth register with valid data returns 200
- **Test Code:** [TC002_post_api_auth_register_with_valid_data_returns_200.py](./TC002_post_api_auth_register_with_valid_data_returns_200.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 34, in <module>
  File "<string>", line 23, in test_post_api_auth_register_with_valid_data_returns_201
AssertionError: Expected status code 201, got 400

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5e1c140a-0104-424f-97c8-225ec2edcfba/c21c7e2a-141a-4ee2-abfd-5565a6001d39
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 post api auth register duplicate email returns 409
- **Test Code:** [TC003_post_api_auth_register_duplicate_email_returns_409.py](./TC003_post_api_auth_register_duplicate_email_returns_409.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 35, in <module>
  File "<string>", line 22, in test_post_api_auth_register_duplicate_email_returns_409
AssertionError: Expected 201 Created, got 400

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5e1c140a-0104-424f-97c8-225ec2edcfba/b5c858fb-a2e9-49b8-bb37-3d501d3eae10
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 post api auth register with plus sign in email is accepted
- **Test Code:** [TC004_post_api_auth_register_with_plus_sign_in_email_is_accepted.py](./TC004_post_api_auth_register_with_plus_sign_in_email_is_accepted.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 29, in <module>
  File "<string>", line 22, in test_post_api_auth_register_with_plus_sign
AssertionError: Expected status code 201, got 400

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5e1c140a-0104-424f-97c8-225ec2edcfba/402af381-7ba1-47e4-9559-5361569a07bf
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 post api auth register missing required fields returns 400
- **Test Code:** [TC005_post_api_auth_register_missing_required_fields_returns_400.py](./TC005_post_api_auth_register_missing_required_fields_returns_400.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5e1c140a-0104-424f-97c8-225ec2edcfba/9e889fb9-b849-42c9-8f96-deab5e3876cf
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 post api auth login with correct credentials returns 200 and token
- **Test Code:** [TC006_post_api_auth_login_with_correct_credentials_returns_200_and_token.py](./TC006_post_api_auth_login_with_correct_credentials_returns_200_and_token.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 61, in <module>
  File "<string>", line 29, in test_post_api_auth_login_with_correct_credentials_returns_200_and_token
AssertionError: Expected 201 Created but got 400

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5e1c140a-0104-424f-97c8-225ec2edcfba/a8cf81a9-8dfc-4147-8bac-45d2b6ea6c7d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 post api auth login with wrong password returns 401
- **Test Code:** [TC007_post_api_auth_login_with_wrong_password_returns_401.py](./TC007_post_api_auth_login_with_wrong_password_returns_401.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 56, in <module>
  File "<string>", line 28, in test_post_api_auth_login_with_wrong_password_returns_401
AssertionError: Expected 201 on register but got 400, response: {"success":false,"error":"فشل التسجيل. يرجى المحاولة مرة أخرى","statusCode":400}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5e1c140a-0104-424f-97c8-225ec2edcfba/38c61fe2-992c-4a67-9269-374fc24f5ba1
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 post api auth login with non-existent email returns 401
- **Test Code:** [TC008_post_api_auth_login_with_non_existent_email_returns_401.py](./TC008_post_api_auth_login_with_non_existent_email_returns_401.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5e1c140a-0104-424f-97c8-225ec2edcfba/69c8665e-fc27-4d1b-acea-490ad498292f
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 post api auth login with empty email returns 400
- **Test Code:** [TC009_post_api_auth_login_with_empty_email_returns_400.py](./TC009_post_api_auth_login_with_empty_email_returns_400.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5e1c140a-0104-424f-97c8-225ec2edcfba/9189faa1-89ee-4e2d-8796-07f6d69bc206
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 post api auth login with empty password returns 400
- **Test Code:** [TC010_post_api_auth_login_with_empty_password_returns_400.py](./TC010_post_api_auth_login_with_empty_password_returns_400.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 52, in <module>
  File "<string>", line 27, in test_post_api_auth_login_with_empty_password_returns_400
AssertionError: User registration failed: {"success":false,"error":"فشل التسجيل. يرجى المحاولة مرة أخرى","statusCode":400}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5e1c140a-0104-424f-97c8-225ec2edcfba/02e1e392-97e1-4450-82ea-581b4709f922
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011 post api invest with amount below minimum returns 400
- **Test Code:** [TC011_post_api_invest_with_amount_below_minimum_returns_400.py](./TC011_post_api_invest_with_amount_below_minimum_returns_400.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 130, in <module>
  File "<string>", line 22, in test_post_api_invest_with_amount_below_minimum_returns_400
AssertionError: Registration failed: {"success":false,"error":"فشل التسجيل. يرجى المحاولة مرة أخرى","statusCode":400}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5e1c140a-0104-424f-97c8-225ec2edcfba/e9c91c8b-0339-4a51-b593-1517fcface95
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 post api invest with amount above maximum returns 400
- **Test Code:** [TC012_post_api_invest_with_amount_above_maximum_returns_400.py](./TC012_post_api_invest_with_amount_above_maximum_returns_400.py)
- **Test Error:** Traceback (most recent call last):
  File "<string>", line 29, in test_post_api_invest_with_amount_above_maximum_returns_400
AssertionError: Registration failed with status 400, response: {"success":false,"error":"فشل التسجيل. يرجى المحاولة مرة أخرى","statusCode":400}

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 102, in <module>
  File "<string>", line 34, in test_post_api_invest_with_amount_above_maximum_returns_400
AssertionError: Failed to register user: Registration failed with status 400, response: {"success":false,"error":"فشل التسجيل. يرجى المحاولة مرة أخرى","statusCode":400}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5e1c140a-0104-424f-97c8-225ec2edcfba/c256717f-db1e-4e0f-9734-c5406f59cc22
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 post api invest without authentication returns 401
- **Test Code:** [TC013_post_api_invest_without_authentication_returns_401.py](./TC013_post_api_invest_without_authentication_returns_401.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5e1c140a-0104-424f-97c8-225ec2edcfba/8d3e5c48-a689-4268-8d2e-180d06b11599
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014 post api invest with missing projectId returns 400
- **Test Code:** [TC014_post_api_invest_with_missing_projectId_returns_400.py](./TC014_post_api_invest_with_missing_projectId_returns_400.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 55, in <module>
  File "<string>", line 24, in test_post_api_invest_with_missing_projectId_returns_400
AssertionError: Unexpected register status: 400

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5e1c140a-0104-424f-97c8-225ec2edcfba/97a79936-c61b-491f-92b0-026299dc3713
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015 get public pages return 200 without authentication
- **Test Code:** [TC015_get_public_pages_return_200_without_authentication.py](./TC015_get_public_pages_return_200_without_authentication.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5e1c140a-0104-424f-97c8-225ec2edcfba/beddb1cd-fdc4-4eeb-957e-e7d2b5610b3f
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016 get protected pages redirect unauthenticated users to login
- **Test Code:** [TC016_get_protected_pages_redirect_unauthenticated_users_to_login.py](./TC016_get_protected_pages_redirect_unauthenticated_users_to_login.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5e1c140a-0104-424f-97c8-225ec2edcfba/c95ad3e6-39b9-4f4b-b9f8-3f1ca449c477
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **37.50** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---