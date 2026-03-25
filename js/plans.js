// FullBeat — Test Plans Module

// Local plans array (used in DEV_MODE)
let plansData = [];
let allTestCases = [];
let allTesters = [];
let wizardCurrentStep = 1;
let wizardSelectedCases = [];
let wizardAssignments = {}; // { tcIndex: userId }
let planSeqCounter = 4; // next sequence number for new plans

// ============================================================
// MOCK DATA
// ============================================================

function getPlansPageMockPlans() {
    return [
        {
        "id": "plan-bb-001",
        "plan_id_display": "TP-2026-004",
        "project_id": "proj-1",
        "name": "BrainBoot Manual Test V2 \u2014 Full Regression",
        "type": "regression",
        "environment": "testing",
        "version": "v2.0",
        "notes": "Complete manual test plan from BB-DOC-QA-MANUAL-TESTPLAN-V2. Covers all 15 modules: Registration, Login, Forgot Password, Dashboard, Sidebar, Contact, Support, Profile, Referral, Sample Test, Chatbot, App Tour, Payments, Dark Theme, Cross-Cutting.",
        "status": "draft",
        "items": [
                {
                        "tc_index": 1,
                        "module": "Registration",
                        "scenario": "Register with valid email",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 2,
                        "module": "Registration",
                        "scenario": "Register with invalid email",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 3,
                        "module": "Registration",
                        "scenario": "Register with existing email",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 4,
                        "module": "Registration",
                        "scenario": "Resend email after 60s cooldown",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 5,
                        "module": "Registration",
                        "scenario": "Resend before cooldown expires",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 6,
                        "module": "Registration",
                        "scenario": "Mobile layout check",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 7,
                        "module": "Registration",
                        "scenario": "Click valid activation link",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 8,
                        "module": "Registration",
                        "scenario": "Click expired activation link (>10 min)",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 9,
                        "module": "Registration",
                        "scenario": "Click activation link twice",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 10,
                        "module": "Registration",
                        "scenario": "Tampered activation link",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 11,
                        "module": "Registration",
                        "scenario": "Successful face capture",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 12,
                        "module": "Registration",
                        "scenario": "Deny camera permission",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 13,
                        "module": "Registration",
                        "scenario": "No face in frame",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 14,
                        "module": "Registration",
                        "scenario": "Face capture timeout (10 min)",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 15,
                        "module": "Registration",
                        "scenario": "Face capture on mobile",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 16,
                        "module": "Registration",
                        "scenario": "Complete profile with all required fields",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 17,
                        "module": "Registration",
                        "scenario": "Submit without first name",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 18,
                        "module": "Registration",
                        "scenario": "Submit without accepting terms",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 19,
                        "module": "Registration",
                        "scenario": "Password too short",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 20,
                        "module": "Registration",
                        "scenario": "Passwords don't match",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 21,
                        "module": "Registration",
                        "scenario": "Referral code accepted",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 22,
                        "module": "Registration",
                        "scenario": "Invalid referral code",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 23,
                        "module": "Registration",
                        "scenario": "Auto-save draft on refresh",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 24,
                        "module": "Registration",
                        "scenario": "Phone already registered",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 25,
                        "module": "Registration",
                        "scenario": "Profile form mobile layout",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 26,
                        "module": "Login",
                        "scenario": "Login with correct credentials",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 27,
                        "module": "Login",
                        "scenario": "Login with wrong password",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 28,
                        "module": "Login",
                        "scenario": "Login with non-existent email",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 29,
                        "module": "Login",
                        "scenario": "Login with empty fields",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 30,
                        "module": "Login",
                        "scenario": "Show/hide password toggle",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 31,
                        "module": "Login",
                        "scenario": "\"Forgot password?\" link works",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 32,
                        "module": "Login",
                        "scenario": "\"Register Now\" link works",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 33,
                        "module": "Login",
                        "scenario": "Login page mobile layout",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 34,
                        "module": "Login",
                        "scenario": "First login \u00e2\u20ac\u201d grace period pass",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 35,
                        "module": "Login",
                        "scenario": "Second login same device \u00e2\u20ac\u201d trusted device",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 36,
                        "module": "Login",
                        "scenario": "Login from NEW device after grace period",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 37,
                        "module": "Login",
                        "scenario": "OTP verification succeeds",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 38,
                        "module": "Login",
                        "scenario": "Wrong OTP code",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 39,
                        "module": "Login",
                        "scenario": "OTP max attempts exhausted (3)",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 40,
                        "module": "Login",
                        "scenario": "Active session on another device \u00e2\u20ac\u201d takeover",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 41,
                        "module": "Login",
                        "scenario": "OTP expiry countdown",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 42,
                        "module": "Login",
                        "scenario": "OTP resend after expiry",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 43,
                        "module": "Login",
                        "scenario": "Staff/admin bypasses gate",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 44,
                        "module": "Login",
                        "scenario": "Cancel returns to login",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 45,
                        "module": "Forgot Password",
                        "scenario": "Request password reset",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 46,
                        "module": "Forgot Password",
                        "scenario": "Non-existent email",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 47,
                        "module": "Forgot Password",
                        "scenario": "Complete password reset",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 48,
                        "module": "Forgot Password",
                        "scenario": "Expired reset link (>10 min)",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 49,
                        "module": "Dashboard",
                        "scenario": "Dashboard loads for new user",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 50,
                        "module": "Dashboard",
                        "scenario": "Sunday test countdown (upcoming)",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 51,
                        "module": "Dashboard",
                        "scenario": "Sunday test LIVE state",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 52,
                        "module": "Dashboard",
                        "scenario": "Results pending state",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 53,
                        "module": "Dashboard",
                        "scenario": "Results published state",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 54,
                        "module": "Dashboard",
                        "scenario": "Gold Strategy card (free user)",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 55,
                        "module": "Dashboard",
                        "scenario": "6-week sprint timeline",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 56,
                        "module": "Dashboard",
                        "scenario": "Subject cards show empty state",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 57,
                        "module": "Dashboard",
                        "scenario": "Dashboard mobile layout",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 58,
                        "module": "Dashboard",
                        "scenario": "Theme toggle",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 59,
                        "module": "Sidebar Navigation",
                        "scenario": "Sidebar items visible (free user)",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 60,
                        "module": "Sidebar Navigation",
                        "scenario": "Sample Test navigation",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 61,
                        "module": "Sidebar Navigation",
                        "scenario": "Locked features show icon",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 62,
                        "module": "Sidebar Navigation",
                        "scenario": "Sidebar collapse/expand (desktop)",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 63,
                        "module": "Sidebar Navigation",
                        "scenario": "Mobile sidebar overlay",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 64,
                        "module": "Sidebar Navigation",
                        "scenario": "User menu dropdown",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 65,
                        "module": "Sidebar Navigation",
                        "scenario": "Tour replay button",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 66,
                        "module": "Contact Page",
                        "scenario": "Full contact flow",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 67,
                        "module": "Contact Page",
                        "scenario": "Wrong OTP on contact form",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 68,
                        "module": "Contact Page",
                        "scenario": "Expired OTP (>10 min)",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 69,
                        "module": "Contact Page",
                        "scenario": "Empty message validation",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 70,
                        "module": "Contact Page",
                        "scenario": "No purpose selected",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 71,
                        "module": "Contact Page",
                        "scenario": "OTP paste 6 digits",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 72,
                        "module": "Contact Page",
                        "scenario": "Change email after OTP sent",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 73,
                        "module": "Contact Page",
                        "scenario": "Resend cooldown (60s)",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 74,
                        "module": "Contact Page",
                        "scenario": "Contact page mobile",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 75,
                        "module": "Support Page",
                        "scenario": "Submit support ticket",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 76,
                        "module": "Support Page",
                        "scenario": "All 11 categories clickable",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 77,
                        "module": "Support Page",
                        "scenario": "Short subject rejected",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 78,
                        "module": "Support Page",
                        "scenario": "Short description rejected",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 79,
                        "module": "Support Page",
                        "scenario": "Recent tickets display",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 80,
                        "module": "Support Page",
                        "scenario": "Unauthenticated access blocked",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 81,
                        "module": "Support Page",
                        "scenario": "Back to categories",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 82,
                        "module": "Support Page",
                        "scenario": "Support page mobile",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 83,
                        "module": "Profile Page",
                        "scenario": "Profile loads correctly",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 84,
                        "module": "Profile Page",
                        "scenario": "Edit and save name",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 85,
                        "module": "Profile Page",
                        "scenario": "Phone \"Not Set\" display",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 86,
                        "module": "Profile Page",
                        "scenario": "Privacy toggle persists",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 87,
                        "module": "Profile Page",
                        "scenario": "Change password",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 88,
                        "module": "Profile Page",
                        "scenario": "Empty name rejected",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 89,
                        "module": "Profile Page",
                        "scenario": "Language preference",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 90,
                        "module": "Profile Page",
                        "scenario": "Logout button",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 91,
                        "module": "Profile Page",
                        "scenario": "Profile page mobile",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 92,
                        "module": "Referral Page",
                        "scenario": "Referral page loads",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 93,
                        "module": "Referral Page",
                        "scenario": "Copy referral link",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 94,
                        "module": "Referral Page",
                        "scenario": "Copy coupon code",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 95,
                        "module": "Referral Page",
                        "scenario": "WhatsApp share",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 96,
                        "module": "Referral Page",
                        "scenario": "X (Twitter) share",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 97,
                        "module": "Referral Page",
                        "scenario": "Facebook share",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 98,
                        "module": "Referral Page",
                        "scenario": "Telegram share",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 99,
                        "module": "Referral Page",
                        "scenario": "How You Earn Credits (collapsible)",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 100,
                        "module": "Referral Page",
                        "scenario": "Weekly slot tracker",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 101,
                        "module": "Referral Page",
                        "scenario": "Referral page mobile",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 102,
                        "module": "Sample Test",
                        "scenario": "Start sample test",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 103,
                        "module": "Sample Test",
                        "scenario": "Answer a question",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 104,
                        "module": "Sample Test",
                        "scenario": "Submit sample test",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 105,
                        "module": "Sample Test",
                        "scenario": "Question grid navigation",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 106,
                        "module": "Sample Test",
                        "scenario": "Flag question for review",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 107,
                        "module": "Sample Test",
                        "scenario": "Clear answer",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 108,
                        "module": "Sample Test",
                        "scenario": "Sample test mobile",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 109,
                        "module": "Chatbot",
                        "scenario": "Open chatbot",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 110,
                        "module": "Chatbot",
                        "scenario": "Ask quick question",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 111,
                        "module": "Chatbot",
                        "scenario": "30-word limit",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 112,
                        "module": "Chatbot",
                        "scenario": "Auth gate (not logged in)",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 113,
                        "module": "Chatbot",
                        "scenario": "Chatbot hidden during test",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 114,
                        "module": "Chatbot",
                        "scenario": "Support ticket from chatbot",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 115,
                        "module": "Chatbot",
                        "scenario": "Close chatbot",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 116,
                        "module": "App Tour",
                        "scenario": "Tour auto-triggers on 3rd visit",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 117,
                        "module": "App Tour",
                        "scenario": "Navigate tour steps",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 118,
                        "module": "App Tour",
                        "scenario": "Skip tour",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 119,
                        "module": "App Tour",
                        "scenario": "Tour replay from sidebar",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 120,
                        "module": "App Tour",
                        "scenario": "Tour on mobile",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 121,
                        "module": "Payments",
                        "scenario": "Pricing modal (pre-launch)",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 122,
                        "module": "Payments",
                        "scenario": "Checkout page loads (post-launch)",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 123,
                        "module": "Payments",
                        "scenario": "Valid promo code",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 124,
                        "module": "Payments",
                        "scenario": "Invalid promo code",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 125,
                        "module": "Payments",
                        "scenario": "Razorpay checkout",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 126,
                        "module": "Payments",
                        "scenario": "Payment success",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 127,
                        "module": "Payments",
                        "scenario": "Payment cancelled",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 128,
                        "module": "Dark Theme",
                        "scenario": "Dark theme \u00e2\u20ac\u201d all pages readable",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 129,
                        "module": "Dark Theme",
                        "scenario": "Light theme \u00e2\u20ac\u201d all pages readable",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 130,
                        "module": "Dark Theme",
                        "scenario": "Theme persists on refresh",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 131,
                        "module": "Cross-Cutting Tests",
                        "scenario": "AuthGuard blocks unauthenticated",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 132,
                        "module": "Cross-Cutting Tests",
                        "scenario": "Error toast on network failure",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 133,
                        "module": "Cross-Cutting Tests",
                        "scenario": "Loading states on all pages",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 134,
                        "module": "Cross-Cutting Tests",
                        "scenario": "Console access blocked for learner",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 135,
                        "module": "Cross-Cutting Tests",
                        "scenario": "Support admin blocked for learner",
                        "assigned_to": "user-003",
                        "status": "pending"
                },
                {
                        "tc_index": 136,
                        "module": "Cross-Cutting Tests",
                        "scenario": "Touch targets >= 44px",
                        "assigned_to": "user-001",
                        "status": "pending"
                },
                {
                        "tc_index": 137,
                        "module": "Cross-Cutting Tests",
                        "scenario": "No horizontal scroll on any page",
                        "assigned_to": "user-002",
                        "status": "pending"
                },
                {
                        "tc_index": 138,
                        "module": "Cross-Cutting Tests",
                        "scenario": "PWA install prompt (Android)",
                        "assigned_to": "user-003",
                        "status": "pending"
                }
        ],
        "created_by": "dev-admin-001",
        "created_at": "2026-03-24T09:00:00Z",
        "updated_at": "2026-03-24T09:00:00Z"
},
        {
            id: 'plan-001',
            plan_id_display: 'TP-2026-001',
            project_id: 'proj-1',
            name: 'Smoke Test v2.0',
            type: 'smoke',
            environment: 'production',
            version: 'v2.0.0',
            notes: 'Pre-release smoke test for v2.0.0 production deployment.',
            status: 'active',
            items: [
                { tc_index: 1, module: 'Authentication', scenario: 'Valid login with correct credentials', assigned_to: 'user-001', status: 'pass' },
                { tc_index: 4, module: 'Dashboard', scenario: 'Dashboard loads with correct summary cards', assigned_to: 'user-001', status: 'pass' },
                { tc_index: 7, module: 'Notifications', scenario: 'Toast notifications appear and auto-dismiss', assigned_to: 'user-002', status: 'pass' },
                { tc_index: 2, module: 'Authentication', scenario: 'Login with invalid password', assigned_to: 'user-002', status: 'fail' },
                { tc_index: 3, module: 'Authentication', scenario: 'Password change enforced on first login', assigned_to: 'user-001', status: 'pending' }
            ],
            created_by: 'dev-admin-001',
            created_at: '2026-03-01T09:00:00Z',
            updated_at: '2026-03-20T14:30:00Z'
        },
        {
            id: 'plan-002',
            plan_id_display: 'TP-2026-002',
            project_id: 'proj-1',
            name: 'Regression Sprint 14',
            type: 'regression',
            environment: 'testing',
            version: 'v2.1.0-beta',
            notes: 'Full regression run for Sprint 14 beta release.',
            status: 'draft',
            items: [
                { tc_index: 1, module: 'Authentication', scenario: 'Valid login with correct credentials', assigned_to: 'user-001', status: 'pending' },
                { tc_index: 2, module: 'Authentication', scenario: 'Login with invalid password', assigned_to: 'user-001', status: 'pending' },
                { tc_index: 3, module: 'Authentication', scenario: 'Password change enforced on first login', assigned_to: 'user-002', status: 'pending' },
                { tc_index: 4, module: 'Dashboard', scenario: 'Dashboard loads with correct summary cards', assigned_to: 'user-002', status: 'pending' },
                { tc_index: 5, module: 'Dashboard', scenario: 'Project selector filters dashboard data', assigned_to: 'user-003', status: 'pending' },
                { tc_index: 6, module: 'User Profile', scenario: 'User can view their profile information', assigned_to: 'user-003', status: 'pending' },
                { tc_index: 7, module: 'Notifications', scenario: 'Toast notifications appear and auto-dismiss', assigned_to: 'user-001', status: 'pending' },
                { tc_index: 8, module: 'Notifications', scenario: 'Error toast shown on network failure', assigned_to: 'user-002', status: 'pending' },
                { tc_index: 9, module: 'Settings', scenario: 'Admin can create new project', assigned_to: 'user-003', status: 'pending' },
                { tc_index: 10, module: 'Settings', scenario: 'Deactivated user cannot access the system', assigned_to: 'user-001', status: 'pending' }
            ],
            created_by: 'dev-admin-001',
            created_at: '2026-03-20T08:00:00Z',
            updated_at: '2026-03-20T08:00:00Z'
        },
        {
            id: 'plan-003',
            plan_id_display: 'TP-2026-003',
            project_id: 'proj-1',
            name: 'Sanity Check Hotfix',
            type: 'sanity',
            environment: 'testing',
            version: 'v2.0.1',
            notes: 'Quick sanity check after hotfix deployment for login bug.',
            status: 'completed',
            items: [
                { tc_index: 1, module: 'Authentication', scenario: 'Valid login with correct credentials', assigned_to: 'user-001', status: 'pass' },
                { tc_index: 4, module: 'Dashboard', scenario: 'Dashboard loads with correct summary cards', assigned_to: 'user-001', status: 'pass' },
                { tc_index: 7, module: 'Notifications', scenario: 'Toast notifications appear and auto-dismiss', assigned_to: 'user-002', status: 'pass' }
            ],
            created_by: 'dev-admin-001',
            created_at: '2026-03-10T10:00:00Z',
            updated_at: '2026-03-12T16:45:00Z'
        }
    ];
}

