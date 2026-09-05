import http from "http";

function makeRequest(
  method: string,
  path: string,
  body?: any,
  token?: string
): Promise<{ status: number; data: any }> {
  return new Promise((resolve) => {
    const postData = body ? JSON.stringify(body) : "";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData).toString(),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: 5000,
        path,
        method,
        headers,
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          let parsed = {};
          try {
            parsed = JSON.parse(raw);
          } catch (e) {
            parsed = { raw };
          }
          resolve({ status: res.statusCode || 500, data: parsed });
        });
      }
    );

    req.on("error", (err) => {
      resolve({ status: 500, data: { error: err.message } });
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runSecurityAndIntegrationTests() {
  console.log("=== STARTING MEDIVAULT COMPLETE QA & CYBER SECURITY AUDIT SUITE ===");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, extraInfo: string = "") {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${extraInfo}`);
      failed++;
    }
  }

  try {
    // 1. Root & Health Check
    const rootRes = await makeRequest("GET", "/");
    assert(rootRes.status === 200 && rootRes.data.success === true, "1. Server Health & Root endpoint accessible");

    // 2. Test 1-Click / Demo Logins for All 5 Roles
    const accounts = [
      { role: "patient", email: "patient@medivault.com", pass: "password123" },
      { role: "doctor", email: "doctor@medivault.com", pass: "password123" },
      { role: "lab", email: "lab@medivault.com", pass: "password123" },
      { role: "pharmacy", email: "pharmacy@medivault.com", pass: "password123" },
      { role: "admin", email: "admin@medivault.com", pass: "admin123" },
    ];

    const tokens: Record<string, string> = {};

    for (const acc of accounts) {
      const loginRes = await makeRequest("POST", "/api/v1/auth/login", {
        email: acc.email,
        password: acc.pass,
      });
      assert(
        loginRes.status === 200 && !!loginRes.data.accessToken && loginRes.data.data?.user?.role === acc.role,
        `2. Authentication verification for role '${acc.role}' (${acc.email})`
      );
      tokens[acc.role] = loginRes.data.accessToken;
    }

    // 3. Security: RBAC Authorization Verification
    // A) Patient trying to access Admin Stats -> MUST BE 403 Forbidden
    const patAdminRes = await makeRequest("GET", "/api/v1/admin/stats", undefined, tokens.patient);
    assert(patAdminRes.status === 403, "3A. RBAC: Patient prohibited from /admin/stats (Status: 403 Forbidden)");

    // B) Doctor trying to access Admin Users -> MUST BE 403 Forbidden
    const docAdminRes = await makeRequest("GET", "/api/v1/admin/users", undefined, tokens.doctor);
    assert(docAdminRes.status === 403, "3B. RBAC: Doctor prohibited from /admin/users (Status: 403 Forbidden)");

    // C) Admin accessing Admin Stats & Users -> MUST BE 200 OK
    const adminStats = await makeRequest("GET", "/api/v1/admin/stats", undefined, tokens.admin);
    assert(
      adminStats.status === 200 && typeof adminStats.data.data?.totalUsers === "number",
      "3C. RBAC: Admin authorized for /admin/stats"
    );

    const adminUsers = await makeRequest("GET", "/api/v1/admin/users?role=all", undefined, tokens.admin);
    assert(
      adminUsers.status === 200 && Array.isArray(adminUsers.data.data?.users),
      "3D. RBAC: Admin authorized for /admin/users directory listing"
    );

    // 4. Security & Feature: Forgot Password Flow (Email & Phone OTP)
    // A) Send OTP to email
    const forgotRes = await makeRequest("POST", "/api/v1/auth/forgot-password/send-otp", {
      email: "patient@medivault.com",
    });
    assert(
      forgotRes.status === 200 && forgotRes.data.success === true,
      "4A. Forgot Password: OTP dispatched to valid registered email"
    );

    // B) Empty identifier validation -> MUST BE 400
    const emptyForgotRes = await makeRequest("POST", "/api/v1/auth/forgot-password/send-otp", { email: "", phone: "" });
    assert(emptyForgotRes.status === 400, "4B. Forgot Password: Empty identifier rejected with 400");

    // C) Non-existent identifier -> MUST BE 404
    const nonExistRes = await makeRequest("POST", "/api/v1/auth/forgot-password/send-otp", { email: "fake_non_user_999@test.com" });
    assert(nonExistRes.status === 404, "4C. Forgot Password: Non-existent account returns 404");

    // D) Reset password with dev OTP
    const devOtp = forgotRes.data.devOtp;
    if (devOtp) {
      const resetRes = await makeRequest("POST", "/api/v1/auth/forgot-password/reset", {
        email: "patient@medivault.com",
        otp: devOtp,
        newPassword: "password123",
      });
      assert(
        resetRes.status === 200 && resetRes.data.success === true,
        "4D. Forgot Password: Reset password with OTP completed successfully"
      );
    }

    // 5. Security & Feature: Malpractice Enforcement & Account Suspension
    const usersList = await makeRequest("GET", "/api/v1/admin/users?role=doctor", undefined, tokens.admin);
    const doctorUser = usersList.data.data?.users?.find((u: any) => u.email === "doctor@medivault.com");
    if (doctorUser) {
      // Block doctor
      const blockRes = await makeRequest(
        "PATCH",
        `/api/v1/admin/users/${doctorUser._id}/block`,
        {
          isBlocked: true,
          reason: "Audit Test: Reported Malpractice Violation",
        },
        tokens.admin
      );
      assert(
        blockRes.status === 200 && blockRes.data.data?.user?.isBlocked === true,
        "5A. Malpractice Enforcement: Admin blocked doctor account successfully"
      );

      // Verify doctor cannot login while suspended -> MUST BE 403
      const blockedLoginRes = await makeRequest("POST", "/api/v1/auth/login", {
        email: "doctor@medivault.com",
        password: "password123",
      });
      assert(
        blockedLoginRes.status === 403,
        "5B. Security Guard: Blocked doctor rejected on login (Status: 403 Forbidden with Malpractice Notice)"
      );

      // Unblock doctor back
      const unblockRes = await makeRequest(
        "PATCH",
        `/api/v1/admin/users/${doctorUser._id}/block`,
        { isBlocked: false },
        tokens.admin
      );
      assert(
        unblockRes.status === 200 && unblockRes.data.data?.user?.isBlocked === false,
        "5C. Malpractice Enforcement: Admin restored doctor access successfully"
      );
    }

    // 6. Security & Feature: Authenticated Password Change
    const changeOtpRes = await makeRequest(
      "POST",
      "/api/v1/auth/change-password/send-otp",
      { channel: "email" },
      tokens.patient
    );
    assert(
      changeOtpRes.status === 200 && changeOtpRes.data.success === true,
      "6A. Authenticated Change Password: OTP sent to user registered channel"
    );

    if (changeOtpRes.data.devOtp) {
      const changeRes = await makeRequest(
        "POST",
        "/api/v1/auth/change-password",
        {
          newPassword: "password123",
          otp: changeOtpRes.data.devOtp,
        },
        tokens.patient
      );
      assert(
        changeRes.status === 200 && changeRes.data.success === true,
        "6B. Authenticated Change Password: Password updated with valid OTP"
      );
    }

    console.log(`\n===============================================================`);
    console.log(`=== AUDIT TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
    console.log(`===============================================================\n`);
  } catch (globalErr: any) {
    console.error("Global Test Suite Failure:", globalErr.message);
  }
}

runSecurityAndIntegrationTests();
