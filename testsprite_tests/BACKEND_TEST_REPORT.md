# Backend API Test Report

**Date**: 2026-04-24T01:43:01.137Z
**Total Tests**: 12
**Passed**: 9 ✅
**Failed**: 3 ❌
**Success Rate**: 75.00%

## Test Results


### auth_register_success
- **Name**: Register new user with valid data
- **Status**: FAIL
- **Expected**: 201
- **Actual**: 500
- **Duration**: 423ms
- **Error**: Expected 201, got 500


### auth_register_missing_email
- **Name**: Register without email
- **Status**: PASS
- **Expected**: 400
- **Actual**: 400
- **Duration**: 13ms



### auth_register_missing_password
- **Name**: Register without password
- **Status**: PASS
- **Expected**: 400
- **Actual**: 400
- **Duration**: 14ms



### auth_register_missing_fullname
- **Name**: Register without full name
- **Status**: PASS
- **Expected**: 400
- **Actual**: 400
- **Duration**: 11ms



### auth_register_weak_password
- **Name**: Register with weak password (< 8 chars)
- **Status**: FAIL
- **Expected**: 400
- **Actual**: 500
- **Duration**: 198ms
- **Error**: Expected 400, got 500


### auth_register_invalid_email
- **Name**: Register with invalid email format
- **Status**: FAIL
- **Expected**: 400
- **Actual**: 500
- **Duration**: 285ms
- **Error**: Expected 400, got 500


### auth_register_invalid_role
- **Name**: Register with invalid role (admin)
- **Status**: PASS
- **Expected**: 400
- **Actual**: 400
- **Duration**: 27ms



### auth_login_missing_email
- **Name**: Login without email
- **Status**: PASS
- **Expected**: 400
- **Actual**: 400
- **Duration**: 14ms



### auth_login_missing_password
- **Name**: Login without password
- **Status**: PASS
- **Expected**: 400
- **Actual**: 400
- **Duration**: 14ms



### auth_login_invalid_credentials
- **Name**: Login with wrong credentials
- **Status**: PASS
- **Expected**: 401
- **Actual**: 401
- **Duration**: 110ms



### invest_no_auth
- **Name**: Invest without authentication
- **Status**: PASS
- **Expected**: 401
- **Actual**: 401
- **Duration**: 23ms



### match_no_auth
- **Name**: Get matches without authentication
- **Status**: PASS
- **Expected**: 401
- **Actual**: 401
- **Duration**: 32ms



## Summary

⚠️ 3 test(s) failed. Review errors above and fix issues.
