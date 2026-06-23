import { getUserByEmail, updateUser } from '@/services/user.service';
import { hashPassword } from '@/lib/auth';
import { apiError, apiSuccess } from '@/utils/helpers';

export async function POST(request) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return apiError('Email, OTP, and new password are required', 400);
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return apiError('User not found', 404);
    }

    if (!user.resetOtp || user.resetOtp !== otp) {
      return apiError('Invalid OTP', 400);
    }

    if (!user.resetOtpExpiry || new Date(user.resetOtpExpiry) < new Date()) {
      return apiError('OTP has expired', 400);
    }

    // Hash the new password
    const hashedPw = await hashPassword(newPassword);

    // Update user password and clear OTP fields
    await updateUser(user.id, { 
      password: hashedPw,
      resetOtp: null,
      resetOtpExpiry: null 
    });

    return apiSuccess({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('[Reset Password Error]', error);
    return apiError('Failed to reset password', 500);
  }
}