// ============================================================
// INITIALIZATION
// ============================================================

async function initPlans() {
    const session = await requireAuth();
    if (!session) return;

    await initAppShell(session);

    // Load test cases and testers for wizard
    if (typeof DEV_MODE !== 'undefined' && DEV_MODE) {
        var stored = localStorage.getItem('fullbeat_dev_test_cases');
        allTestCases = stored ? JSON.parse(stored) : getMockTestCases();
        allTesters = getMockUsers().filter(u => u.role === 'tester' && u.is_active);
    }

    // Load plans
    await loadPlans();

    // Bind create button
    document.getElementById('btn-create-plan').addEventListener('click', openWizard);

    // Bind select-all checkboxes
    document.getElementById('select-all-tc').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('#wizard-tc-tbody input[type="checkbox"]');
        checkboxes.forEach(cb => { cb.checked = this.checked; });
    });

    document.getElementById('customize-all-tc').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('#wizard-customize-tbody input[type="checkbox"]');
        checkboxes.forEach(cb => { cb.checked = this.checked; });
        updateSelectedCount();
    });

    // Check for pending import
    checkPendingImport();
}

// ============================================================
// LOAD & RENDER PLANS
// ============================================================

async function loadPlans() {
    if (typeof DEV_MODE !== 'undefined' && DEV_MODE) {
        plansData = getPlansPageMockPlans();
        localStorage.setItem('fullbeat_dev_plans', JSON.stringify(plansData));
        renderPlans(plansData);
        return;
    }

    const projectId = getSelectedProjectId();
    if (!projectId) return;

    const { data, error } = await supabase
        .from('test_plans')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading plans:', error);
        return;
    }
    plansData = data || [];
    renderPlans(plansData);
}

