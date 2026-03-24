// FullBeat — Test Case Repository Module

let allTestCases = [];
let filteredTestCases = [];
let editingTestCaseId = null;
let expandedRowId = null;
let debounceTimer = null;

// ── Mock Data (DEV_MODE) ──────────────────────────────────────────────
function getMockTestCases() {
    return [
    {
        "id": "tc-bb-001",
        "tc_index": "TC-001",
        "module": "Registration",
        "category": "functional",
        "scenario": "Register with valid email",
        "steps": "1.Navigate to `/auth/register`\n2.Enter `testuser@gmail.com`\n3.Click \"Send Verification Email\"",
        "expected_result": "Loading spinner shows \u00e2\u2020\u2019  Toast \"Email sent\" \u00e2\u2020\u2019  Button changes to \"Resend in 60s\" \u00e2\u2020\u2019  Check email inbox for verification link",
        "preconditions": "Browser open, not logged in",
        "test_data": "Priority: P0 | Original ID: REG-001",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-002",
        "tc_index": "TC-002",
        "module": "Registration",
        "category": "negative",
        "scenario": "Register with invalid email",
        "steps": "1.Enter `notanemail`\n2.Click send",
        "expected_result": "Validation error: \"Email is required\" or HTML5 email validation blocks submit",
        "preconditions": "On register page",
        "test_data": "Priority: P1 | Original ID: REG-002",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-003",
        "tc_index": "TC-003",
        "module": "Registration",
        "category": "negative",
        "scenario": "Register with existing email",
        "steps": "1.Enter already-registered email\n2.Click send",
        "expected_result": "Error: \"This email is already registered. Please login instead.\"",
        "preconditions": "On register page, email already registered",
        "test_data": "Priority: P1 | Original ID: REG-003",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-004",
        "tc_index": "TC-004",
        "module": "Registration",
        "category": "functional",
        "scenario": "Resend email after 60s cooldown",
        "steps": "1.Wait 60 seconds\n2.Click \"Resend Verification Email\"",
        "expected_result": "New email sent, countdown resets to 60s",
        "preconditions": "Email sent, waiting",
        "test_data": "Priority: P2 | Original ID: REG-004",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-005",
        "tc_index": "TC-005",
        "module": "Registration",
        "category": "negative",
        "scenario": "Resend before cooldown expires",
        "steps": "1.Immediately click resend",
        "expected_result": "Button disabled, shows countdown \"Resend in Xs\"",
        "preconditions": "Email just sent",
        "test_data": "Priority: P2 | Original ID: REG-005",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-006",
        "tc_index": "TC-006",
        "module": "Registration",
        "category": "sanity",
        "scenario": "Mobile layout check",
        "steps": "1.Open register page on mobile",
        "expected_result": "Form centered, no horizontal scroll, \"Why BrainBoot?\" accordion visible",
        "preconditions": "Mobile device 375px",
        "test_data": "Priority: P2 | Original ID: REG-006",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-007",
        "tc_index": "TC-007",
        "module": "Registration",
        "category": "functional",
        "scenario": "Click valid activation link",
        "steps": "1.Open email\n2.Click activation link",
        "expected_result": "Page loads \u00e2\u2020\u2019  Spinner \"Validating...\" \u00e2\u2020\u2019  Green checkmark \"Email Verified!\" \u00e2\u2020\u2019  Face capture countdown (10 min) \u00e2\u2020\u2019  \"Continue to Face Registration\" button",
        "preconditions": "Verification email received",
        "test_data": "Priority: P0 | Original ID: REG-010",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-008",
        "tc_index": "TC-008",
        "module": "Registration",
        "category": "negative",
        "scenario": "Click expired activation link (>10 min)",
        "steps": "1.Click link after 10 min",
        "expected_result": "Yellow X \u00e2\u2020\u2019  \"Link Expired\" \u00e2\u2020\u2019  \"Request New Link\" button",
        "preconditions": "Wait 10+ minutes after email",
        "test_data": "Priority: P1 | Original ID: REG-011",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-009",
        "tc_index": "TC-009",
        "module": "Registration",
        "category": "negative",
        "scenario": "Click activation link twice",
        "steps": "1.Click same link again",
        "expected_result": "Blue checkmark \u00e2\u2020\u2019  \"Already Activated\" \u00e2\u2020\u2019  \"Continue Enrollment\" + \"Go to Login\" buttons",
        "preconditions": "Already activated",
        "test_data": "Priority: P1 | Original ID: REG-012",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-010",
        "tc_index": "TC-010",
        "module": "Registration",
        "category": "negative",
        "scenario": "Tampered activation link",
        "steps": "1.Change token characters in URL\n2.Load page",
        "expected_result": "Red X \u00e2\u2020\u2019  \"Invalid Link\" \u00e2\u2020\u2019  \"Start Over\" button",
        "preconditions": "Modify token in URL",
        "test_data": "Priority: P2 | Original ID: REG-013",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-011",
        "tc_index": "TC-011",
        "module": "Registration",
        "category": "functional",
        "scenario": "Successful face capture",
        "steps": "1.Allow camera access\n2.Position face in center circle\n3.Click \"Capture Photo\"",
        "expected_result": "\"Processing face...\" spinner \u00e2\u2020\u2019  \"Face captured successfully!\" \u00e2\u2020\u2019  Auto-advance to profile form",
        "preconditions": "Email verified, on face capture stage",
        "test_data": "Priority: P0 | Original ID: REG-020",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-012",
        "tc_index": "TC-012",
        "module": "Registration",
        "category": "negative",
        "scenario": "Deny camera permission",
        "steps": "1.Click \"Block\" on camera permission dialog",
        "expected_result": "Error message about camera required, instructions to enable",
        "preconditions": "On face capture stage",
        "test_data": "Priority: P1 | Original ID: REG-021",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-013",
        "tc_index": "TC-013",
        "module": "Registration",
        "category": "negative",
        "scenario": "No face in frame",
        "steps": "1.Cover camera or point away",
        "expected_result": "\"Capture Photo\" button stays disabled, instruction: \"Position your face in the center\"",
        "preconditions": "Camera active",
        "test_data": "Priority: P2 | Original ID: REG-022",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-014",
        "tc_index": "TC-014",
        "module": "Registration",
        "category": "negative",
        "scenario": "Face capture timeout (10 min)",
        "steps": "1.Do nothing for 10 minutes",
        "expected_result": "\"Face capture window expired. Please restart.\" \u00e2\u2020\u2019  Session expired state",
        "preconditions": "Wait on face stage",
        "test_data": "Priority: P2 | Original ID: REG-023",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-015",
        "tc_index": "TC-015",
        "module": "Registration",
        "category": "sanity",
        "scenario": "Face capture on mobile",
        "steps": "1.Open face capture on phone",
        "expected_result": "Camera fills card area, capture button reachable, no overflow",
        "preconditions": "Mobile device",
        "test_data": "Priority: P2 | Original ID: REG-024",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-016",
        "tc_index": "TC-016",
        "module": "Registration",
        "category": "functional",
        "scenario": "Complete profile with all required fields",
        "steps": "1.Enter First Name: \"Priya\"\n2.Enter Last Name: \"Sharma\"\n3.Select State: \"Tamil Nadu\"\n4.Select NEET Target Year: \"2026\"\n5.Check \"I agree to Terms\"\n6.Enter password (8+ chars, 1 uppercase, 1 number)\n7.Confirm password\n8.Click \"Create Account\"",
        "expected_result": "Spinner \"Creating account...\" \u00e2\u2020\u2019  Account created \u00e2\u2020\u2019  Auto sign-in \u00e2\u2020\u2019  Redirected to dashboard",
        "preconditions": "Face captured",
        "test_data": "Priority: P0 | Original ID: REG-030",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-017",
        "tc_index": "TC-017",
        "module": "Registration",
        "category": "negative",
        "scenario": "Submit without first name",
        "steps": "1.Leave First Name empty\n2.Fill everything else\n3.Click submit",
        "expected_result": "Validation: \"At least 2 characters\" under First Name field",
        "preconditions": "On profile form",
        "test_data": "Priority: P1 | Original ID: REG-031",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-018",
        "tc_index": "TC-018",
        "module": "Registration",
        "category": "negative",
        "scenario": "Submit without accepting terms",
        "steps": "1.Click \"Create Account\"",
        "expected_result": "Error: \"You must accept the terms\"",
        "preconditions": "All fields filled, terms unchecked",
        "test_data": "Priority: P1 | Original ID: REG-032",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-019",
        "tc_index": "TC-019",
        "module": "Registration",
        "category": "negative",
        "scenario": "Password too short",
        "steps": "1.Enter password \"abc\"\n2.Confirm \"abc\"",
        "expected_result": "Password strength indicators all red: \"8+ chars\" \u00e2\u0153\u2014, submit blocked",
        "preconditions": "On profile form",
        "test_data": "Priority: P1 | Original ID: REG-033",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-020",
        "tc_index": "TC-020",
        "module": "Registration",
        "category": "negative",
        "scenario": "Passwords don't match",
        "steps": "1.Enter \"Password1\"\n2.Confirm \"Password2\"",
        "expected_result": "Validation: \"Passwords do not match\", \"Match\" indicator red",
        "preconditions": "On profile form",
        "test_data": "Priority: P1 | Original ID: REG-034",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-021",
        "tc_index": "TC-021",
        "module": "Registration",
        "category": "functional",
        "scenario": "Referral code accepted",
        "steps": "1.Enter valid referral code `BB-ABC123`",
        "expected_result": "Green text: \"Referral code accepted!\"",
        "preconditions": "On profile form",
        "test_data": "Priority: P2 | Original ID: REG-035",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-022",
        "tc_index": "TC-022",
        "module": "Registration",
        "category": "negative",
        "scenario": "Invalid referral code",
        "steps": "1.Enter `INVALID123`",
        "expected_result": "Red text: \"Referral code not found\"",
        "preconditions": "On profile form",
        "test_data": "Priority: P2 | Original ID: REG-036",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-023",
        "tc_index": "TC-023",
        "module": "Registration",
        "category": "functional",
        "scenario": "Auto-save draft on refresh",
        "steps": "1.Fill first name + state\n2.Refresh page",
        "expected_result": "Form fields restored from draft (localStorage)",
        "preconditions": "Partially filled form",
        "test_data": "Priority: P2 | Original ID: REG-037",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-024",
        "tc_index": "TC-024",
        "module": "Registration",
        "category": "negative",
        "scenario": "Phone already registered",
        "steps": "1.Enter phone linked to another account\n2.Submit",
        "expected_result": "Error: \"This mobile number is already registered\"",
        "preconditions": "On profile form",
        "test_data": "Priority: P2 | Original ID: REG-038",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-025",
        "tc_index": "TC-025",
        "module": "Registration",
        "category": "sanity",
        "scenario": "Profile form mobile layout",
        "steps": "1.Open profile form on mobile",
        "expected_result": "Fields stack vertically, all inputs full-width, submit button visible without scrolling",
        "preconditions": "Mobile 375px",
        "test_data": "Priority: P2 | Original ID: REG-039",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-026",
        "tc_index": "TC-026",
        "module": "Login",
        "category": "functional",
        "scenario": "Login with correct credentials",
        "steps": "1.Navigate to `/auth/login`\n2.Enter email\n3.Enter password\n4.Click \"Login\"",
        "expected_result": "Spinner \"Logging in...\" \u00e2\u2020\u2019  Session gate check \u00e2\u2020\u2019  Dashboard loads",
        "preconditions": "Registered account exists",
        "test_data": "Priority: P0 | Original ID: LOG-001",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-027",
        "tc_index": "TC-027",
        "module": "Login",
        "category": "negative",
        "scenario": "Login with wrong password",
        "steps": "1.Enter correct email\n2.Enter wrong password\n3.Click \"Login\"",
        "expected_result": "Red error box: \"Invalid email or password\"",
        "preconditions": "Registered account",
        "test_data": "Priority: P0 | Original ID: LOG-002",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-028",
        "tc_index": "TC-028",
        "module": "Login",
        "category": "negative",
        "scenario": "Login with non-existent email",
        "steps": "1.Enter `nobody@example.com`\n2.Enter any password\n3.Click \"Login\"",
        "expected_result": "Error: \"Invalid email or password\" (same message \u00e2\u20ac\u201d no email enumeration)",
        "preconditions": "On login page",
        "test_data": "Priority: P1 | Original ID: LOG-003",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-029",
        "tc_index": "TC-029",
        "module": "Login",
        "category": "negative",
        "scenario": "Login with empty fields",
        "steps": "1.Click \"Login\" with both fields empty",
        "expected_result": "Validation errors under each field",
        "preconditions": "On login page",
        "test_data": "Priority: P1 | Original ID: LOG-004",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-030",
        "tc_index": "TC-030",
        "module": "Login",
        "category": "functional",
        "scenario": "Show/hide password toggle",
        "steps": "1.Type password\n2.Click eye icon",
        "expected_result": "Password toggles between dots and plain text",
        "preconditions": "On login page",
        "test_data": "Priority: P2 | Original ID: LOG-005",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-031",
        "tc_index": "TC-031",
        "module": "Login",
        "category": "functional",
        "scenario": "\"Forgot password?\" link works",
        "steps": "1.Click \"Forgot password?\"",
        "expected_result": "Navigates to `/auth/forgot-password`",
        "preconditions": "On login page",
        "test_data": "Priority: P2 | Original ID: LOG-006",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-032",
        "tc_index": "TC-032",
        "module": "Login",
        "category": "functional",
        "scenario": "\"Register Now\" link works",
        "steps": "1.Click \"Register Now\"",
        "expected_result": "Navigates to `/auth/register`",
        "preconditions": "On login page",
        "test_data": "Priority: P2 | Original ID: LOG-007",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-033",
        "tc_index": "TC-033",
        "module": "Login",
        "category": "sanity",
        "scenario": "Login page mobile layout",
        "steps": "1.Open login page on mobile",
        "expected_result": "Left panel hidden, form centered, logo visible, all fields accessible",
        "preconditions": "Mobile 375px",
        "test_data": "Priority: P2 | Original ID: LOG-008",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-034",
        "tc_index": "TC-034",
        "module": "Login",
        "category": "functional",
        "scenario": "First login \u00e2\u20ac\u201d grace period pass",
        "steps": "1.Login with correct credentials",
        "expected_result": "\"Verifying device session...\" spinner \u00e2\u2020\u2019  Auto-activate \u00e2\u2020\u2019  Dashboard loads (NO OTP asked)",
        "preconditions": "Brand new account (<24h old, login_count < 3)",
        "test_data": "Priority: P0 | Original ID: GATE-001",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-035",
        "tc_index": "TC-035",
        "module": "Login",
        "category": "functional",
        "scenario": "Second login same device \u00e2\u20ac\u201d trusted device",
        "steps": "1.Logout\n2.Login again",
        "expected_result": "Auto-activate (trusted device) \u00e2\u2020\u2019  Dashboard loads (NO OTP asked)",
        "preconditions": "Same browser, logged in before",
        "test_data": "Priority: P0 | Original ID: GATE-002",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-036",
        "tc_index": "TC-036",
        "module": "Login",
        "category": "functional",
        "scenario": "Login from NEW device after grace period",
        "steps": "1.Login from a different device/browser",
        "expected_result": "\"New Device Detected\" \u00e2\u2020\u2019  \"Send Code\" button \u00e2\u2020\u2019  OTP flow",
        "preconditions": "Account >24h old AND login_count >= 3 AND new browser/device",
        "test_data": "Priority: P0 | Original ID: GATE-003",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-037",
        "tc_index": "TC-037",
        "module": "Login",
        "category": "functional",
        "scenario": "OTP verification succeeds",
        "steps": "1.Check email for 6-digit code\n2.Enter code\n3.Click \"Verify & Continue\"",
        "expected_result": "\"Verifying...\" \u00e2\u2020\u2019  Gate clears \u00e2\u2020\u2019  Dashboard loads \u00e2\u2020\u2019  All other sessions signed out",
        "preconditions": "On OTP screen after \"Send Code\"",
        "test_data": "Priority: P0 | Original ID: GATE-004",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-038",
        "tc_index": "TC-038",
        "module": "Login",
        "category": "negative",
        "scenario": "Wrong OTP code",
        "steps": "1.Enter wrong 6-digit code\n2.Click verify",
        "expected_result": "Error: \"Invalid code. 2 attempts remaining.\" \u00e2\u2020\u2019  Attempt indicator decreases",
        "preconditions": "On OTP verify screen",
        "test_data": "Priority: P1 | Original ID: GATE-005",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-039",
        "tc_index": "TC-039",
        "module": "Login",
        "category": "negative",
        "scenario": "OTP max attempts exhausted (3)",
        "steps": "1.Enter wrong code 3 times",
        "expected_result": "\"Suspicious Activity Detected\" \u00e2\u2020\u2019  Account locked for X minutes \u00e2\u2020\u2019  Security alert sent to email",
        "preconditions": "On OTP verify screen",
        "test_data": "Priority: P1 | Original ID: GATE-006",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-040",
        "tc_index": "TC-040",
        "module": "Login",
        "category": "functional",
        "scenario": "Active session on another device \u00e2\u20ac\u201d takeover",
        "steps": "1.Login on Device B (new device, post-grace)\n2.Click \"Take Over\"\n3.Enter OTP\n4.Verify",
        "expected_result": "Device B activates \u00e2\u2020\u2019  Device A shows \"Session Ended\" on next heartbeat",
        "preconditions": "Logged in on Device A",
        "test_data": "Priority: P1 | Original ID: GATE-007",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-041",
        "tc_index": "TC-041",
        "module": "Login",
        "category": "functional",
        "scenario": "OTP expiry countdown",
        "steps": "1.Wait and observe timer",
        "expected_result": "Timer counts down from 5:00 \u00e2\u2020\u2019  At 1:00 turns amber \u00e2\u2020\u2019  At 0:00 turns red \"Code expired \u00e2\u20ac\u201d request a new one\" \u00e2\u2020\u2019  \"Resend Code\" button appears",
        "preconditions": "On OTP verify screen",
        "test_data": "Priority: P1 | Original ID: GATE-008",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-042",
        "tc_index": "TC-042",
        "module": "Login",
        "category": "functional",
        "scenario": "OTP resend after expiry",
        "steps": "1.Click \"Resend Code\"",
        "expected_result": "New OTP sent \u00e2\u2020\u2019  Timer resets \u00e2\u2020\u2019  New code in email",
        "preconditions": "OTP expired",
        "test_data": "Priority: P2 | Original ID: GATE-009",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-043",
        "tc_index": "TC-043",
        "module": "Login",
        "category": "functional",
        "scenario": "Staff/admin bypasses gate",
        "steps": "1.Login with staff account",
        "expected_result": "\"Staff role detected \u00e2\u20ac\u201d bypassing session gate\" \u00e2\u2020\u2019  Dashboard loads immediately (NO OTP ever)",
        "preconditions": "Staff role account",
        "test_data": "Priority: P1 | Original ID: GATE-010",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-044",
        "tc_index": "TC-044",
        "module": "Login",
        "category": "functional",
        "scenario": "Cancel returns to login",
        "steps": "1.Click \"Cancel\"",
        "expected_result": "Logged out \u00e2\u2020\u2019  Redirected to `/auth/login`",
        "preconditions": "On any gate screen",
        "test_data": "Priority: P2 | Original ID: GATE-011",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-045",
        "tc_index": "TC-045",
        "module": "Forgot Password",
        "category": "functional",
        "scenario": "Request password reset",
        "steps": "1.Navigate to `/auth/forgot-password`\n2.Enter registered email\n3.Click \"Send Reset Link\"",
        "expected_result": "Green checkmark \u00e2\u2020\u2019  \"Check Your Email\" \u00e2\u2020\u2019  \"Link expires in 10 minutes\" \u00e2\u2020\u2019  Check email for reset link",
        "preconditions": "Registered account",
        "test_data": "Priority: P1 | Original ID: PWD-001",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-046",
        "tc_index": "TC-046",
        "module": "Forgot Password",
        "category": "negative",
        "scenario": "Non-existent email",
        "steps": "1.Enter unregistered email\n2.Click send",
        "expected_result": "Error: \"No account found with this email address\"",
        "preconditions": "On forgot password page",
        "test_data": "Priority: P1 | Original ID: PWD-002",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-047",
        "tc_index": "TC-047",
        "module": "Forgot Password",
        "category": "functional",
        "scenario": "Complete password reset",
        "steps": "1.Click reset link in email\n2.Enter new password (8+ chars, uppercase, number)\n3.Confirm password\n4.Submit",
        "expected_result": "\"Password changed\" \u00e2\u2020\u2019  Redirect to login \u00e2\u2020\u2019  Login with new password works",
        "preconditions": "Reset email received",
        "test_data": "Priority: P1 | Original ID: PWD-003",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-048",
        "tc_index": "TC-048",
        "module": "Forgot Password",
        "category": "negative",
        "scenario": "Expired reset link (>10 min)",
        "steps": "1.Click expired link",
        "expected_result": "Error: \"Link expired\"",
        "preconditions": "Wait 10+ min after requesting",
        "test_data": "Priority: P2 | Original ID: PWD-004",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-049",
        "tc_index": "TC-049",
        "module": "Dashboard",
        "category": "functional",
        "scenario": "Dashboard loads for new user",
        "steps": "1.Navigate to `/dashboard`",
        "expected_result": "Page loads with: greeting \"Welcome, {name}!\", Sunday test countdown card, Gold entry card, 6-week sprint timeline, 3 subject cards showing \"--\" scores",
        "preconditions": "Logged in, free account, no tests taken",
        "test_data": "Priority: P0 | Original ID: DASH-001",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-050",
        "tc_index": "TC-050",
        "module": "Dashboard",
        "category": "functional",
        "scenario": "Sunday test countdown (upcoming)",
        "steps": "1.Check test card",
        "expected_result": "Red/amber gradient \u00e2\u2020\u2019  Countdown showing days:hours:minutes \u00e2\u2020\u2019  \"Practice Now\" button \u00e2\u2020\u2019  Checklist (camera ready, quiet room)",
        "preconditions": "Before Sunday 9 AM",
        "test_data": "Priority: P0 | Original ID: DASH-002",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-051",
        "tc_index": "TC-051",
        "module": "Dashboard",
        "category": "functional",
        "scenario": "Sunday test LIVE state",
        "steps": "1.Check test card",
        "expected_result": "Green gradient \u00e2\u2020\u2019  \"Test is LIVE!\" \u00e2\u2020\u2019  \"Join Test\" button \u00e2\u2020\u2019  Entry closes at 3:15 PM",
        "preconditions": "Sunday 9 AM - 3:15 PM",
        "test_data": "Priority: P0 | Original ID: DASH-003",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-052",
        "tc_index": "TC-052",
        "module": "Dashboard",
        "category": "functional",
        "scenario": "Results pending state",
        "steps": "1.Check test card",
        "expected_result": "Blue gradient \u00e2\u2020\u2019  \"Results at 7:00 PM\" \u00e2\u2020\u2019  No button (locked)",
        "preconditions": "Sunday 3:15 PM - 7 PM",
        "test_data": "Priority: P1 | Original ID: DASH-004",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-053",
        "tc_index": "TC-053",
        "module": "Dashboard",
        "category": "functional",
        "scenario": "Results published state",
        "steps": "1.Check test card",
        "expected_result": "Green gradient \u00e2\u2020\u2019  \"Results Published!\" \u00e2\u2020\u2019  \"View Results\" button",
        "preconditions": "Sunday after 7 PM",
        "test_data": "Priority: P1 | Original ID: DASH-005",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-054",
        "tc_index": "TC-054",
        "module": "Dashboard",
        "category": "functional",
        "scenario": "Gold Strategy card (free user)",
        "steps": "1.Check Gold entry card",
        "expected_result": "Shows \"DEMO\" or lock icon \u00e2\u2020\u2019  \"View Plans\" button opens pricing modal",
        "preconditions": "Free account",
        "test_data": "Priority: P1 | Original ID: DASH-006",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-055",
        "tc_index": "TC-055",
        "module": "Dashboard",
        "category": "functional",
        "scenario": "6-week sprint timeline",
        "steps": "1.Scroll to sprint section",
        "expected_result": "Week 1 \"Baseline\" highlighted (blue border), weeks 2-6 grayed out, horizontally scrollable",
        "preconditions": "Dashboard loaded",
        "test_data": "Priority: P2 | Original ID: DASH-007",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-056",
        "tc_index": "TC-056",
        "module": "Dashboard",
        "category": "functional",
        "scenario": "Subject cards show empty state",
        "steps": "1.Check Physics/Chemistry/Biology cards",
        "expected_result": "All show \"Avg Score: --\" and \"Not diagnosed\"",
        "preconditions": "New user, no tests",
        "test_data": "Priority: P2 | Original ID: DASH-008",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-057",
        "tc_index": "TC-057",
        "module": "Dashboard",
        "category": "sanity",
        "scenario": "Dashboard mobile layout",
        "steps": "1.Open dashboard on mobile",
        "expected_result": "Cards stack vertically, countdown readable, no overflow, sidebar hidden (hamburger menu)",
        "preconditions": "Mobile 375px",
        "test_data": "Priority: P1 | Original ID: DASH-009",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-058",
        "tc_index": "TC-058",
        "module": "Dashboard",
        "category": "functional",
        "scenario": "Theme toggle",
        "steps": "1.Click sun/moon icon in header",
        "expected_result": "All cards/text switch to dark/light theme correctly, no broken colors",
        "preconditions": "Dashboard loaded",
        "test_data": "Priority: P2 | Original ID: DASH-010",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-059",
        "tc_index": "TC-059",
        "module": "Sidebar Navigation",
        "category": "functional",
        "scenario": "Sidebar items visible (free user)",
        "steps": "1.Check sidebar",
        "expected_result": "Visible: Dashboard, Sample NEET Test (NEW badge), Gold Strategy (DEMO badge), Weekly Progression (DEMO), Custom Drill, Leaderboard, Referrals. Hidden: Test History, Diagnosis, Fix Drill, Explanations, Payments",
        "preconditions": "Logged in, free account",
        "test_data": "Priority: P0 | Original ID: NAV-001",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-060",
        "tc_index": "TC-060",
        "module": "Sidebar Navigation",
        "category": "functional",
        "scenario": "Sample Test navigation",
        "steps": "1.Click \"Sample NEET Test\"",
        "expected_result": "Navigates to `/app/sample-test`, test intro page loads",
        "preconditions": "Sidebar visible",
        "test_data": "Priority: P1 | Original ID: NAV-002",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-061",
        "tc_index": "TC-061",
        "module": "Sidebar Navigation",
        "category": "functional",
        "scenario": "Locked features show icon",
        "steps": "1.Check Truth Readiness Explorer",
        "expected_result": "Shows \"PRO\" badge + lock icon, clicking opens pricing modal",
        "preconditions": "Free user",
        "test_data": "Priority: P1 | Original ID: NAV-003",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-062",
        "tc_index": "TC-062",
        "module": "Sidebar Navigation",
        "category": "functional",
        "scenario": "Sidebar collapse/expand (desktop)",
        "steps": "1.Click collapse toggle at bottom",
        "expected_result": "Sidebar collapses to icon-only (56px) \u00e2\u2020\u2019  Click again \u00e2\u2020\u2019  Expands to full (224px)",
        "preconditions": "Desktop view",
        "test_data": "Priority: P2 | Original ID: NAV-004",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-063",
        "tc_index": "TC-063",
        "module": "Sidebar Navigation",
        "category": "functional",
        "scenario": "Mobile sidebar overlay",
        "steps": "1.Click hamburger menu icon",
        "expected_result": "Full-width sidebar overlay with backdrop, all items listed, closes on item click",
        "preconditions": "Mobile 375px",
        "test_data": "Priority: P2 | Original ID: NAV-005",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-064",
        "tc_index": "TC-064",
        "module": "Sidebar Navigation",
        "category": "functional",
        "scenario": "User menu dropdown",
        "steps": "1.Click user avatar/name in header",
        "expected_result": "Dropdown: Profile, Sign Out (red). If admin: \"Admin Panel\" link",
        "preconditions": "Desktop header",
        "test_data": "Priority: P2 | Original ID: NAV-006",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-065",
        "tc_index": "TC-065",
        "module": "Sidebar Navigation",
        "category": "functional",
        "scenario": "Tour replay button",
        "steps": "1.Scroll to sidebar bottom\n2.Click \"Take a Tour\"",
        "expected_result": "App tour restarts from step 1 with spotlight overlay",
        "preconditions": "Sidebar expanded",
        "test_data": "Priority: P3 | Original ID: NAV-007",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-066",
        "tc_index": "TC-066",
        "module": "Contact Page",
        "category": "functional",
        "scenario": "Full contact flow",
        "steps": "1.Navigate to `/contact`\n2.Enter email\n3.Click \"Send Verification Code\"\n4.Enter 6-digit OTP from email\n5.Click \"Continue\"\n6.Fill name, select purpose, write message\n7.Click \"Send Message\"",
        "expected_result": "Step indicator progresses (Email\u00e2\u2020\u2019 Verify\u00e2\u2020\u2019 Message) \u00e2\u2020\u2019  \"Message Sent!\" success \u00e2\u2020\u2019  Auto-reply email received",
        "preconditions": "Not logged in",
        "test_data": "Priority: P1 | Original ID: CON-001",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-067",
        "tc_index": "TC-067",
        "module": "Contact Page",
        "category": "negative",
        "scenario": "Wrong OTP on contact form",
        "steps": "1.Enter wrong 6-digit code\n2.Submit message",
        "expected_result": "Error: \"Invalid verification code\" \u00e2\u2020\u2019  Returns to OTP step",
        "preconditions": "OTP sent",
        "test_data": "Priority: P1 | Original ID: CON-002",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-068",
        "tc_index": "TC-068",
        "module": "Contact Page",
        "category": "negative",
        "scenario": "Expired OTP (>10 min)",
        "steps": "1.Submit with old code",
        "expected_result": "Error: \"Verification code has expired\" \u00e2\u2020\u2019  Returns to email step",
        "preconditions": "Wait 10+ min",
        "test_data": "Priority: P2 | Original ID: CON-003",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-069",
        "tc_index": "TC-069",
        "module": "Contact Page",
        "category": "negative",
        "scenario": "Empty message validation",
        "steps": "1.Leave message empty\n2.Click send",
        "expected_result": "Validation: \"Message must be at least 10 characters\"",
        "preconditions": "On message step",
        "test_data": "Priority: P2 | Original ID: CON-004",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-070",
        "tc_index": "TC-070",
        "module": "Contact Page",
        "category": "negative",
        "scenario": "No purpose selected",
        "steps": "1.Skip purpose dropdown\n2.Click send",
        "expected_result": "Validation: \"Please select a purpose\"",
        "preconditions": "On message step",
        "test_data": "Priority: P2 | Original ID: CON-005",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-071",
        "tc_index": "TC-071",
        "module": "Contact Page",
        "category": "functional",
        "scenario": "OTP paste 6 digits",
        "steps": "1.Copy \"123456\"\n2.Paste into first OTP field",
        "expected_result": "All 6 fields auto-fill, focus moves to last",
        "preconditions": "On OTP step",
        "test_data": "Priority: P2 | Original ID: CON-006",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-072",
        "tc_index": "TC-072",
        "module": "Contact Page",
        "category": "functional",
        "scenario": "Change email after OTP sent",
        "steps": "1.Click \"Change email\"",
        "expected_result": "Returns to email step, OTP reset",
        "preconditions": "On OTP step",
        "test_data": "Priority: P2 | Original ID: CON-007",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-073",
        "tc_index": "TC-073",
        "module": "Contact Page",
        "category": "functional",
        "scenario": "Resend cooldown (60s)",
        "steps": "1.Click \"Resend code\" immediately",
        "expected_result": "Shows \"Resend in 60s\" countdown, disabled",
        "preconditions": "OTP sent",
        "test_data": "Priority: P3 | Original ID: CON-008",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-074",
        "tc_index": "TC-074",
        "module": "Contact Page",
        "category": "sanity",
        "scenario": "Contact page mobile",
        "steps": "1.Open `/contact` on mobile",
        "expected_result": "Info panel stacks above form, OTP fields fit, step indicator compact",
        "preconditions": "Mobile 375px",
        "test_data": "Priority: P2 | Original ID: CON-009",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-075",
        "tc_index": "TC-075",
        "module": "Support Page",
        "category": "functional",
        "scenario": "Submit support ticket",
        "steps": "1.Navigate to `/app/support`\n2.Click \"Gold Strategy Planner\" category\n3.Enter subject: \"Cannot load S3 step\"\n4.Enter description (10+ chars)\n5.Click \"Submit Ticket\"",
        "expected_result": "Spinner \u00e2\u2020\u2019  Success: ticket ref ID shown + response ETA (24h for free, 4h for paid)",
        "preconditions": "Logged in",
        "test_data": "Priority: P1 | Original ID: SUP-001",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-076",
        "tc_index": "TC-076",
        "module": "Support Page",
        "category": "functional",
        "scenario": "All 11 categories clickable",
        "steps": "1.Click each of the 11 category cards",
        "expected_result": "Each advances to detail form with correct category header and description",
        "preconditions": "On support page",
        "test_data": "Priority: P1 | Original ID: SUP-002",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-077",
        "tc_index": "TC-077",
        "module": "Support Page",
        "category": "negative",
        "scenario": "Short subject rejected",
        "steps": "1.Enter \"abc\" as subject\n2.Submit",
        "expected_result": "Validation: \"Subject must be at least 5 characters\"",
        "preconditions": "On detail form",
        "test_data": "Priority: P2 | Original ID: SUP-003",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-078",
        "tc_index": "TC-078",
        "module": "Support Page",
        "category": "negative",
        "scenario": "Short description rejected",
        "steps": "1.Enter \"bug\" as description\n2.Submit",
        "expected_result": "Validation: \"Please describe the issue in at least 10 characters\"",
        "preconditions": "On detail form",
        "test_data": "Priority: P2 | Original ID: SUP-004",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-079",
        "tc_index": "TC-079",
        "module": "Support Page",
        "category": "functional",
        "scenario": "Recent tickets display",
        "steps": "1.Visit `/app/support`",
        "expected_result": "\"Your Recent Tickets\" section shows last 5 with subject, date, status badge",
        "preconditions": "User has submitted tickets before",
        "test_data": "Priority: P2 | Original ID: SUP-005",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-080",
        "tc_index": "TC-080",
        "module": "Support Page",
        "category": "negative",
        "scenario": "Unauthenticated access blocked",
        "steps": "1.Navigate to `/app/support` directly",
        "expected_result": "Redirected to `/auth/login`",
        "preconditions": "Not logged in",
        "test_data": "Priority: P1 | Original ID: SUP-006",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-081",
        "tc_index": "TC-081",
        "module": "Support Page",
        "category": "functional",
        "scenario": "Back to categories",
        "steps": "1.Click \"Back to categories\"",
        "expected_result": "Returns to category grid",
        "preconditions": "On detail form",
        "test_data": "Priority: P2 | Original ID: SUP-007",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-082",
        "tc_index": "TC-082",
        "module": "Support Page",
        "category": "sanity",
        "scenario": "Support page mobile",
        "steps": "1.Open support page on mobile",
        "expected_result": "Category cards single-column, form full-width",
        "preconditions": "Mobile 375px",
        "test_data": "Priority: P2 | Original ID: SUP-008",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-083",
        "tc_index": "TC-083",
        "module": "Profile Page",
        "category": "functional",
        "scenario": "Profile loads correctly",
        "steps": "1.Navigate to `/app/profile`",
        "expected_result": "Avatar (initials or photo), name, email, plan badge \"Free\", verification chips (Email \u00e2\u0153\u201c, Mobile status), joined date, state",
        "preconditions": "Logged in",
        "test_data": "Priority: P1 | Original ID: PROF-001",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-084",
        "tc_index": "TC-084",
        "module": "Profile Page",
        "category": "functional",
        "scenario": "Edit and save name",
        "steps": "1.Click \"Edit Profile\"\n2.Change name to \"Test User\"\n3.Click \"Save Changes\"",
        "expected_result": "Toast: \"Profile updated\" \u00e2\u2020\u2019  Name updates on page \u00e2\u2020\u2019  Persists after refresh",
        "preconditions": "On profile page",
        "test_data": "Priority: P1 | Original ID: PROF-002",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-085",
        "tc_index": "TC-085",
        "module": "Profile Page",
        "category": "functional",
        "scenario": "Phone \"Not Set\" display",
        "steps": "1.Check verification chips",
        "expected_result": "Shows \"Mobile Not Set\" (gray chip) instead of \"Mobile Pending\"",
        "preconditions": "User without phone",
        "test_data": "Priority: P2 | Original ID: PROF-003",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-086",
        "tc_index": "TC-086",
        "module": "Profile Page",
        "category": "functional",
        "scenario": "Privacy toggle persists",
        "steps": "1.Toggle \"Show on Leaderboard\" OFF\n2.Refresh page",
        "expected_result": "Toggle stays OFF (saved to localStorage)",
        "preconditions": "On preferences section",
        "test_data": "Priority: P2 | Original ID: PROF-004",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-087",
        "tc_index": "TC-087",
        "module": "Profile Page",
        "category": "functional",
        "scenario": "Change password",
        "steps": "1.Click \"Change Password\"\n2.Enter new password (8+ chars, uppercase, number)\n3.Confirm\n4.Click \"Update\"",
        "expected_result": "Toast: \"Password changed\" \u00e2\u2020\u2019  Can login with new password",
        "preconditions": "On security section",
        "test_data": "Priority: P2 | Original ID: PROF-005",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-088",
        "tc_index": "TC-088",
        "module": "Profile Page",
        "category": "negative",
        "scenario": "Empty name rejected",
        "steps": "1.Clear name field\n2.Click save",
        "expected_result": "Toast error: \"Name is required\"",
        "preconditions": "Editing profile",
        "test_data": "Priority: P2 | Original ID: PROF-006",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-089",
        "tc_index": "TC-089",
        "module": "Profile Page",
        "category": "functional",
        "scenario": "Language preference",
        "steps": "1.Click \"Tamil\" button",
        "expected_result": "Button highlights, synonym glossary switches to Tamil",
        "preconditions": "On preferences section",
        "test_data": "Priority: P2 | Original ID: PROF-007",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-090",
        "tc_index": "TC-090",
        "module": "Profile Page",
        "category": "functional",
        "scenario": "Logout button",
        "steps": "1.Click \"Logout\" (red)",
        "expected_result": "User logged out \u00e2\u2020\u2019  Redirected to landing page",
        "preconditions": "On account section",
        "test_data": "Priority: P2 | Original ID: PROF-008",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-091",
        "tc_index": "TC-091",
        "module": "Profile Page",
        "category": "sanity",
        "scenario": "Profile page mobile",
        "steps": "1.Open profile on mobile",
        "expected_result": "Avatar smaller, edit form stacks, chips wrap, all sections accessible",
        "preconditions": "Mobile 375px",
        "test_data": "Priority: P2 | Original ID: PROF-009",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-092",
        "tc_index": "TC-092",
        "module": "Referral Page",
        "category": "functional",
        "scenario": "Referral page loads",
        "steps": "1.Navigate to `/app/referrals`",
        "expected_result": "Credit balance (0 for new), referral link, coupon code (BB-XXXXXX), share buttons (WhatsApp, Instagram, X, Facebook, Telegram, More), earning rules",
        "preconditions": "Logged in",
        "test_data": "Priority: P1 | Original ID: REF-001",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-093",
        "tc_index": "TC-093",
        "module": "Referral Page",
        "category": "functional",
        "scenario": "Copy referral link",
        "steps": "1.Click Copy button next to referral link",
        "expected_result": "Toast: \"Referral link copied!\" \u00e2\u2020\u2019  Clipboard contains `{baseUrl}/auth/register?ref={code}`",
        "preconditions": "On referral page",
        "test_data": "Priority: P1 | Original ID: REF-002",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-094",
        "tc_index": "TC-094",
        "module": "Referral Page",
        "category": "functional",
        "scenario": "Copy coupon code",
        "steps": "1.Click Copy next to coupon code",
        "expected_result": "Toast: \"Coupon code copied!\" \u00e2\u2020\u2019  Clipboard contains `BB-XXXXXX`",
        "preconditions": "On referral page",
        "test_data": "Priority: P1 | Original ID: REF-003",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-095",
        "tc_index": "TC-095",
        "module": "Referral Page",
        "category": "functional",
        "scenario": "WhatsApp share",
        "steps": "1.Click WhatsApp button",
        "expected_result": "Opens `api.whatsapp.com/send?text=...` with professional share message including referral link",
        "preconditions": "On referral page",
        "test_data": "Priority: P1 | Original ID: REF-004",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-096",
        "tc_index": "TC-096",
        "module": "Referral Page",
        "category": "functional",
        "scenario": "X (Twitter) share",
        "steps": "1.Click X button",
        "expected_result": "Opens Twitter intent with referral text + URL",
        "preconditions": "On referral page",
        "test_data": "Priority: P2 | Original ID: REF-005",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-097",
        "tc_index": "TC-097",
        "module": "Referral Page",
        "category": "functional",
        "scenario": "Facebook share",
        "steps": "1.Click Facebook button",
        "expected_result": "Opens Facebook sharer with referral URL",
        "preconditions": "On referral page",
        "test_data": "Priority: P2 | Original ID: REF-006",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-098",
        "tc_index": "TC-098",
        "module": "Referral Page",
        "category": "functional",
        "scenario": "Telegram share",
        "steps": "1.Click Telegram button",
        "expected_result": "Opens Telegram share URL",
        "preconditions": "On referral page",
        "test_data": "Priority: P2 | Original ID: REF-007",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-099",
        "tc_index": "TC-099",
        "module": "Referral Page",
        "category": "functional",
        "scenario": "How You Earn Credits (collapsible)",
        "steps": "1.Click \"How You Earn Credits\" header",
        "expected_result": "Expands to show: Registration +5, Test +10, Payment +35/+15/+45/+85",
        "preconditions": "On referral page",
        "test_data": "Priority: P2 | Original ID: REF-008",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-100",
        "tc_index": "TC-100",
        "module": "Referral Page",
        "category": "functional",
        "scenario": "Weekly slot tracker",
        "steps": "1.Check \"Weekly Referral Slots\"",
        "expected_result": "Shows 0/20 used, 20 remaining, reset countdown",
        "preconditions": "On referral page",
        "test_data": "Priority: P2 | Original ID: REF-009",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-101",
        "tc_index": "TC-101",
        "module": "Referral Page",
        "category": "sanity",
        "scenario": "Referral page mobile",
        "steps": "1.Open referrals on mobile",
        "expected_result": "Share buttons 2-column grid, credit card fits, activity list scrollable",
        "preconditions": "Mobile 375px",
        "test_data": "Priority: P2 | Original ID: REF-010",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-102",
        "tc_index": "TC-102",
        "module": "Sample Test",
        "category": "functional",
        "scenario": "Start sample test",
        "steps": "1.Navigate to `/app/sample-test` or click sidebar",
        "expected_result": "Sample test intro page loads OR test starts directly",
        "preconditions": "Logged in, never taken sample",
        "test_data": "Priority: P0 | Original ID: SAMP-001",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-103",
        "tc_index": "TC-103",
        "module": "Sample Test",
        "category": "functional",
        "scenario": "Answer a question",
        "steps": "1.Read question\n2.Click option B",
        "expected_result": "Option B highlighted, question marked as answered in grid",
        "preconditions": "In sample test",
        "test_data": "Priority: P0 | Original ID: SAMP-002",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-104",
        "tc_index": "TC-104",
        "module": "Sample Test",
        "category": "functional",
        "scenario": "Submit sample test",
        "steps": "1.Click Submit\n2.Confirm submission",
        "expected_result": "Results page loads with score, subject breakdown",
        "preconditions": "Answered some questions",
        "test_data": "Priority: P0 | Original ID: SAMP-003",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-105",
        "tc_index": "TC-105",
        "module": "Sample Test",
        "category": "functional",
        "scenario": "Question grid navigation",
        "steps": "1.Click question number 5 in grid",
        "expected_result": "Workspace jumps to question 5",
        "preconditions": "In sample test",
        "test_data": "Priority: P1 | Original ID: SAMP-004",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-106",
        "tc_index": "TC-106",
        "module": "Sample Test",
        "category": "functional",
        "scenario": "Flag question for review",
        "steps": "1.Click Flag button on Q3",
        "expected_result": "Q3 grid cell turns amber, \"flagged\" count increments",
        "preconditions": "In sample test",
        "test_data": "Priority: P1 | Original ID: SAMP-005",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-107",
        "tc_index": "TC-107",
        "module": "Sample Test",
        "category": "functional",
        "scenario": "Clear answer",
        "steps": "1.Answer Q1 as A\n2.Click \"Clear\"",
        "expected_result": "Selection removed, grid cell shows \"visited unanswered\"",
        "preconditions": "In sample test",
        "test_data": "Priority: P2 | Original ID: SAMP-006",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-108",
        "tc_index": "TC-108",
        "module": "Sample Test",
        "category": "sanity",
        "scenario": "Sample test mobile",
        "steps": "1.Take sample test on mobile",
        "expected_result": "Bottom sheet for grid, mobile action bar, all controls reachable",
        "preconditions": "Mobile 375px",
        "test_data": "Priority: P1 | Original ID: SAMP-007",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-109",
        "tc_index": "TC-109",
        "module": "Chatbot",
        "category": "functional",
        "scenario": "Open chatbot",
        "steps": "1.Click floating chat button (bottom-right)",
        "expected_result": "Chat panel slides up with \"BrainBoot Assistant\" header, quick questions visible",
        "preconditions": "Logged in, on any app page",
        "test_data": "Priority: P1 | Original ID: CHAT-001",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-110",
        "tc_index": "TC-110",
        "module": "Chatbot",
        "category": "functional",
        "scenario": "Ask quick question",
        "steps": "1.Click \"Is every Sunday test free?\"",
        "expected_result": "AI response streams in with markdown formatting",
        "preconditions": "Chatbot open",
        "test_data": "Priority: P1 | Original ID: CHAT-002",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-111",
        "tc_index": "TC-111",
        "module": "Chatbot",
        "category": "negative",
        "scenario": "30-word limit",
        "steps": "1.Type a 35-word message",
        "expected_result": "Word counter turns red \"35/30\", send button disabled",
        "preconditions": "Chatbot open",
        "test_data": "Priority: P1 | Original ID: CHAT-003",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-112",
        "tc_index": "TC-112",
        "module": "Chatbot",
        "category": "functional",
        "scenario": "Auth gate (not logged in)",
        "steps": "1.Open chatbot",
        "expected_result": "Shows \"Login to Chat\" with Register/Login buttons",
        "preconditions": "Not logged in",
        "test_data": "Priority: P1 | Original ID: CHAT-004",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-113",
        "tc_index": "TC-113",
        "module": "Chatbot",
        "category": "functional",
        "scenario": "Chatbot hidden during test",
        "steps": "1.Check bottom-right corner",
        "expected_result": "Floating button NOT visible",
        "preconditions": "In NEET test or sample test",
        "test_data": "Priority: P1 | Original ID: CHAT-005",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-114",
        "tc_index": "TC-114",
        "module": "Chatbot",
        "category": "functional",
        "scenario": "Support ticket from chatbot",
        "steps": "1.Click \"Need more help? Contact Support\"\n2.Select category\n3.Enter subject + desc\n4.Submit",
        "expected_result": "Ticket created, ref ID + ETA shown",
        "preconditions": "Chatbot open",
        "test_data": "Priority: P2 | Original ID: CHAT-006",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-115",
        "tc_index": "TC-115",
        "module": "Chatbot",
        "category": "functional",
        "scenario": "Close chatbot",
        "steps": "1.Click X button",
        "expected_result": "Panel closes with animation, floating button returns",
        "preconditions": "Chatbot open",
        "test_data": "Priority: P2 | Original ID: CHAT-007",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-116",
        "tc_index": "TC-116",
        "module": "App Tour",
        "category": "functional",
        "scenario": "Tour auto-triggers on 3rd visit",
        "steps": "1.Visit dashboard 3 times",
        "expected_result": "Tour starts automatically with spotlight overlay on first target",
        "preconditions": "New account",
        "test_data": "Priority: P2 | Original ID: TOUR-001",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-117",
        "tc_index": "TC-117",
        "module": "App Tour",
        "category": "functional",
        "scenario": "Navigate tour steps",
        "steps": "1.Click \"Next\" through all 11 steps",
        "expected_result": "Each step highlights: welcome \u00e2\u2020\u2019  sample test \u00e2\u2020\u2019  results \u00e2\u2020\u2019  gold \u00e2\u2020\u2019  weekly \u00e2\u2020\u2019  truth \u00e2\u2020\u2019  drill \u00e2\u2020\u2019  leaderboard \u00e2\u2020\u2019  user menu \u00e2\u2020\u2019  sidebar \u00e2\u2020\u2019  complete",
        "preconditions": "Tour active",
        "test_data": "Priority: P2 | Original ID: TOUR-002",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-118",
        "tc_index": "TC-118",
        "module": "App Tour",
        "category": "functional",
        "scenario": "Skip tour",
        "steps": "1.Click X (close) button",
        "expected_result": "Tour closes, won't show again (localStorage)",
        "preconditions": "Tour active",
        "test_data": "Priority: P2 | Original ID: TOUR-003",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-119",
        "tc_index": "TC-119",
        "module": "App Tour",
        "category": "functional",
        "scenario": "Tour replay from sidebar",
        "steps": "1.Click \"Take a Tour\" in sidebar",
        "expected_result": "Tour restarts from step 1",
        "preconditions": "Tour dismissed",
        "test_data": "Priority: P3 | Original ID: TOUR-004",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-120",
        "tc_index": "TC-120",
        "module": "App Tour",
        "category": "sanity",
        "scenario": "Tour on mobile",
        "steps": "1.Trigger tour on mobile",
        "expected_result": "Bottom-sheet style (no sidebar spotlight), all steps readable",
        "preconditions": "Mobile 375px",
        "test_data": "Priority: P2 | Original ID: TOUR-005",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-121",
        "tc_index": "TC-121",
        "module": "Payments",
        "category": "functional",
        "scenario": "Pricing modal (pre-launch)",
        "steps": "1.Click any \"View Plans\"",
        "expected_result": "Modal: \"Coming Soon\" with free features listed + premium preview",
        "preconditions": "Free user, before March 29 7 PM",
        "test_data": "Priority: P1 | Original ID: PAY-001",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-122",
        "tc_index": "TC-122",
        "module": "Payments",
        "category": "functional",
        "scenario": "Checkout page loads (post-launch)",
        "steps": "1.Navigate to `/app/payments`\n2.Click plan",
        "expected_result": "Checkout page with plan details, GST, total amount",
        "preconditions": "After March 29 7 PM",
        "test_data": "Priority: P0 | Original ID: PAY-002",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-123",
        "tc_index": "TC-123",
        "module": "Payments",
        "category": "functional",
        "scenario": "Valid promo code",
        "steps": "1.Enter valid promo code\n2.Click Apply",
        "expected_result": "Discount shown, total recalculated",
        "preconditions": "On checkout",
        "test_data": "Priority: P1 | Original ID: PAY-003",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-124",
        "tc_index": "TC-124",
        "module": "Payments",
        "category": "negative",
        "scenario": "Invalid promo code",
        "steps": "1.Enter \"BADCODE\"\n2.Click Apply",
        "expected_result": "Error: \"Invalid promo code\"",
        "preconditions": "On checkout",
        "test_data": "Priority: P1 | Original ID: PAY-004",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-125",
        "tc_index": "TC-125",
        "module": "Payments",
        "category": "functional",
        "scenario": "Razorpay checkout",
        "steps": "1.Click \"Pay Now\"",
        "expected_result": "Razorpay modal opens with correct amount",
        "preconditions": "On checkout",
        "test_data": "Priority: P0 | Original ID: PAY-005",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-126",
        "tc_index": "TC-126",
        "module": "Payments",
        "category": "functional",
        "scenario": "Payment success",
        "steps": "1.Complete payment",
        "expected_result": "Success page \u00e2\u2020\u2019  Plan activated \u00e2\u2020\u2019  Email receipt",
        "preconditions": "Complete Razorpay",
        "test_data": "Priority: P0 | Original ID: PAY-006",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-127",
        "tc_index": "TC-127",
        "module": "Payments",
        "category": "functional",
        "scenario": "Payment cancelled",
        "steps": "1.Close Razorpay modal",
        "expected_result": "Failure page with \"Try Again\" option",
        "preconditions": "Cancel Razorpay",
        "test_data": "Priority: P1 | Original ID: PAY-007",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-128",
        "tc_index": "TC-128",
        "module": "Dark Theme",
        "category": "sanity",
        "scenario": "Dark theme \u00e2\u20ac\u201d all pages readable",
        "steps": "1.Toggle dark theme\n2.Visit: Dashboard, Profile, Referrals, Contact, Support",
        "expected_result": "No white-on-white text, no invisible elements, all 283 theme tokens applied",
        "preconditions": "Theme toggle to dark",
        "test_data": "Priority: P1 | Original ID: THEME-001",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-129",
        "tc_index": "TC-129",
        "module": "Dark Theme",
        "category": "sanity",
        "scenario": "Light theme \u00e2\u20ac\u201d all pages readable",
        "steps": "1.Toggle light theme\n2.Visit same pages",
        "expected_result": "Consistent borders, backgrounds, text contrast",
        "preconditions": "Theme toggle to light",
        "test_data": "Priority: P1 | Original ID: THEME-002",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-130",
        "tc_index": "TC-130",
        "module": "Dark Theme",
        "category": "sanity",
        "scenario": "Theme persists on refresh",
        "steps": "1.Set dark theme\n2.Refresh page",
        "expected_result": "Dark theme still active",
        "preconditions": "Toggle theme",
        "test_data": "Priority: P2 | Original ID: THEME-003",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-131",
        "tc_index": "TC-131",
        "module": "Cross-Cutting Tests",
        "category": "functional",
        "scenario": "AuthGuard blocks unauthenticated",
        "steps": "1.Navigate to `/dashboard` directly",
        "expected_result": "Redirected to `/auth/login`",
        "preconditions": "Not logged in",
        "test_data": "Priority: P0 | Original ID: CROSS-001",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-132",
        "tc_index": "TC-132",
        "module": "Cross-Cutting Tests",
        "category": "functional",
        "scenario": "Error toast on network failure",
        "steps": "1.Disconnect WiFi\n2.Click any data-loading action",
        "expected_result": "Error toast with readable message, no white screen crash",
        "preconditions": "Logged in",
        "test_data": "Priority: P1 | Original ID: CROSS-002",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-133",
        "tc_index": "TC-133",
        "module": "Cross-Cutting Tests",
        "category": "sanity",
        "scenario": "Loading states on all pages",
        "steps": "1.Navigate to Dashboard, Profile, Referrals, Support",
        "expected_result": "Each shows spinner/skeleton during data fetch, no blank flash",
        "preconditions": "Logged in",
        "test_data": "Priority: P1 | Original ID: CROSS-003",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-134",
        "tc_index": "TC-134",
        "module": "Cross-Cutting Tests",
        "category": "functional",
        "scenario": "Console access blocked for learner",
        "steps": "1.Navigate to `/console`",
        "expected_result": "StaffGuard redirects to dashboard",
        "preconditions": "Logged in as learner",
        "test_data": "Priority: P1 | Original ID: CROSS-004",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-135",
        "tc_index": "TC-135",
        "module": "Cross-Cutting Tests",
        "category": "functional",
        "scenario": "Support admin blocked for learner",
        "steps": "1.Navigate to `/console/support-tickets`",
        "expected_result": "SuperAdminGuard blocks access",
        "preconditions": "Logged in as learner",
        "test_data": "Priority: P1 | Original ID: CROSS-005",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-136",
        "tc_index": "TC-136",
        "module": "Cross-Cutting Tests",
        "category": "regression",
        "scenario": "Touch targets >= 44px",
        "steps": "1.Check all buttons across pages",
        "expected_result": "All interactive elements meet 44x44px minimum",
        "preconditions": "Mobile 375px",
        "test_data": "Priority: P1 | Original ID: CROSS-006",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-137",
        "tc_index": "TC-137",
        "module": "Cross-Cutting Tests",
        "category": "regression",
        "scenario": "No horizontal scroll on any page",
        "steps": "1.Visit all pages on mobile",
        "expected_result": "No horizontal overflow on any page",
        "preconditions": "Mobile 375px",
        "test_data": "Priority: P2 | Original ID: CROSS-007",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    },
    {
        "id": "tc-bb-138",
        "tc_index": "TC-138",
        "module": "Cross-Cutting Tests",
        "category": "functional",
        "scenario": "PWA install prompt (Android)",
        "steps": "1.Open site on Android",
        "expected_result": "Install banner or A2HS prompt appears",
        "preconditions": "Android Chrome, first visit",
        "test_data": "Priority: P2 | Original ID: CROSS-008",
        "revision": 1,
        "is_archived": false,
        "previously_failed": false,
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z",
        "last_runs": []
    }
];
}


