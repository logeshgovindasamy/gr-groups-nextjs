/**
 * Admin User Update PATCH API Route
 * PATCH /api/admin/users/[id]
 */

import { authenticateRequest } from '@/lib/auth';
import { updateUser, getUserById } from '@/services/user.service';
import { apiError, apiSuccess } from '@/utils/helpers';

export async function PATCH(request, { params }) {
  try {
    // 1. Authenticate Request & Role Check
    const payload = await authenticateRequest(request);
    if (!payload || payload.role !== 'admin') {
      return apiError('Forbidden: Admin access required', 403);
    }

    const { id } = await params;
    const body = await request.json();
    const { blocked } = body;

    // 2. Fetch User & Validation
    const user = await getUserById(id);
    if (!user) {
      return apiError('User not found', 404);
    }

    // Safeguard: Do not allow blocking an Administrator
    if (user.role === 'admin' || user.email === 'grgroups2026@gmail.com') {
      return apiError('Cannot block an administrator account', 400);
    }

    // 3. Update User block state
    const updatedUser = await updateUser(id, { blocked: !!blocked });

    return apiSuccess({
      success: true,
      data: updatedUser,
      message: blocked ? 'Customer blocked successfully' : 'Customer unblocked successfully',
    });
  } catch (error) {
    console.error('[Admin User PATCH]', error.message);
    return apiError('Failed to update customer status', 500);
  }
}
