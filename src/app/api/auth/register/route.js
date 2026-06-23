/**
 * Auth Register API Route
 * Migrated from: Java AuthController.java (registerUser)
 * POST /api/auth/register
 */

import { createUser } from '@/services/user.service';
import { generateToken } from '@/lib/auth';
import { sendRegistrationSuccessEmail } from '@/services/email.service';
import { apiError, apiSuccess } from '@/utils/helpers';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!name || !email || !password) {
      return apiError('Name, email, and password are required', 400);
    }

    if (password.length < 6) {
      return apiError('Password must be at least 6 characters', 400);
    }

    // Create user
    const user = await createUser({ name, email, password });

    // Generate token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Send confirmation email (non-blocking)
    sendRegistrationSuccessEmail(email).catch((err) =>
      console.error('Email send failed:', err)
    );

    return apiSuccess(
      {
        user,
        token,
        message: 'Registration successful',
      },
      201
    );
  } catch (error) {
    console.error('[Auth Register]', error.message);

    if (error.message.includes('already exists')) {
      return apiError(error.message, 409);
    }

    return apiError('Registration failed', 500);
  }
}