function renderPlans(plans) {
    const tbody = document.getElementById('plans-tbody');
    if (!tbody) return;

    if (plans.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--gray-400);">No test plans yet. Click "+ Create Plan" to get started.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    plans.forEach(plan => {
        const progress = calcProgress(plan);
        const statusBadge = getStatusBadge(plan.status);
        const typeBadge = getTypeBadge(plan.type);
        const envBadge = plan.environment === 'production'
            ? '<span class="badge badge-danger">Production</span>'
            : '<span class="badge badge-info" style="background:var(--info-bg);color:#1d4ed8;">Testing</span>';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${escapeHtml(plan.plan_id_display)}</strong></td>
            <td>${escapeHtml(plan.name)}</td>
            <td>${typeBadge}</td>
            <td>${envBadge}</td>
            <td>${escapeHtml(plan.version || '—')}</td>
            <td>${statusBadge}</td>
            <td style="min-width:140px;">
                <div class="progress-bar-container">
                    <div class="progress-bar ${progress === 100 ? 'bar-success' : ''}" style="width:${progress}%"></div>
                </div>
                <span class="progress-text">${progress}% (${getExecutedCount(plan)}/${plan.items.length})</span>
            </td>
            <td>
                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                    <button class="btn btn-sm btn-primary" onclick="openPlanDetail('${plan.id}')">View</button>
                    ${plan.status === 'draft' ? `<button class="btn btn-sm btn-success" onclick="activatePlan('${plan.id}')">Activate</button>` : ''}
                    ${plan.status === 'active' ? `<button class="btn btn-sm btn-success" onclick="completePlan('${plan.id}')">Complete</button>` : ''}
                    ${(plan.status === 'completed' || plan.status === 'active') ? `<button class="btn btn-sm" style="background:var(--warning);color:#fff;" onclick="archivePlan('${plan.id}')">Archive</button>` : ''}
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function calcProgress(plan) {
    if (!plan.items || plan.items.length === 0) return 0;
    const executed = plan.items.filter(i => i.status !== 'pending').length;
    return Math.round((executed / plan.items.length) * 100);
}

function getExecutedCount(plan) {
    if (!plan.items) return 0;
    return plan.items.filter(i => i.status !== 'pending').length;
}

function getStatusBadge(status) {
    switch (status) {
        case 'draft':     return '<span class="badge" style="background:var(--gray-100);color:var(--gray-600);">Draft</span>';
        case 'active':    return '<span class="badge badge-primary">Active</span>';
        case 'completed': return '<span class="badge badge-success">Completed</span>';
        case 'archived':  return '<span class="badge badge-warning">Archived</span>';
        default:          return '<span class="badge">' + escapeHtml(status) + '</span>';
    }
}

function getTypeBadge(type) {
    switch (type) {
        case 'smoke':      return '<span class="badge" style="background:#fef3c7;color:#92400e;">Smoke</span>';
        case 'sanity':     return '<span class="badge" style="background:#dbeafe;color:#1e40af;">Sanity</span>';
        case 'regression': return '<span class="badge" style="background:#ede9fe;color:#5b21b6;">Regression</span>';
        case 'custom':     return '<span class="badge" style="background:var(--gray-100);color:var(--gray-600);">Custom</span>';
        default:           return '<span class="badge">' + escapeHtml(type) + '</span>';
    }
}

// ============================================================
// PLAN DETAIL MODAL
// ============================================================

function openPlanDetail(planId) {
    const plan = plansData.find(p => p.id === planId);
    if (!plan) return;

    document.getElementById('plan-detail-title').textContent = plan.plan_id_display + ' — ' + plan.name;

    const progress = calcProgress(plan);
    const users = (typeof DEV_MODE !== 'undefined' && DEV_MODE) ? getMockUsers() : [];

    let itemsHtml = '';
    if (plan.items && plan.items.length > 0) {
        itemsHtml = `
            <div class="table-container" style="max-height:300px;overflow-y:auto;">
                <table>
                    <thead>
                        <tr>
                            <th>TC</th>
                            <th>Module</th>
                            <th>Scenario</th>
                            <th>Assigned To</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${plan.items.map(item => {
                            const assignedUser = users.find(u => u.id === item.assigned_to);
                            const assignedName = assignedUser ? assignedUser.display_name : (item.assigned_to || 'Unassigned');
                            const resultBadge = getItemResultBadge(item.status);
                            return `<tr>
                                <td>TC-${String(item.tc_index).padStart(3, '0')}</td>
                                <td>${escapeHtml(item.module)}</td>
                                <td>${escapeHtml(item.scenario)}</td>
                                <td>${escapeHtml(assignedName)}</td>
                                <td>${resultBadge}</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        itemsHtml = '<p style="color:var(--gray-400);text-align:center;padding:20px;">No test cases in this plan.</p>';
    }

    document.getElementById('plan-detail-body').innerHTML = `
        <div class="plan-detail-info">
            <div class="info-item"><strong>Type</strong>${escapeHtml(plan.type)}</div>
            <div class="info-item"><strong>Environment</strong>${escapeHtml(plan.environment)}</div>
            <div class="info-item"><strong>Version</strong>${escapeHtml(plan.version || '—')}</div>
            <div class="info-item"><strong>Status</strong>${getStatusBadge(plan.status)}</div>
            <div class="info-item"><strong>Created</strong>${formatDate(plan.created_at)}</div>
            <div class="info-item"><strong>Updated</strong>${formatDate(plan.updated_at)}</div>
        </div>
        ${plan.notes ? '<div style="margin-bottom:16px;"><strong style="display:block;font-size:12px;color:var(--gray-500);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Release Notes</strong><p style="font-size:14px;color:var(--gray-700);">' + escapeHtml(plan.notes) + '</p></div>' : ''}
        ${plan.run_purpose ? `
        <div style="margin-bottom:16px;padding:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:var(--radius);">
            <strong style="display:block;font-size:12px;color:#15803d;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Execution Details</strong>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:14px;">
                <div><strong style="color:#166534;">Run Purpose:</strong> ${escapeHtml(plan.run_purpose)}</div>
                <div><strong style="color:#166534;">Deadline:</strong> ${plan.deadline ? new Date(plan.deadline).toLocaleString() : '—'}</div>
                <div><strong style="color:#166534;">Team:</strong> ${(plan.required_team || []).map(t => escapeHtml(t.name)).join(', ') || '—'}</div>
                ${plan.special_instructions ? `<div><strong style="color:#166534;">Instructions:</strong> ${escapeHtml(plan.special_instructions)}</div>` : ''}
            </div>
        </div>` : ''}
        <div style="margin-bottom:16px;">
            <strong style="display:block;font-size:12px;color:var(--gray-500);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Progress</strong>
            <div class="progress-bar-container" style="height:12px;">
                <div class="progress-bar ${progress === 100 ? 'bar-success' : ''}" style="width:${progress}%"></div>
            </div>
            <span class="progress-text">${progress}% complete (${getExecutedCount(plan)} of ${plan.items.length} executed)</span>
        </div>
        <h4 style="margin-bottom:8px;">Test Cases</h4>
        ${itemsHtml}
    `;

    openModal('plan-detail-modal');
}

function getItemResultBadge(status) {
    switch (status) {
        case 'pass':    return '<span class="badge badge-success">Pass</span>';
        case 'fail':    return '<span class="badge badge-danger">Fail</span>';
        case 'blocked': return '<span class="badge badge-warning">Blocked</span>';
        case 'pending': return '<span class="badge" style="background:var(--gray-100);color:var(--gray-500);">Pending</span>';
        default:        return '<span class="badge">' + escapeHtml(status) + '</span>';
    }
}

// ============================================================
// STATUS CHANGES
// ============================================================

let activatingPlanId = null;

function activatePlan(planId) {
    var plan = plansData.find(function(p) { return p.id === planId; });
    if (!plan) return;

    // Create a simple prompt for deadline
    var deadlineStr = prompt(
        'Activate plan "' + plan.name + '"?\n\n' +
        'Enter deadline (e.g. "13:00" for 1:00 PM today, or "2026-03-25 14:30"):',
        new Date(Date.now() + 4 * 3600000).toTimeString().slice(0, 5) // default: 4 hours from now
    );

    if (deadlineStr === null) return; // cancelled

    // Parse deadline
    var deadline = null;
    if (deadlineStr.trim()) {
        // If just time like "13:00", assume today
        if (/^\d{1,2}:\d{2}$/.test(deadlineStr.trim())) {
            var parts = deadlineStr.trim().split(':');
            var d = new Date();
            d.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
            deadline = d.toISOString();
        } else {
            var parsed = new Date(deadlineStr.trim());
            if (!isNaN(parsed.getTime())) {
                deadline = parsed.toISOString();
            }
        }
    }

    plan.status = 'active';
    plan.deadline = deadline;
    plan.started_at = new Date().toISOString();
    plan.updated_at = new Date().toISOString();

    localStorage.setItem('fullbeat_dev_plans', JSON.stringify(plansData));
    renderPlans(plansData);

    var msg = 'Plan activated: ' + plan.name;
    if (deadline) msg += ' — Deadline: ' + new Date(deadline).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    showToast(msg, 'success');
}

async function confirmActivatePlan() {
    const plan = plansData.find(p => p.id === activatingPlanId);
    if (!plan) return;

    const runPurpose = document.getElementById('activate-run-purpose').value.trim();
    const deadline = document.getElementById('activate-deadline').value;
    const instructions = document.getElementById('activate-instructions').value.trim();
    const errorEl = document.getElementById('activate-error');

    // Get selected team members
    const teamChecks = document.querySelectorAll('.activate-team-check:checked');
    const requiredTeam = [];
    teamChecks.forEach(cb => {
        requiredTeam.push({ id: cb.value, name: cb.getAttribute('data-name') });
    });

    // Validation
    if (!runPurpose) {
        errorEl.textContent = 'Please specify the run purpose.';
        return;
    }
    if (requiredTeam.length === 0) {
        errorEl.textContent = 'Please select at least one team member.';
        return;
    }
    if (!deadline) {
        errorEl.textContent = 'Please set a deadline.';
        return;
    }

    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
        errorEl.textContent = 'Deadline must be in the future.';
        return;
    }

    // Save activation details to plan
    plan.status = 'active';
    plan.run_purpose = runPurpose;
    plan.required_team = requiredTeam;
    plan.deadline = deadline;
    plan.special_instructions = instructions || null;
    plan.activated_at = new Date().toISOString();
    plan.updated_at = new Date().toISOString();

    if (typeof DEV_MODE !== 'undefined' && DEV_MODE) {
        localStorage.setItem('fullbeat_dev_plans', JSON.stringify(plansData));
    } else {
        try {
            const { error } = await supabase
                .from('test_plans')
                .update({
                    status: 'active',
                    run_purpose: runPurpose,
                    required_team: requiredTeam,
                    deadline: deadline,
                    special_instructions: instructions || null,
                    activated_at: plan.activated_at,
                    updated_at: plan.updated_at
                })
                .eq('id', plan.id);

            if (error) throw error;
        } catch (err) {
            console.error('Error activating plan:', err);
            errorEl.textContent = 'Failed to activate plan. Please try again.';
            plan.status = 'draft';
            return;
        }
    }

    closeModal('activate-plan-modal');
    renderPlans(plansData);
    showToast('Plan activated: ' + plan.name, 'success');
}

