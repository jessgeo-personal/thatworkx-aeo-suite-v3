import { Resend } from 'resend';

function getOtpEmailHtml(email, otp) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AEO Suite Verification Code</title>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Merriweather', Georgia, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header with Black Background -->
          <tr>
            <td style="background-color: #000000; padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 1px;">
                thatworkx.
              </h1>
              <p style="color: #ffffff; margin: 8px 0 0 0; font-size: 14px; letter-spacing: 3px; font-weight: 300;">
                AEO SUITE
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 40px 20px 40px;">
              <h2 style="color: #333333; font-size: 24px; margin: 0 0 20px 0; font-weight: 400;">
                Hello,
              </h2>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for your interest in the AEO Suite. To complete your verification and access your analysis results, please use the verification code below.
              </p>
              
              <!-- OTP Box - VERY PROMINENT -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center" style="background-color: #f8f8f8; border: 2px solid #00d4ff; border-radius: 8px; padding: 30px;">
                    <p style="color: #333333; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 400;">
                      Your Verification Code
                    </p>
                    <p style="margin: 0; line-height: 1.2;">
                      <span style="color: #000000; font-size: 42px; font-weight: 700; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace; user-select: all; -webkit-user-select: all; -moz-user-select: all; -ms-user-select: all;">${otp}</span>
                    </p>
                    <p style="color: #999999; font-size: 13px; margin: 15px 0 0 0;">
                      Valid for 10 minutes (Double-click code to copy)
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                Simply copy this code and paste it into the verification field on the AEO Suite to view your analysis results.
              </p>
              
              <!-- Security Note -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; background-color: #fff8e1; border-left: 4px solid #ffc107; border-radius: 4px;">
                <tr>
                  <td style="padding: 15px 20px;">
                    <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.5;">
                      <strong>Security Note:</strong> This code was requested for ${email}. If you didn't request this code, please ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 30px 0 10px 0;">
                Need help? Feel free to reach out to us.
              </p>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                All the best,<br>
                <span style="color: #999999; font-style: italic;">The AEO Suite Team</span>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 30px 40px; border-top: 1px solid #eeeeee;">
              <p style="color: #999999; font-size: 13px; line-height: 1.6; margin: 0 0 10px 0; text-align: center;">
                Thatworkx Solutions LLC-FZ, Meydan Free Zone, Dubai, Dubai, United Arab Emirates, +971529342175
              </p>
              <p style="color: #999999; font-size: 13px; margin: 0; text-align: center;">
                <a href="https://aeo.thatworkx.com" style="color: #00d4ff; text-decoration: none;">Visit AEO Suite</a> · 
                <a href="https://thatworkx.com" style="color: #00d4ff; text-decoration: none;">Thatworkx</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function sendOtpEmail(to, otpCode) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL || 'onboarding@resend.dev';
  const fromName = process.env.EMAIL_FROM_NAME || 'AEO Tools by Thatworkx';
  const enableEmail = process.env.ENABLE_EMAIL_VERIFICATION !== 'false';

  if (!enableEmail) {
    console.log(`[EMAIL BYPASS] Email verification disabled. OTP: ${otpCode} would have been sent to ${to}`);
    return { success: true, bypassed: true };
  }

  if (!apiKey || apiKey.includes('[resend-api-key-here]') || apiKey === 'your_resend_api_key_here') {
    console.warn(`[RESEND WARNING] Missing or placeholder RESEND_API_KEY. OTP: ${otpCode} logged to console only.`);
    console.log(`\n[OTP MAIL SIMULATOR] Sent OTP code: ${otpCode} to email address: ${to}\n`);
    return { success: true, simulated: true };
  }

  const resend = new Resend(apiKey);
  const html = getOtpEmailHtml(to, otpCode);

  try {
    const result = await resend.emails.send({
      from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
      to,
      subject: `Your AEO Suite Verification Code: ${otpCode}`,
      html
    });

    console.log(`[RESEND API SUCCESS] Dispatched verification email to ${to}. Message ID: ${result?.data?.id || result?.id}`);
    return result;
  } catch (err) {
    console.error('[RESEND API ERROR] Failed to send email via Resend:', err.message);
    throw err;
  }
}

export default { sendOtpEmail };