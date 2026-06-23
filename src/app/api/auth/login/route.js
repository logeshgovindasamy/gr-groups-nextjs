/**
 * Auth Login API Route
 * Migrated from: Java AuthController.java
 * POST /api/auth/login
 */

import { authenticateUser } from '@/services/user.service';
import { apiError, apiSuccess } from '@/utils/helpers';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return apiError('Email and password are required', 400);
    }

    const { user, token } = await authenticateUser(email, password);

    return apiSuccess({
      user,
      token,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('[Auth Login]', error.message);
    return apiError(error.message || 'Authentication failed', 401);
  }
}