function completePlan(planId) {
    const plan = plansData.find(p => p.id === planId);
    if (!plan) return;
    if (!confirm('Mark plan "' + plan.name + '" as completed?')) return;

    plan.status = 'completed';
    plan.updated_at = new Date().toISOString();
    localStorage.setItem('fullbeat_dev_plans', JSON.stringify(plansData));
    renderPlans(plansData);
    showToast('Plan completed: ' + plan.name, 'success');
}

function archivePlan(planId) {
    const plan = plansData.find(p => p.id === planId);
    if (!plan) return;
    if (!confirm('Archive plan "' + plan.name + '"? It will be hidden from active views.')) return;

    plan.status = 'archived';
    plan.updated_at = new Date().toISOString();
    localStorage.setItem('fullbeat_dev_plans', JSON.stringify(plansData));
    renderPlans(plansData);
    showToast('Plan archived: ' + plan.name, 'warning');
}

// ============================================================
// WIZARD: CREATE PLAN
// ============================================================

function openWizard() {
    wizardCurrentStep = 1;
    wizardSelectedCases = [];
    wizardAssignments = {};

    // Reset form fields
    document.getElementById('plan-name').value = '';
    document.getElementById('plan-type').value = 'smoke';
    document.getElementById('plan-env').value = 'testing';
    document.getElementById('plan-version').value = '';
    document.getElementById('plan-notes').value = '';

    // Reset step indicators
    updateWizardSteps();
    showWizardStep(1);

    // Show/hide buttons
    document.getElementById('wizard-prev').style.display = 'none';
    document.getElementById('wizard-next').textContent = 'Next';

    openModal('plan-wizard-modal');
}

