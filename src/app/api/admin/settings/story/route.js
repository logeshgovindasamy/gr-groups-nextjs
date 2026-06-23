/**
 * Admin PUT API Route for Story details
 * PUT /api/admin/settings/story
 */

import { authenticateRequest } from '@/lib/auth';
import { saveStorySettings } from '@/services/settings.service';
import { apiError, apiSuccess } from '@/utils/helpers';

export async function PUT(request) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload || payload.role !== 'admin') {
      return apiError('Forbidden: Admin access required', 403);
    }

    const body = await request.json();
    const data = await saveStorySettings(body);
    
    return apiSuccess({ success: true, data });
  } catch (error) {
    console.error('[API Story Save]', error.message);
    return apiError('Failed to save story settings', 500);
  }
}
