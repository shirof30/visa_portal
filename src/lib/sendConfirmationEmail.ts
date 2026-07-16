function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };

    return entities[character];
  });
}

function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function parseAppointmentSlot(slot: string): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  const match = slot.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:?\d{2})?$/
  );

  if (!match) {
    throw new Error(`Invalid appointment slot: ${slot}`);
  }

  const [, year, month, day, hour, minute] = match;
  const parsed = {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
  };

  const date = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day, 12));
  const isValidDate =
    date.getUTCFullYear() === parsed.year &&
    date.getUTCMonth() === parsed.month - 1 &&
    date.getUTCDate() === parsed.day;

  if (
    !isValidDate ||
    parsed.hour < 0 ||
    parsed.hour > 23 ||
    parsed.minute < 0 ||
    parsed.minute > 59
  ) {
    throw new Error(`Invalid appointment slot: ${slot}`);
  }

  return parsed;
}

function formatAppointmentDate(slot: string): string {
  const { year, month, day } = parseAppointmentSlot(slot);
  const date = new Date(Date.UTC(year, month - 1, day, 12));

  return new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatAppointmentTime(slot: string): string {
  const { hour, minute } = parseAppointmentSlot(slot);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

type MicrosoftTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

async function getAccessToken(): Promise<string> {
  const tenantId = requireEnvironmentVariable("AZURE_TENANT_ID");
  const clientId = requireEnvironmentVariable("AZURE_CLIENT_ID");
  const clientSecret = requireEnvironmentVariable("AZURE_CLIENT_SECRET");

  const response = await fetch(
    `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    }
  );

  const data = (await response.json().catch(() => ({}))) as MicrosoftTokenResponse;

  if (!response.ok || !data.access_token) {
    const details = data.error_description || data.error || `HTTP ${response.status}`;
    throw new Error(`Failed to obtain Microsoft Graph access token: ${details}`);
  }

  return data.access_token;
}

export async function sendConfirmationEmail({
  toEmail,
  fullName,
  applicationRef,
  reason,
  appointmentSlot,
}: {
  toEmail: string;
  fullName: string;
  applicationRef: string;
  reason: string;
  appointmentSlot: string;
}): Promise<void> {
  const token = await getAccessToken();
  const fromAddress = process.env.MAIL_FROM?.trim() || "no-reply@indonesiavancouver.org";

  const safeFullName = escapeHtml(fullName.trim());
  const safeApplicationRef = escapeHtml(applicationRef.trim());
  const safeReason = escapeHtml(reason.trim());
  const appointmentDate = escapeHtml(formatAppointmentDate(appointmentSlot));
  const appointmentTime = escapeHtml(formatAppointmentTime(appointmentSlot));

  const emailBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Visa Appointment Rescheduled</title>
</head>
<body style="margin:0;padding:0;background:#dde3ec;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#dde3ec;padding:36px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
             style="width:100%;max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.12);">

        <tr>
          <td style="background:#0d2b5e;padding:28px 36px;">
            <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#6ee7b7;margin-bottom:6px;">
              KJRI Vancouver
            </div>
            <div style="font-size:22px;font-weight:700;line-height:1.3;color:#ffffff;">
              Visa Appointment Rescheduled
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 36px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="width:100%;background:#f0fdf4;border:1.5px solid #86efac;border-radius:10px;">
              <tr>
                <td width="44" valign="top" style="padding:16px 0 16px 18px;font-size:22px;">&#10003;</td>
                <td style="padding:16px 18px 16px 8px;">
                  <div style="font-size:14px;font-weight:700;color:#15803d;">Your new appointment is confirmed</div>
                  <div style="font-size:12px;line-height:1.5;color:#166534;margin-top:3px;">
                    Your previous appointment has been replaced by the date and time shown below.
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 36px 0;">
            <p style="margin:0 0 8px;font-size:15px;color:#1e293b;">Dear <strong>${safeFullName}</strong>,</p>
            <p style="margin:0;font-size:13px;line-height:1.7;color:#475569;">
              Your appointment for your Indonesia visa application has been successfully rescheduled.
              Please attend only the updated appointment below.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:22px 36px 0;">
            <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;margin-bottom:8px;">
              Updated Appointment
            </div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="width:100%;border:2px solid #0d2b5e;border-radius:10px;overflow:hidden;">
              <tr>
                <td align="center" style="background:#0d2b5e;padding:20px 18px;">
                  <div style="font-size:34px;font-weight:800;line-height:1;color:#ffffff;letter-spacing:1px;">${appointmentTime}</div>
                  <div style="font-size:12px;color:#bfdbfe;margin-top:7px;">Vancouver time</div>
                </td>
              </tr>
              <tr>
                <td align="center" style="background:#f8fafc;padding:17px 18px;font-size:16px;font-weight:700;color:#0d2b5e;">
                  ${appointmentDate}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 36px 0;">
            <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;margin-bottom:10px;">
              Application Details
            </div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="width:100%;border-collapse:separate;border-spacing:0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
              <tr>
                <td style="padding:11px 14px;border-bottom:1px solid #e2e8f0;">
                  <div style="font-size:10px;font-weight:700;letter-spacing:1px;color:#94a3b8;text-transform:uppercase;">Applicant Name</div>
                  <div style="font-size:14px;font-weight:700;color:#1e293b;margin-top:3px;">${safeFullName}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:11px 14px;border-bottom:1px solid #e2e8f0;">
                  <div style="font-size:10px;font-weight:700;letter-spacing:1px;color:#94a3b8;text-transform:uppercase;">Visa Type / Purpose</div>
                  <div style="font-size:14px;font-weight:700;color:#1e293b;margin-top:3px;">${safeReason}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:11px 14px;">
                  <div style="font-size:10px;font-weight:700;letter-spacing:1px;color:#94a3b8;text-transform:uppercase;">Reference Number</div>
                  <div style="font-family:'Courier New',Courier,monospace;font-size:16px;font-weight:800;color:#0d2b5e;letter-spacing:1px;margin-top:3px;">${safeApplicationRef}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 36px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="width:100%;background:#fff7ed;border:1px solid #fdba74;border-radius:10px;">
              <tr>
                <td style="padding:14px 18px;">
                  <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#c2410c;margin-bottom:5px;">Important</div>
                  <div style="font-size:13px;line-height:1.6;color:#9a3412;">
                    Your previous appointment is no longer valid. Please use only the updated appointment date and time in this email.
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 36px 0;">
            <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;margin-bottom:10px;">
              Before Your Visit
            </div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="width:100%;background:#f8fafc;border-radius:10px;">
              <tr><td style="padding:11px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;line-height:1.6;color:#334155;">1. Arrive 10&ndash;15 minutes before your appointment.</td></tr>
              <tr><td style="padding:11px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;line-height:1.6;color:#334155;">2. Bring your original passport and any original supporting documents requested for your application.</td></tr>
              <tr><td style="padding:11px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;line-height:1.6;color:#334155;">3. Keep this email and your reference number available when you arrive.</td></tr>
              <tr><td style="padding:11px 16px;font-size:13px;line-height:1.6;color:#334155;">4. Visit KJRI Vancouver at <strong>1630 Alberni St, Vancouver, BC V6G 1A6</strong>.</td></tr>
            </table>
          </td>
        </tr>

        <tr>
          <td align="center" style="padding:22px 36px 0;">
            <a href="https://visa.indonesiavancouver.org/check"
               style="display:inline-block;background:#0d2b5e;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:12px 26px;border-radius:7px;">
              Check Application Status
            </a>
          </td>
        </tr>

        <tr>
          <td style="padding:22px 36px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="width:100%;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;">
              <tr>
                <td style="padding:14px 18px;">
                  <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#1d4ed8;margin-bottom:6px;">Contact</div>
                  <div style="font-size:12px;line-height:1.7;color:#1e40af;">
                    Phone: 604-682-8855<br>
                    Email: <a href="mailto:consular@indonesiavancouver.org" style="color:#1e40af;text-decoration:none;">consular@indonesiavancouver.org</a>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 36px 28px;">
            <div style="border-top:1px solid #e2e8f0;padding-top:20px;text-align:center;">
              <div style="font-size:11px;line-height:1.7;color:#94a3b8;">
                This is an automated message. Please do not reply to this email.<br>
                Consulate General of the Republic of Indonesia<br>
                1630 Alberni Street, Vancouver, BC V6G 1A6, Canada<br>
                <a href="https://indonesiavancouver.org" style="color:#0d2b5e;text-decoration:none;">indonesiavancouver.org</a>
              </div>
            </div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(fromAddress)}/sendMail`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject: `Visa Appointment Rescheduled — Reference: ${singleLine(applicationRef)}`,
          body: { contentType: "HTML", content: emailBody },
          toRecipients: [{ emailAddress: { address: toEmail.trim() } }],
          from: {
            emailAddress: {
              address: fromAddress,
              name: "KJRI Vancouver",
            },
          },
        },
        saveToSentItems: true,
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `Microsoft Graph sendMail failed (${response.status}): ${errorBody || response.statusText}`
    );
  }
}