function wizardNext() {
    if (wizardCurrentStep === 1) {
        // Validate step 1
        const name = document.getElementById('plan-name').value.trim();
        if (!name) {
            showToast('Please enter a plan name.', 'error');
            return;
        }
        // Proceed to step 2: auto-populate test cases
        populateStep2();
    } else if (wizardCurrentStep === 2) {
        // Collect selected from step 2
        collectStep2Selections();
        populateStep3();
    } else if (wizardCurrentStep === 3) {
        // Collect selected from step 3
        collectStep3Selections();
        if (wizardSelectedCases.length === 0) {
            showToast('Please select at least one test case.', 'error');
            return;
        }
        populateStep4();
    } else if (wizardCurrentStep === 4) {
        // Collect assignments
        collectStep4Assignments();
        populateStep5();
    } else if (wizardCurrentStep === 5) {
        // Finish: create the plan
        createPlanFromWizard();
        return;
    }

    wizardCurrentStep++;
    showWizardStep(wizardCurrentStep);
    updateWizardSteps();

    // Button state
    document.getElementById('wizard-prev').style.display = wizardCurrentStep > 1 ? '' : 'none';
    document.getElementById('wizard-next').textContent = wizardCurrentStep === 5 ? 'Create Plan' : 'Next';
}

function wizardPrev() {
    if (wizardCurrentStep <= 1) return;

    // Save current state before going back
    if (wizardCurrentStep === 3) {
        collectStep3Selections();
    } else if (wizardCurrentStep === 4) {
        collectStep4Assignments();
    }

    wizardCurrentStep--;
    showWizardStep(wizardCurrentStep);
    updateWizardSteps();

    document.getElementById('wizard-prev').style.display = wizardCurrentStep > 1 ? '' : 'none';
    document.getElementById('wizard-next').textContent = 'Next';
}

