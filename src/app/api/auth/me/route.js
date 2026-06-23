/**
 * Auth Me API Route
 * GET /api/auth/me - Get current user from JWT
 */

import { authenticateRequest } from '@/lib/auth';
import { getUserById } from '@/services/user.service';
import { apiError, apiSuccess } from '@/utils/helpers';

export async function GET(request) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return apiError('Unauthorized', 401);
    }

    const user = await getUserById(payload.userId);
    if (!user) {
      return apiError('User not found', 404);
    }

    return apiSuccess({ user });
  } catch (error) {
    console.error('[Auth Me]', error.message);
    return apiError('Unauthorized', 401);
  }
}
