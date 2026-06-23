/**
 * Public GET API Route for Story details
 * GET /api/settings/story
 */

import { getStorySettings } from '@/services/settings.service';
import { apiError, apiSuccess } from '@/utils/helpers';

export async function GET(request) {
  try {
    const data = await getStorySettings();
    return apiSuccess({ success: true, data });
  } catch (error) {
    console.error('[API Story Get]', error.message);
    return apiError('Failed to fetch story settings', 500);
  }
}
