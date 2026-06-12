function formatSlotDate(slot: string): string {
  const [datePart] = slot.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const monthNames = ["Januari","Februari","Maret","April","Mei","Juni",
                      "Juli","Agustus","September","Oktober","November","Desember"];
  const dayNames = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  const dow = new Date(year, month - 1, day).getDay();
  return `${dayNames[dow]}, ${day} ${monthNames[month - 1]} ${year}`;
}

function formatSlotTime(slot: string): string {
  return slot.split("T")[1].slice(0, 5);
}

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

  const emailBody = `
<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#dde3ec;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#dde3ec;padding:36px 0;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0"
         style="max-width:600px;width:100%;background:white;border-radius:14px;
                overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.12);">

    <!-- Top red accent bar -->
    <tr><td style="background:linear-gradient(90deg,#c0392b,#e74c3c);height:5px;font-size:0;">&nbsp;</td></tr>

    <!-- Header -->
    <tr>
      <td style="background:linear-gradient(145deg,#08193a 0%,#0d2b5e 55%,#163872 100%);padding:30px 32px 26px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:top;">
            <p style="margin:0 0 2px 0;color:#ffffff;font-size:9px;font-weight:700;
                       letter-spacing:0.22em;text-transform:uppercase;font-family:Arial,sans-serif;">
              Konsulat Jenderal Republik Indonesia
            </p>
            <p style="margin:0 0 16px 0;color:rgba(255,255,255,0.85);font-size:9px;
                       font-family:Arial,sans-serif;">Vancouver, Canada</p>
            <h1 style="margin:0;color:white;font-size:24px;font-weight:700;
                        font-family:Georgia,serif;line-height:1.2;letter-spacing:-0.3px;">
              Janji Temu Dikonfirmasi
            </h1>
          </td>
          <td width="44" style="vertical-align:top;padding-left:16px;">
            <table cellpadding="0" cellspacing="0" style="border-radius:4px;overflow:hidden;border:1px solid rgba(255,255,255,0.15);">
              <tr><td style="background:#cc0001;width:32px;height:16px;font-size:0;">&nbsp;</td></tr>
              <tr><td style="background:white;width:32px;height:16px;font-size:0;">&nbsp;</td></tr>
            </table>
          </td>
        </tr></table>
      </td>
    </tr>

    <!-- Status badge -->
    <tr>
      <td style="background:#f0fdf4;border-top:3px solid #bbf7d0;border-bottom:1px solid #bbf7d0;padding:14px 32px;">
        <span style="display:inline-block;background:#16a34a;color:white;border-radius:6px;
                     padding:5px 16px;font-size:12px;font-weight:700;font-family:Arial,sans-serif;
                     letter-spacing:0.05em;">
          ✓ &nbsp;Permohonan Berhasil Diterima
        </span>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:28px 32px 24px;background:#f8fafc;font-family:Arial,sans-serif;">

        <p style="margin:0 0 6px 0;font-size:16px;color:#111;">Yth. <strong>${fullName}</strong>,</p>
        <p style="margin:0 0 24px 0;font-size:14px;color:#555;line-height:1.6;">
          Mohon hadir sesuai jadwal yang telah ditentukan serta membawa seluruh dokumen persyaratan yang diperlukan.
        </p>

        <!-- Appointment block -->
        <div style="border:2px solid #0d2b5e;border-radius:12px;overflow:hidden;margin-bottom:20px;">
          <div style="background:#0d2b5e;padding:10px 20px;">
            <p style="margin:0;color:rgba(255,255,255,0.7);font-size:10px;font-weight:700;
                      letter-spacing:0.15em;text-transform:uppercase;font-family:Arial,sans-serif;">
              Jadwal Kedatangan
            </p>
          </div>
          <div style="background:white;padding:20px;text-align:center;">
            <div style="font-size:52px;font-weight:900;color:#0d2b5e;font-family:Georgia,serif;
                        line-height:1;letter-spacing:-1px;">
              ${formatSlotTime(appointmentSlot)}
            </div>
            <div style="color:#475569;font-size:15px;font-weight:600;margin:6px 0 16px 0;
                        font-family:Arial,sans-serif;">
              ${formatSlotDate(appointmentSlot)}
            </div>
            <div style="border-top:1px solid #f1f5f9;padding-top:14px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;">
                <tr>
                  <td style="width:50%;padding-right:10px;text-align:left;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:9px;font-weight:700;color:#94a3b8;
                               letter-spacing:0.12em;text-transform:uppercase;">Layanan</p>
                    <p style="margin:0;font-size:13px;font-weight:600;color:#0f172a;">${reason}</p>
                  </td>
                  <td style="width:50%;padding-left:10px;text-align:left;vertical-align:top;
                              border-left:1px solid #f1f5f9;">
                    <p style="margin:0 0 4px;font-size:9px;font-weight:700;color:#94a3b8;
                               letter-spacing:0.12em;text-transform:uppercase;">Nama Pemohon</p>
                    <p style="margin:0;font-size:13px;font-weight:600;color:#0f172a;">${fullName}</p>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>

        <!-- Warning block -->
        <div style="border-left:4px solid #f59e0b;background:#fffbeb;border-radius:0 8px 8px 0;
                    padding:14px 16px;margin-bottom:20px;">
          <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#b45309;
                    letter-spacing:0.08em;text-transform:uppercase;font-family:Arial,sans-serif;">
            Penting
          </p>
          <p style="margin:0;font-size:13px;color:#78350f;line-height:1.6;font-family:Arial,sans-serif;">
            Simpan nomor referensi ini. Anda memerlukan nomor ini untuk memeriksa status permohonan Anda.
          </p>
        </div>

        <!-- Next steps -->
        <div style="background:white;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:20px;">
          <table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;">
            <tr><td style="padding:10px 16px;font-size:13px;color:#374151;line-height:1.6;border-bottom:1px solid #f1f5f9;">🕐 &nbsp;Harap tiba <strong>10–15 menit</strong> sebelum jadwal Anda</td></tr>
            <tr><td style="padding:10px 16px;font-size:13px;color:#374151;line-height:1.6;border-bottom:1px solid #f1f5f9;">📄 &nbsp;Bawa Paspor asli (jika ada) &amp; izin tinggal asli (PR Card, Study Permit, Work Permit, Visitor Records)</td></tr>
            <tr><td style="padding:10px 16px;font-size:13px;color:#374151;line-height:1.6;border-bottom:1px solid #f1f5f9;">📍 &nbsp;1630 Alberni St, Vancouver, BC V6G 1A6</td></tr>
            <tr><td style="padding:10px 16px;font-size:13px;color:#374151;line-height:1.6;">👔 &nbsp;Kenakan pakaian sopan dan rapih, berkerah — warna apapun <strong>selain putih</strong></td></tr>
          </table>
        </div>

        <!-- Reference number -->
        <div style="height:1px;background:linear-gradient(to right,#e2e8f0,#cbd5e1,#e2e8f0);margin:4px 0 20px;"></div>
        <table width="100%" cellpadding="0" cellspacing="0"
               style="background:white;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="background:#0d2b5e;padding:9px 16px;">
              <p style="margin:0;color:rgba(255,255,255,0.55);font-size:9px;font-weight:700;
                         letter-spacing:0.18em;text-transform:uppercase;font-family:Arial,sans-serif;">
                Nomor Referensi
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 16px;">
              <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:19px;
                         font-weight:700;color:#0d2b5e;letter-spacing:1.5px;">
                ${applicationRef}
              </p>
            </td>
          </tr>
        </table>

        <!-- CTA -->
        <div style="text-align:center;margin-top:20px;">
          <a href="https://paspor.indonesiavancouver.org/check"
             style="display:inline-block;background:#0d2b5e;color:white;text-decoration:none;
                    font-size:13px;font-weight:600;padding:11px 28px;border-radius:6px;
                    font-family:Arial,sans-serif;">
            🔍 Cek Status Permohonan
          </a>
        </div>

      </td>
    </tr>

    <!-- No-reply + contact -->
    <tr>
      <td style="background:#f1f5f9;border-top:2px solid #e2e8f0;padding:22px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0"
               style="background:#fef9c3;border:1px solid #fde68a;border-radius:8px;margin-bottom:16px;">
          <tr>
            <td style="padding:12px 16px;font-size:12px;color:#713f12;line-height:1.6;font-family:Arial,sans-serif;">
              <strong>⚠️ E-mail ini dikirim dari alamat yang tidak menerima balasan.</strong><br>
              Mohon jangan membalas e-mail ini. Untuk pertanyaan, silakan hubungi kami langsung.
            </td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0"
               style="background:white;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="padding:13px 16px;border-bottom:1px solid #f1f5f9;">
              <table cellpadding="0" cellspacing="0"><tr>
                <td width="36" style="font-size:18px;vertical-align:middle;padding-right:4px;">📞</td>
                <td style="vertical-align:middle;">
                  <p style="margin:0;font-size:9px;color:#94a3b8;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;font-family:Arial,sans-serif;">Layanan Konsuler &amp; Imigrasi</p>
                  <p style="margin:3px 0 0 0;font-size:14px;color:#1e293b;font-weight:600;font-family:Arial,sans-serif;">604-682-8855 <span style="color:#94a3b8;font-weight:400;font-size:12px;">ext 228 &amp; 250</span></p>
                </td>
              </tr></table>
            </td>
          </tr>
          <tr>
            <td style="padding:13px 16px;border-bottom:1px solid #f1f5f9;">
              <table cellpadding="0" cellspacing="0"><tr>
                <td width="36" style="font-size:18px;vertical-align:middle;padding-right:4px;">✉️</td>
                <td style="vertical-align:middle;">
                  <p style="margin:0;font-size:9px;color:#94a3b8;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;font-family:Arial,sans-serif;">Email Konsuler &amp; Imigrasi</p>
                  <p style="margin:3px 0 0 0;font-size:13px;font-family:Arial,sans-serif;">
                    <a href="mailto:consular@indonesiavancouver.org" style="color:#0d2b5e;text-decoration:none;font-weight:600;">consular@indonesiavancouver.org</a><br>
                    <a href="mailto:paspor@indonesiavancouver.org" style="color:#0d2b5e;text-decoration:none;font-weight:600;">paspor@indonesiavancouver.org</a>
                  </p>
                </td>
              </tr></table>
            </td>
          </tr>
          <tr>
            <td style="padding:13px 16px;">
              <table cellpadding="0" cellspacing="0"><tr>
                <td width="36" style="font-size:18px;vertical-align:middle;padding-right:4px;">🆘</td>
                <td style="vertical-align:middle;">
                  <p style="margin:0;font-size:9px;color:#94a3b8;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;font-family:Arial,sans-serif;">Hotline (WNI)</p>
                  <p style="margin:3px 0 0 0;font-size:14px;font-weight:700;color:#c0392b;font-family:Arial,sans-serif;">778-778-1992</p>
                </td>
              </tr></table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:linear-gradient(145deg,#08193a 0%,#0d2b5e 100%);padding:20px 32px;">
        <p style="margin:0;color:#ffffff;font-size:12px;font-family:Arial,sans-serif;">
          Konsulat Jenderal Republik Indonesia – Vancouver
        </p>
        <p style="margin:3px 0 0 0;color:rgba(255,255,255,0.75);font-size:10px;font-family:Arial,sans-serif;">
          1630 Alberni St, Vancouver, BC V6G 1A6 &nbsp;·&nbsp; indonesiavancouver.org
        </p>
      </td>
    </tr>

    <!-- Bottom red accent bar -->
    <tr><td style="background:linear-gradient(90deg,#c0392b,#e74c3c);height:5px;font-size:0;">&nbsp;</td></tr>

  </table>
  </td></tr>
</table>

</body>
</html>`;

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${process.env.MAIL_FROM}/sendMail`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject: `Konfirmasi Janji Temu KJRI Vancouver – ${applicationRef}`,
          body: { contentType: "HTML", content: emailBody },
          toRecipients: [{ emailAddress: { address: toEmail } }],
          from: { emailAddress: { address: process.env.MAIL_FROM, name: "KJRI Vancouver" } },
        },
        saveToSentItems: true,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Graph API error: ${err}`);
  }
}