// ── Initialization ────────────────────────────────────────────────────
async function initRepository() {
    const session = await requireAuth();
    if (!session) return;

    await initAppShell(session);

    // Bind filter events with debounce
    document.getElementById('filter-module').addEventListener('change', () => debouncedFilter());
    document.getElementById('filter-category').addEventListener('change', () => debouncedFilter());
    document.getElementById('filter-search').addEventListener('input', () => debouncedFilter());
    document.getElementById('filter-failed').addEventListener('change', () => debouncedFilter());

    // Bind add button
    document.getElementById('btn-add-tc').addEventListener('click', openAddModal);
    setupUploadHandlers();

    // Load test cases
    await loadTestCases();
}

// ── Load Test Cases ───────────────────────────────────────────────────
async function loadTestCases() {
    if (DEV_MODE) {
        console.log('[DEV MODE] Loading mock test cases');
        allTestCases = getMockTestCases();
        localStorage.setItem('fullbeat_dev_test_cases', JSON.stringify(allTestCases));
        populateModuleFilter();
        filterTestCases();
        return;
    }

    const projectId = getSelectedProjectId();
    if (!projectId) {
        allTestCases = [];
        renderTestCases([]);
        return;
    }

    try {
        const { data, error } = await supabase
            .from('test_cases')
            .select('*')
            .eq('project_id', projectId)
            .eq('is_archived', false)
            .order('tc_index');

        if (error) throw error;

        // Fetch last 3 runs for each test case
        const tcIds = data.map(tc => tc.id);
        let runsMap = {};

        if (tcIds.length > 0) {
            const { data: runs, error: runsError } = await supabase
                .from('test_executions')
                .select('test_case_id, status, executed_at')
                .in('test_case_id', tcIds)
                .order('executed_at', { ascending: false });

            if (!runsError && runs) {
                runs.forEach(run => {
                    if (!runsMap[run.test_case_id]) runsMap[run.test_case_id] = [];
                    if (runsMap[run.test_case_id].length < 3) {
                        runsMap[run.test_case_id].push({
                            status: run.status,
                            date: run.executed_at ? run.executed_at.split('T')[0] : ''
                        });
                    }
                });
            }
        }

        allTestCases = data.map(tc => ({
            ...tc,
            last_runs: runsMap[tc.id] || []
        }));

        populateModuleFilter();
        filterTestCases();
    } catch (err) {
        console.error('Error loading test cases:', err);
        allTestCases = [];
        renderTestCases([]);
    }
}