function showWizardStep(step) {
    for (let i = 1; i <= 5; i++) {
        const el = document.getElementById('wizard-step-' + i);
        if (el) el.style.display = i === step ? '' : 'none';
    }
}

function updateWizardSteps() {
    const steps = document.querySelectorAll('.wizard-step');
    steps.forEach(el => {
        const s = parseInt(el.getAttribute('data-step'));
        el.classList.remove('active', 'completed');
        if (s === wizardCurrentStep) {
            el.classList.add('active');
        } else if (s < wizardCurrentStep) {
            el.classList.add('completed');
        }
    });
}

// Step 2: Auto-populate based on plan type
function populateStep2() {
    const planType = document.getElementById('plan-type').value;
    const tbody = document.getElementById('wizard-tc-tbody');
    tbody.innerHTML = '';

    let filtered = [];
    let infoText = '';

    // Check for pending import to pre-select
    var pendingMap = localStorage.getItem('fullbeat_pending_map');
    if (pendingMap) {
        try {
            var pendingIndices = JSON.parse(pendingMap);
            if (Array.isArray(pendingIndices) && pendingIndices.length > 0) {
                // Pre-select imported TCs
                filtered = allTestCases.filter(function(tc) {
                    return pendingIndices.indexOf(tc.tc_index) !== -1;
                });
                infoText = pendingIndices.length + ' test cases from your recent import are pre-selected. Adjust in the next step.';
                localStorage.removeItem('fullbeat_pending_map'); // consume it

                // Skip the switch below
                document.getElementById('auto-select-info').textContent = infoText;
                // render the filtered rows...
                filtered.forEach(function(tc) {
                    var tr = document.createElement('tr');
                    tr.innerHTML =
                        '<td><input type="checkbox" class="wizard-tc-check" value="' + tc.tc_index + '" checked></td>' +
                        '<td>TC-' + String(tc.tc_index).toString().replace('TC-','').padStart(3, '0') + '</td>' +
                        '<td>' + escapeHtml(tc.module) + '</td>' +
                        '<td>' + escapeHtml(tc.category) + '</td>' +
                        '<td>' + escapeHtml(tc.scenario) + '</td>';
                    tbody.appendChild(tr);
                });
                document.getElementById('select-all-tc').checked = true;
                return; // skip the normal auto-populate
            }
        } catch(e) { /* fall through to normal flow */ }
    }

    switch (planType) {
        case 'smoke':
            filtered = allTestCases.filter(tc => tc.category === 'smoke' && tc.is_active);
            infoText = 'Smoke test: showing test cases with category "smoke". You can adjust in the next step.';
            break;
        case 'sanity':
            filtered = allTestCases.filter(tc => (tc.category === 'smoke' || tc.category === 'sanity') && tc.is_active);
            infoText = 'Sanity test: showing test cases with category "smoke" or "sanity". You can adjust in the next step.';
            break;
        case 'regression':
            filtered = allTestCases.filter(tc => tc.is_active);
            infoText = 'Regression test: all active test cases are included. You can adjust in the next step.';
            break;
        case 'custom':
            filtered = [];
            infoText = 'Custom plan: no cases auto-selected. Add cases in the next step.';
            break;
    }

    document.getElementById('auto-select-info').textContent = infoText;

    if (filtered.length === 0 && planType !== 'custom') {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--gray-400);">No matching test cases found.</td></tr>';
    }

    filtered.forEach(tc => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" class="wizard-tc-check" value="${tc.tc_index}" checked></td>
            <td>TC-${String(tc.tc_index).padStart(3, '0')}</td>
            <td>${escapeHtml(tc.module)}</td>
            <td>${escapeHtml(tc.category)}</td>
            <td>${escapeHtml(tc.scenario)}</td>
        `;
        tbody.appendChild(tr);
    });

    // Sync select-all
    document.getElementById('select-all-tc').checked = filtered.length > 0;
}

function collectStep2Selections() {
    const checked = document.querySelectorAll('#wizard-tc-tbody input.wizard-tc-check:checked');
    wizardSelectedCases = [];
    checked.forEach(cb => {
        const tcIndex = parseInt(cb.value);
        const tc = allTestCases.find(t => t.tc_index === tcIndex);
        if (tc) wizardSelectedCases.push(tc);
    });
}

// Step 3: Customize - show all test cases with current selection
function populateStep3() {
    const tbody = document.getElementById('wizard-customize-tbody');
    tbody.innerHTML = '';

    const selectedIndices = new Set(wizardSelectedCases.map(tc => tc.tc_index));

    allTestCases.filter(tc => tc.is_active).forEach(tc => {
        const isSelected = selectedIndices.has(tc.tc_index);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" class="customize-tc-check" value="${tc.tc_index}" ${isSelected ? 'checked' : ''}></td>
            <td>TC-${String(tc.tc_index).padStart(3, '0')}</td>
            <td>${escapeHtml(tc.module)}</td>
            <td>${escapeHtml(tc.category)}</td>
            <td>${escapeHtml(tc.scenario)}</td>
        `;
        tbody.appendChild(tr);
    });

    // Bind change events for count
    tbody.querySelectorAll('.customize-tc-check').forEach(cb => {
        cb.addEventListener('change', updateSelectedCount);
    });

    updateSelectedCount();
}

