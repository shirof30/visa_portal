async function getAccessToken(): Promise<string> {
  const res = await fetch(
    `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.AZURE_CLIENT_ID!,
        client_secret: process.env.AZURE_CLIENT_SECRET!,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    }
  );
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get access token");
  return data.access_token as string;
}

export async function sendVisaConfirmationEmail({
  toEmail,
  fullName,
  applicationRef,
  reason,
}: {
  toEmail: string;
  fullName: string;
  applicationRef: string;
  reason: string;
}): Promise<void> {
  const token = await getAccessToken();

  const emailBody = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
</head>
<body style="margin:0;padding:0;background:#dde3ec;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#dde3ec;padding:36px 0;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0"
         style="max-width:600px;width:100%;background:white;border-radius:14px;
                overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.12);">

    <!-- Header -->
    <tr><td style="background:#0d2b5e;padding:28px 36px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#6ee7b7;margin-bottom:6px;">
              KJRI Vancouver
            </div>
            <div style="font-size:20px;font-weight:700;color:#ffffff;">
              Visa Application Received
            </div>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- Success badge -->
    <tr><td style="padding:28px 36px 0;">
      <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:10px;padding:16px 20px;display:flex;align-items:center;gap:12px;">
        <span style="font-size:22px;">✅</span>
        <div>
          <div style="font-size:14px;font-weight:700;color:#15803d;">Application Successfully Submitted</div>
          <div style="font-size:12px;color:#166534;margin-top:2px;">Your Indonesian visa application has been received.</div>
        </div>
      </div>
    </td></tr>

    <!-- Reference number -->
    <tr><td style="padding:24px 36px 0;">
      <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;margin-bottom:8px;">Reference Number</div>
      <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;padding:16px 20px;">
        <div style="font-family:monospace;font-size:20px;font-weight:800;color:#0d2b5e;letter-spacing:2px;">${applicationRef}</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:4px;">Keep this reference number to check your application status.</div>
      </div>
    </td></tr>

    <!-- Details -->
    <tr><td style="padding:20px 36px 0;">
      <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;margin-bottom:10px;">Application Details</div>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td style="padding:8px 14px;background:#f8fafc;border-radius:6px 6px 0 0;border-bottom:1px solid #e2e8f0;">
            <span style="font-size:11px;color:#94a3b8;font-weight:600;">APPLICANT NAME</span><br>
            <span style="font-size:14px;font-weight:700;color:#1e293b;">${fullName}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 14px;background:#f8fafc;border-radius:0 0 6px 6px;">
            <span style="font-size:11px;color:#94a3b8;font-weight:600;">VISA TYPE / PURPOSE</span><br>
            <span style="font-size:14px;font-weight:700;color:#1e293b;">${reason}</span>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- Next steps -->
    <tr><td style="padding:20px 36px 0;">
      <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;margin-bottom:10px;">Next Steps</div>
      <div style="background:#f8fafc;border-radius:10px;padding:16px 20px;">
        <ol style="margin:0;padding-left:18px;color:#334155;font-size:13px;line-height:1.9;">
          <li>Your application will be reviewed by consular staff.</li>
          <li>You may be contacted for additional documents or to schedule an interview.</li>
          <li>Visit <strong>1630 Alberni St, Vancouver, BC</strong> during office hours if required.</li>
          <li>Use your reference number to check your application status online.</li>
        </ol>
      </div>
    </td></tr>

    <!-- Office hours -->
    <tr><td style="padding:20px 36px 0;">
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 18px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#1d4ed8;margin-bottom:6px;">Consulate Office Hours</div>
        <div style="font-size:12px;color:#1e40af;">
          Mon–Thu: 09:30–11:30 &amp; 13:00–16:30<br>
          Friday: 09:30–11:30 &amp; 14:30–17:00<br>
          📞 604-682-8855 &nbsp;|&nbsp; ✉️ consular@indonesiavancouver.org
        </div>
      </div>
    </td></tr>

    <!-- No-reply notice -->
    <tr><td style="padding:16px 36px 0;">
      <div style="background:#fef9c3;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;">
        <div style="font-size:12px;color:#713f12;line-height:1.6;">
          <strong>⚠️ This email was sent from an address that does not accept replies.</strong><br>
          Please do not reply to this email. For questions, please contact us directly at the
          phone number or email address above.
        </div>
      </div>
    </td></tr>

    <!-- Footer -->
    <tr><td style="padding:24px 36px 28px;">
      <div style="border-top:1px solid #e2e8f0;padding-top:20px;text-align:center;">
        <div style="font-size:12px;color:#94a3b8;">
          Consulate General of the Republic of Indonesia<br>
          1630 Alberni Street, Vancouver, BC, V6G 1A6, Canada<br>
          <a href="https://indonesiavancouver.org" style="color:#0d2b5e;text-decoration:none;">indonesiavancouver.org</a>
        </div>
      </div>
    </td></tr>

  </table>
  </td></tr>
</table>
</body>
</html>`;

  const fromAddress = process.env.MAIL_FROM ?? "no-reply@indonesiavancouver.org";

  const res = await fetch(`https://graph.microsoft.com/v1.0/users/${fromAddress}/sendMail`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject: `Visa Application Received — Reference: ${applicationRef}`,
        body: { contentType: "HTML", content: emailBody },
        toRecipients: [{ emailAddress: { address: toEmail } }],
        from: { emailAddress: { address: fromAddress, name: "KJRI Vancouver" } },
      },
      saveToSentItems: true,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Graph sendMail failed (${res.status}): ${errBody}`);
  }
}