// ── Populate Module Filter ────────────────────────────────────────────
function populateModuleFilter() {
    const select = document.getElementById('filter-module');
    const currentValue = select.value;

    // Get unique modules
    const modules = [...new Set(allTestCases.map(tc => tc.module))].sort();

    // Keep the "All Modules" option, rebuild the rest
    select.innerHTML = '<option value="">All Modules</option>';
    modules.forEach(mod => {
        const opt = document.createElement('option');
        opt.value = mod;
        opt.textContent = mod;
        select.appendChild(opt);
    });

    // Restore previous selection if still valid
    if (currentValue && modules.includes(currentValue)) {
        select.value = currentValue;
    }
}

// ── Filter Test Cases ─────────────────────────────────────────────────
function filterTestCases() {
    const moduleVal = document.getElementById('filter-module').value;
    const categoryVal = document.getElementById('filter-category').value;
    const searchVal = document.getElementById('filter-search').value.trim().toLowerCase();
    const failedOnly = document.getElementById('filter-failed').checked;

    filteredTestCases = allTestCases.filter(tc => {
        if (moduleVal && tc.module !== moduleVal) return false;
        if (categoryVal && tc.category !== categoryVal) return false;
        if (searchVal && !tc.scenario.toLowerCase().includes(searchVal) &&
            !tc.tc_index.toLowerCase().includes(searchVal) &&
            !tc.module.toLowerCase().includes(searchVal)) return false;
        if (failedOnly && !tc.previously_failed) return false;
        return true;
    });

    renderTestCases(filteredTestCases);
}

