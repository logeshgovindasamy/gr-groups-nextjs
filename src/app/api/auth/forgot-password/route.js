import { getUserByEmail, updateUser } from '@/services/user.service';
import { apiError, apiSuccess } from '@/utils/helpers';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return apiError('Email is required', 400);
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return apiError('No account found with this email', 404);
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry

    await updateUser(user.id, { resetOtp: otp, resetOtpExpiry: otpExpiry });

    // Send email using nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // Use TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@grgroups.com',
      to: email,
      subject: 'Password Reset OTP - GR Groups',
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset</h2>
          <p>You requested a password reset for your GR Groups account.</p>
          <p>Your One-Time Password (OTP) is:</p>
          <h1 style="font-size: 36px; letter-spacing: 5px; color: #4F46E5; background: #F3F4F6; padding: 10px; text-align: center; border-radius: 8px;">${otp}</h1>
          <p>This OTP will expire in 15 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return apiSuccess({ message: 'OTP sent successfully to your email' });
  } catch (error) {
    console.error('[Forgot Password Error]', error);
    return apiError('Failed to send OTP', 500);
  }
}