function updateSelectedCount() {
    const checked = document.querySelectorAll('#wizard-customize-tbody input.customize-tc-check:checked');
    document.getElementById('selected-count').textContent = checked.length + ' test case' + (checked.length !== 1 ? 's' : '') + ' selected';
}

function collectStep3Selections() {
    const checked = document.querySelectorAll('#wizard-customize-tbody input.customize-tc-check:checked');
    wizardSelectedCases = [];
    checked.forEach(cb => {
        const tcIndex = parseInt(cb.value);
        const tc = allTestCases.find(t => t.tc_index === tcIndex);
        if (tc) wizardSelectedCases.push(tc);
    });
}

// Step 4: Assign testers
function populateStep4() {
    const tbody = document.getElementById('wizard-assign-tbody');
    tbody.innerHTML = '';

    const testerOptions = allTesters.map(t =>
        `<option value="${t.id}">${escapeHtml(t.display_name)} (${t.tester_code})</option>`
    ).join('');

    wizardSelectedCases.forEach(tc => {
        const currentAssign = wizardAssignments[tc.tc_index] || '';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>TC-${String(tc.tc_index).padStart(3, '0')}</td>
            <td>${escapeHtml(tc.module)}</td>
            <td>${escapeHtml(tc.scenario)}</td>
            <td>
                <select class="assign-select" data-tc="${tc.tc_index}" style="padding:6px 8px;border:1px solid var(--gray-300);border-radius:var(--radius);font-size:13px;width:100%;">
                    <option value="">— Select —</option>
                    ${testerOptions}
                </select>
            </td>
        `;
        tbody.appendChild(tr);

        // Restore previous assignment
        if (currentAssign) {
            const sel = tr.querySelector('.assign-select');
            sel.value = currentAssign;
        }
    });
}

function autoAssignRoundRobin() {
    if (allTesters.length === 0) {
        showToast('No testers available for assignment.', 'error');
        return;
    }

    const selects = document.querySelectorAll('#wizard-assign-tbody .assign-select');
    let idx = 0;
    selects.forEach(sel => {
        sel.value = allTesters[idx % allTesters.length].id;
        idx++;
    });

    showToast('Cases assigned via round robin.', 'success');
}

function collectStep4Assignments() {
    wizardAssignments = {};
    const selects = document.querySelectorAll('#wizard-assign-tbody .assign-select');
    selects.forEach(sel => {
        const tcIndex = parseInt(sel.getAttribute('data-tc'));
        if (sel.value) {
            wizardAssignments[tcIndex] = sel.value;
        }
    });
}

// Step 5: Review summary
function populateStep5() {
    const name = document.getElementById('plan-name').value.trim();
    const type = document.getElementById('plan-type').value;
    const env = document.getElementById('plan-env').value;
    const version = document.getElementById('plan-version').value.trim();
    const notes = document.getElementById('plan-notes').value.trim();

    // Count assignments per tester
    const testerCounts = {};
    for (const tcIdx in wizardAssignments) {
        const userId = wizardAssignments[tcIdx];
        testerCounts[userId] = (testerCounts[userId] || 0) + 1;
    }

    const assignedCount = Object.keys(wizardAssignments).length;
    const unassignedCount = wizardSelectedCases.length - assignedCount;

    let testerSummary = '';
    if (Object.keys(testerCounts).length > 0) {
        testerSummary = '<ul style="margin:8px 0 0 20px;font-size:14px;">';
        for (const userId in testerCounts) {
            const tester = allTesters.find(t => t.id === userId);
            const testerName = tester ? tester.display_name + ' (' + tester.tester_code + ')' : userId;
            testerSummary += '<li>' + escapeHtml(testerName) + ': ' + testerCounts[userId] + ' case' + (testerCounts[userId] !== 1 ? 's' : '') + '</li>';
        }
        testerSummary += '</ul>';
    }

    const planIdDisplay = generatePlanId();

    document.getElementById('wizard-review').innerHTML = `
        <div class="plan-detail-info" style="margin-bottom:20px;">
            <div class="info-item"><strong>Plan ID</strong>${escapeHtml(planIdDisplay)}</div>
            <div class="info-item"><strong>Name</strong>${escapeHtml(name)}</div>
            <div class="info-item"><strong>Type</strong>${escapeHtml(type)}</div>
            <div class="info-item"><strong>Environment</strong>${escapeHtml(env)}</div>
            <div class="info-item"><strong>Version</strong>${escapeHtml(version || '—')}</div>
            <div class="info-item"><strong>Status</strong>Draft</div>
        </div>
        ${notes ? '<div style="margin-bottom:16px;"><strong style="display:block;font-size:12px;color:var(--gray-500);text-transform:uppercase;margin-bottom:4px;">Release Notes</strong><p style="font-size:14px;">' + escapeHtml(notes) + '</p></div>' : ''}
        <div style="margin-bottom:16px;">
            <strong style="display:block;font-size:12px;color:var(--gray-500);text-transform:uppercase;margin-bottom:4px;">Test Cases</strong>
            <p style="font-size:14px;">${wizardSelectedCases.length} test case${wizardSelectedCases.length !== 1 ? 's' : ''} selected</p>
        </div>
        <div style="margin-bottom:16px;">
            <strong style="display:block;font-size:12px;color:var(--gray-500);text-transform:uppercase;margin-bottom:4px;">Tester Assignments</strong>
            <p style="font-size:14px;">${assignedCount} assigned, ${unassignedCount} unassigned</p>
            ${testerSummary}
        </div>
    `;
}

function generatePlanId() {
    const year = new Date().getFullYear();
    const seq = String(planSeqCounter).padStart(3, '0');
    return 'TP-' + year + '-' + seq;
}

function createPlanFromWizard() {
    const name = document.getElementById('plan-name').value.trim();
    const type = document.getElementById('plan-type').value;
    const env = document.getElementById('plan-env').value;
    const version = document.getElementById('plan-version').value.trim();
    const notes = document.getElementById('plan-notes').value.trim();

    const planIdDisplay = generatePlanId();
    planSeqCounter++;

    const items = wizardSelectedCases.map(tc => ({
        tc_index: tc.tc_index,
        module: tc.module,
        scenario: tc.scenario,
        assigned_to: wizardAssignments[tc.tc_index] || null,
        status: 'pending'
    }));

    const newPlan = {
        id: generateId(),
        plan_id_display: planIdDisplay,
        project_id: getSelectedProjectId() || 'proj-1',
        name: name,
        type: type,
        environment: env,
        version: version,
        notes: notes,
        status: 'draft',
        items: items,
        created_by: (typeof DEV_USER !== 'undefined') ? DEV_USER.id : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    plansData.unshift(newPlan);
    localStorage.setItem('fullbeat_dev_plans', JSON.stringify(plansData));
    // Clear pending map
    localStorage.removeItem('fullbeat_pending_map');
    renderPlans(plansData);
    closeModal('plan-wizard-modal');
    showToast('Plan created: ' + planIdDisplay + ' — ' + name, 'success');
}

// ============================================================
// MODAL HELPERS
// ============================================================

function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
}

// ============================================================
// INIT ON DOM READY
// ============================================================

// ── Import Map Banner ────────────────────────────────────────────────
function checkPendingImport() {
    var pending = localStorage.getItem('fullbeat_pending_map');
    if (!pending) return;
    try {
        var indices = JSON.parse(pending);
        if (!Array.isArray(indices) || indices.length === 0) return;

        var banner = document.getElementById('import-map-banner');
        var countEl = document.getElementById('import-map-count');
        if (banner && countEl) {
            countEl.textContent = ' — ' + indices.length + ' test cases ready to map';
            banner.style.display = '';
        }
    } catch(e) { /* ignore */ }
}

function dismissImportBanner() {
    localStorage.removeItem('fullbeat_pending_map');
    var banner = document.getElementById('import-map-banner');
    if (banner) banner.style.display = 'none';
}

function mapImportToPlan() {
    dismissImportBanner();
    // Open wizard — the pending map data will be used in populateStep2
    openWizard();
}

document.addEventListener('DOMContentLoaded', initPlans);