function debouncedFilter() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(filterTestCases, 250);
}

// ── Render Test Cases Table ───────────────────────────────────────────
function renderTestCases(cases) {
    const tbody = document.getElementById('tc-tbody');
    tbody.innerHTML = '';
    expandedRowId = null;

    if (cases.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="7" class="empty-state">No test cases found. Click "+ Add Test Case" to create one.</td>';
        tbody.appendChild(tr);
        return;
    }

    cases.forEach(tc => {
        const tr = document.createElement('tr');
        tr.className = 'tc-row';
        tr.dataset.id = tc.id;
        tr.addEventListener('click', () => toggleExpandRow(tc));

        const statusBadges = [];
        if (tc.previously_failed) {
            statusBadges.push('<span class="badge badge-danger">PREV FAIL</span>');
        }
        if (tc.is_archived) {
            statusBadges.push('<span class="badge badge-muted">Archived</span>');
        }
        if (!tc.previously_failed && !tc.is_archived) {
            statusBadges.push('<span class="badge badge-success">Active</span>');
        }

        tr.innerHTML = `
            <td><strong>${escapeHtml(tc.tc_index)}</strong></td>
            <td>${escapeHtml(tc.module)}</td>
            <td><span class="badge badge-${getCategoryBadge(tc.category)}">${escapeHtml(tc.category)}</span></td>
            <td>${escapeHtml(tc.scenario)}</td>
            <td>v${tc.revision || 1}</td>
            <td>${statusBadges.join(' ')}</td>
            <td class="actions-cell">
                <button class="btn btn-sm btn-ghost" onclick="event.stopPropagation(); openEditModal('${tc.id}')" title="Edit">&#9998;</button>
                <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); archiveTestCase('${tc.id}')" title="Archive">&#128465;</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function getCategoryBadge(category) {
    switch (category) {
        case 'smoke': return 'warning';
        case 'sanity': return 'info';
        case 'regression': return 'primary';
        case 'functional': return 'success';
        case 'negative': return 'danger';
        case 'performance': return 'muted';
        default: return 'info';
    }
}

// ── Expand / Collapse Row Detail ──────────────────────────────────────
function toggleExpandRow(tc) {
    const tbody = document.getElementById('tc-tbody');
    const existingExpanded = tbody.querySelector('.expandable-content');

    // If clicking the same row, collapse it
    if (existingExpanded && expandedRowId === tc.id) {
        existingExpanded.remove();
        expandedRowId = null;
        return;
    }

    // Remove any existing expanded row
    if (existingExpanded) {
        existingExpanded.remove();
    }

    expandedRowId = tc.id;

    // Find the clicked row and insert detail row after it
    const clickedRow = tbody.querySelector(`tr[data-id="${tc.id}"]`);
    if (!clickedRow) return;

    const detailRow = document.createElement('tr');
    detailRow.className = 'expandable-content expanded';
    detailRow.innerHTML = `
        <td colspan="7">
            <div class="tc-details">
                <div class="tc-detail-section">
                    <strong>Steps:</strong>
                    <pre>${escapeHtml(tc.steps || 'N/A')}</pre>
                </div>
                <div class="tc-detail-section">
                    <strong>Expected:</strong>
                    <pre>${escapeHtml(tc.expected_result || 'N/A')}</pre>
                </div>
                <div class="tc-detail-section">
                    <strong>Preconditions:</strong> ${escapeHtml(tc.preconditions || 'None')}
                </div>
                <div class="tc-detail-section">
                    <strong>Test Data:</strong> ${escapeHtml(tc.test_data || 'None')}
                </div>
                <div class="tc-detail-section">
                    <strong>Last 3 Runs:</strong> ${renderLastRuns(tc.last_runs)}
                </div>
            </div>
        </td>
    `;

    clickedRow.insertAdjacentElement('afterend', detailRow);
}

function renderLastRuns(runs) {
    if (!runs || runs.length === 0) {
        return '<span class="text-muted">No runs yet</span>';
    }

    return runs.map(run => {
        const badgeClass = run.status === 'pass' ? 'badge-success'
            : run.status === 'fail' ? 'badge-danger'
            : 'badge-warning';
        return `<span class="badge ${badgeClass}">${run.status.toUpperCase()} (${run.date})</span>`;
    }).join(' ');
}

// ── Modal: Add / Edit ─────────────────────────────────────────────────
function openAddModal() {
    editingTestCaseId = null;
    document.getElementById('tc-modal-title').textContent = 'Add Test Case';
    document.getElementById('tc-form').reset();
    document.getElementById('tc-form-error').textContent = '';
    document.getElementById('tc-save-btn').textContent = 'Save';
    openModal('tc-modal');
}

function openEditModal(id) {
    const tc = allTestCases.find(t => t.id === id);
    if (!tc) return;

    editingTestCaseId = id;
    document.getElementById('tc-modal-title').textContent = 'Edit Test Case';
    document.getElementById('tc-module').value = tc.module || '';
    document.getElementById('tc-category').value = tc.category || 'functional';
    document.getElementById('tc-scenario').value = tc.scenario || '';
    document.getElementById('tc-steps').value = tc.steps || '';
    document.getElementById('tc-expected').value = tc.expected_result || '';
    document.getElementById('tc-preconditions').value = tc.preconditions || '';
    document.getElementById('tc-testdata').value = tc.test_data || '';
    document.getElementById('tc-form-error').textContent = '';
    document.getElementById('tc-save-btn').textContent = 'Update';
    openModal('tc-modal');
}

function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// ── Save Test Case ────────────────────────────────────────────────────
async function saveTestCase() {
    const errorEl = document.getElementById('tc-form-error');
    errorEl.textContent = '';

    const module = document.getElementById('tc-module').value.trim();
    const category = document.getElementById('tc-category').value;
    const scenario = document.getElementById('tc-scenario').value.trim();
    const steps = document.getElementById('tc-steps').value.trim();
    const expected = document.getElementById('tc-expected').value.trim();
    const preconditions = document.getElementById('tc-preconditions').value.trim();
    const testdata = document.getElementById('tc-testdata').value.trim();

    // Validate required fields
    if (!module || !category || !scenario || !steps || !expected) {
        errorEl.textContent = 'Module, Category, Scenario, Steps, and Expected Result are required.';
        return;
    }

    const saveBtn = document.getElementById('tc-save-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
        if (DEV_MODE) {
            if (editingTestCaseId) {
                // Update existing in local array
                const idx = allTestCases.findIndex(t => t.id === editingTestCaseId);
                if (idx !== -1) {
                    allTestCases[idx] = {
                        ...allTestCases[idx],
                        module,
                        category,
                        scenario,
                        steps,
                        expected_result: expected,
                        preconditions,
                        test_data: testdata,
                        revision: (allTestCases[idx].revision || 1) + 1,
                        updated_at: new Date().toISOString()
                    };
                }
                console.log('[DEV MODE] Updated test case:', editingTestCaseId);
            } else {
                // Add new to local array
                const newIndex = allTestCases.length + 1;
                const newTC = {
                    id: 'tc-' + String(newIndex).padStart(3, '0'),
                    tc_index: 'TC-' + String(newIndex).padStart(3, '0'),
                    module,
                    category,
                    scenario,
                    steps,
                    expected_result: expected,
                    preconditions,
                    test_data: testdata,
                    revision: 1,
                    is_archived: false,
                    previously_failed: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    last_runs: []
                };
                allTestCases.push(newTC);
                console.log('[DEV MODE] Added test case:', newTC.tc_index);
            }

            localStorage.setItem('fullbeat_dev_test_cases', JSON.stringify(allTestCases));
            populateModuleFilter();
            filterTestCases();
            closeModal('tc-modal');
            return;
        }

        // Supabase save
        const projectId = getSelectedProjectId();
        if (!projectId) {
            errorEl.textContent = 'No project selected.';
            return;
        }

        if (editingTestCaseId) {
            // Fetch current revision
            const existing = allTestCases.find(t => t.id === editingTestCaseId);
            const newRevision = (existing ? existing.revision || 1 : 1) + 1;

            const { error } = await supabase
                .from('test_cases')
                .update({
                    module,
                    category,
                    scenario,
                    steps,
                    expected_result: expected,
                    preconditions,
                    test_data: testdata,
                    revision: newRevision,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingTestCaseId);

            if (error) throw error;
        } else {
            // Generate next TC index
            const maxIndex = allTestCases.reduce((max, tc) => {
                const num = parseInt(tc.tc_index.replace('TC-', ''), 10);
                return num > max ? num : max;
            }, 0);
            const newTcIndex = 'TC-' + String(maxIndex + 1).padStart(3, '0');

            const { error } = await supabase
                .from('test_cases')
                .insert({
                    project_id: projectId,
                    tc_index: newTcIndex,
                    module,
                    category,
                    scenario,
                    steps,
                    expected_result: expected,
                    preconditions,
                    test_data: testdata,
                    revision: 1,
                    is_archived: false,
                    previously_failed: false
                });

            if (error) throw error;
        }

        closeModal('tc-modal');
        await loadTestCases();
    } catch (err) {
        console.error('Error saving test case:', err);
        errorEl.textContent = err.message || 'Failed to save test case.';
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = editingTestCaseId ? 'Update' : 'Save';
    }
}

// ── Archive Test Case (Soft Delete) ───────────────────────────────────
async function archiveTestCase(id) {
    if (!confirm('Archive this test case? It will be hidden from the repository.')) return;

    if (DEV_MODE) {
        const idx = allTestCases.findIndex(t => t.id === id);
        if (idx !== -1) {
            allTestCases.splice(idx, 1);
            console.log('[DEV MODE] Archived test case:', id);
        }
        localStorage.setItem('fullbeat_dev_test_cases', JSON.stringify(allTestCases));
        populateModuleFilter();
        filterTestCases();
        return;
    }

    try {
        const { error } = await supabase
            .from('test_cases')
            .update({ is_archived: true, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
        await loadTestCases();
    } catch (err) {
        console.error('Error archiving test case:', err);
        alert('Failed to archive test case: ' + (err.message || 'Unknown error'));
    }
}

// ── Escape HTML ───────────────────────────────────────────────────────
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ── Upload JSON ──────────────────────────────────────────────────────
var uploadedEntries = [];
var uploadClassified = { newEntries: [], updateEntries: [], skipEntries: [] };
var uploadStep = 1;

function openUploadModal() {
    uploadStep = 1;
    uploadedEntries = [];
    uploadClassified = { newEntries: [], updateEntries: [], skipEntries: [] };
    document.getElementById('upload-step-1').style.display = '';
    document.getElementById('upload-step-2').style.display = 'none';
    document.getElementById('upload-step-3').style.display = 'none';
    document.getElementById('upload-error').textContent = '';
    document.getElementById('upload-file-input').value = '';
    document.getElementById('upload-modal-title').textContent = 'Upload Test Cases (JSON)';
    // Show/hide buttons
    document.getElementById('upload-btn-back').style.display = 'none';
    document.getElementById('upload-btn-next').style.display = 'none';
    document.getElementById('upload-btn-import').style.display = 'none';
    document.getElementById('upload-btn-close').style.display = 'none';
    document.getElementById('upload-btn-map').style.display = 'none';
    openModal('upload-modal');
}

function setupUploadHandlers() {
    var dropzone = document.getElementById('upload-dropzone');
    var fileInput = document.getElementById('upload-file-input');
    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', function() { fileInput.click(); });
    dropzone.addEventListener('dragover', function(e) { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', function() { dropzone.classList.remove('dragover'); });
    dropzone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        var files = e.dataTransfer.files;
        if (files.length > 0) handleUploadFile(files[0]);
    });
    fileInput.addEventListener('change', function() {
        if (fileInput.files.length > 0) handleUploadFile(fileInput.files[0]);
    });

    document.getElementById('btn-upload-tc').addEventListener('click', openUploadModal);
}

function handleUploadFile(file) {
    var errorEl = document.getElementById('upload-error');
    errorEl.textContent = '';

    if (!file.name.endsWith('.json')) {
        errorEl.textContent = 'Please upload a .json file.';
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        errorEl.textContent = 'File too large (max 2MB).';
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var parsed = JSON.parse(e.target.result);
            var entries = Array.isArray(parsed) ? parsed : (parsed.test_cases || parsed.testCases || []);
            if (!Array.isArray(entries) || entries.length === 0) {
                errorEl.textContent = 'No test cases found in the file.';
                return;
            }
            if (entries.length > 500) {
                errorEl.textContent = 'Too many entries (max 500). Found ' + entries.length + '.';
                return;
            }
            uploadedEntries = entries;
            classifyAndPreview();
        } catch (err) {
            errorEl.textContent = 'Invalid JSON: ' + err.message;
        }
    };
    reader.readAsText(file);
}

function classifyAndPreview() {
    var mode = document.querySelector('input[name="upload-mode"]:checked').value;
    var newE = [], updateE = [], skipE = [];
    var required = ['tc_index', 'module', 'category', 'scenario', 'steps', 'expected_result'];
    var validCategories = ['smoke', 'sanity', 'functional', 'regression', 'negative', 'performance'];
    var seen = {};

    uploadedEntries.forEach(function(entry) {
        // Normalize tc_index
        if (entry.tc_index && typeof entry.tc_index === 'number') {
            entry.tc_index = 'TC-' + String(entry.tc_index).padStart(3, '0');
        }
        if (entry.tc_index && !entry.tc_index.startsWith('TC-')) {
            entry.tc_index = 'TC-' + entry.tc_index;
        }

        // Validate required fields
        var missing = required.filter(function(f) { return !entry[f] || !String(entry[f]).trim(); });
        if (missing.length > 0) {
            entry._skipReason = 'Missing: ' + missing.join(', ');
            skipE.push(entry);
            return;
        }
        // Validate category
        if (validCategories.indexOf(entry.category.toLowerCase()) === -1) {
            entry._skipReason = 'Invalid category: ' + entry.category;
            skipE.push(entry);
            return;
        }
        entry.category = entry.category.toLowerCase();
        // Deduplicate
        if (seen[entry.tc_index]) {
            return; // skip duplicate, keep first
        }
        seen[entry.tc_index] = true;

        // Classify
        var existing = allTestCases.find(function(tc) {
            return tc.tc_index === entry.tc_index || tc.tc_index === entry.tc_index.toUpperCase();
        });
        if (mode === 'update' && existing) {
            entry._existingId = existing.id;
            entry._existingRevision = existing.revision || 1;
            updateE.push(entry);
        } else {
            newE.push(entry);
        }
    });

    uploadClassified = { newEntries: newE, updateEntries: updateE, skipEntries: skipE };

    // Show preview
    uploadStep = 2;
    document.getElementById('upload-step-1').style.display = 'none';
    document.getElementById('upload-step-2').style.display = '';
    document.getElementById('upload-modal-title').textContent = 'Preview — ' + (newE.length + updateE.length) + ' test cases';
    document.getElementById('upload-preview-summary').innerHTML =
        '<span class="badge badge-success">' + newE.length + ' new</span> ' +
        '<span class="badge badge-primary">' + updateE.length + ' updates</span> ' +
        '<span class="badge">' + skipE.length + ' skipped</span>';

    var tbody = document.getElementById('upload-preview-tbody');
    tbody.innerHTML = '';
    newE.forEach(function(e) { addPreviewRow(tbody, e, 'New', 'badge-success'); });
    updateE.forEach(function(e) { addPreviewRow(tbody, e, 'Update', 'badge-primary'); });
    skipE.forEach(function(e) { addPreviewRow(tbody, e, 'Skip', '', e._skipReason); });

    // Buttons
    document.getElementById('upload-btn-back').style.display = '';
    document.getElementById('upload-btn-next').style.display = 'none';
    document.getElementById('upload-btn-import').style.display = '';
    document.getElementById('upload-btn-close').style.display = 'none';
    document.getElementById('upload-btn-map').style.display = 'none';
}

function addPreviewRow(tbody, entry, actionLabel, badgeClass, tooltip) {
    var tr = document.createElement('tr');
    if (tooltip) tr.style.opacity = '0.5';
    tr.innerHTML =
        '<td>' + escapeHtml(entry.tc_index) + '</td>' +
        '<td>' + escapeHtml(entry.module) + '</td>' +
        '<td>' + escapeHtml(entry.category) + '</td>' +
        '<td>' + escapeHtml(entry.scenario) + '</td>' +
        '<td><span class="badge ' + (badgeClass || '') + '" title="' + escapeHtml(tooltip || '') + '">' + actionLabel + '</span></td>';
    tbody.appendChild(tr);
}

function uploadGoBack() {
    uploadStep = 1;
    document.getElementById('upload-step-1').style.display = '';
    document.getElementById('upload-step-2').style.display = 'none';
    document.getElementById('upload-step-3').style.display = 'none';
    document.getElementById('upload-modal-title').textContent = 'Upload Test Cases (JSON)';
    document.getElementById('upload-btn-back').style.display = 'none';
    document.getElementById('upload-btn-import').style.display = 'none';
    document.getElementById('upload-btn-next').style.display = 'none';
}

function uploadNext() {} // placeholder, not used currently

function executeImport() {
    var newE = uploadClassified.newEntries;
    var updateE = uploadClassified.updateEntries;
    var created = 0, updated = 0;

    // Process new entries
    newE.forEach(function(entry) {
        var newTC = {
            id: generateId(),
            tc_index: entry.tc_index,
            module: entry.module,
            category: entry.category,
            scenario: entry.scenario,
            steps: entry.steps,
            expected_result: entry.expected_result,
            preconditions: entry.preconditions || '',
            test_data: entry.test_data || '',
            revision: 1,
            is_archived: false,
            previously_failed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_runs: []
        };
        allTestCases.push(newTC);
        created++;
    });

    // Process updates
    updateE.forEach(function(entry) {
        var idx = allTestCases.findIndex(function(tc) { return tc.id === entry._existingId; });
        if (idx !== -1) {
            allTestCases[idx].module = entry.module;
            allTestCases[idx].category = entry.category;
            allTestCases[idx].scenario = entry.scenario;
            allTestCases[idx].steps = entry.steps;
            allTestCases[idx].expected_result = entry.expected_result;
            allTestCases[idx].preconditions = entry.preconditions || allTestCases[idx].preconditions;
            allTestCases[idx].test_data = entry.test_data || allTestCases[idx].test_data;
            allTestCases[idx].revision = (entry._existingRevision || 1) + 1;
            allTestCases[idx].updated_at = new Date().toISOString();
            updated++;
        }
    });

    // Persist to localStorage
    localStorage.setItem('fullbeat_dev_test_cases', JSON.stringify(allTestCases));

    // Store imported indices for plan mapping
    var importedIndices = newE.concat(updateE).map(function(e) { return e.tc_index; });
    localStorage.setItem('fullbeat_pending_map', JSON.stringify(importedIndices));
    localStorage.setItem('fullbeat_last_import', JSON.stringify({
        tc_indices: importedIndices,
        timestamp: new Date().toISOString(),
        plan_id: null
    }));

    // Refresh table
    populateModuleFilter();
    filterTestCases();

    // Show result
    uploadStep = 3;
    document.getElementById('upload-step-1').style.display = 'none';
    document.getElementById('upload-step-2').style.display = 'none';
    document.getElementById('upload-step-3').style.display = '';
    document.getElementById('upload-modal-title').textContent = 'Import Complete';
    document.getElementById('upload-result-summary').innerHTML =
        '<div style="font-size:48px;margin-bottom:12px;">&#9989;</div>' +
        '<h3>' + created + ' created, ' + updated + ' updated</h3>' +
        '<p class="text-muted">' + uploadClassified.skipEntries.length + ' skipped</p>';

    // Buttons
    document.getElementById('upload-btn-back').style.display = 'none';
    document.getElementById('upload-btn-import').style.display = 'none';
    document.getElementById('upload-btn-close').style.display = '';
    document.getElementById('upload-btn-map').style.display = '';
}

function goToMapPlan() {
    closeModal('upload-modal');
    window.location.href = 'plans.html';
}

// ── Init on DOM Ready ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', initRepository);
