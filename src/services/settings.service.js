/**
 * Settings Service - Local File JSON Operations
 * Manages general system config like 'Our Story' content via local file store
 */

import fs from 'fs';
import path from 'path';

const FALLBACK_FILE = path.join(process.cwd(), '.settings-fallback.json');

// Default initial seed data for Our Story
const DEFAULT_STORY = {
  heroTitle: 'Redefining Luxury for the Modern Era',
  heroSubtitle: 'Our Story',
  heroDescription: "GR Groups isn't just an e-commerce platform—it's a movement. We believe luxury should be accessible, authentic, and ahead of its time. Every product in our catalog is handpicked to meet the highest standards of quality and design.",
  missionTitle: 'Our Mission',
  missionDescription: 'To bridge the gap between high fashion and everyday style. We partner directly with designers and artisans worldwide to bring you pieces that tell a story—each item crafted with precision, purpose, and passion.',
  stats: [
    { icon: 'Users', value: '50K+', label: 'Happy Customers' },
    { icon: 'Globe', value: '45+', label: 'Countries Shipped' },
    { icon: 'Award', value: '200+', label: 'Premium Brands' },
    { icon: 'Heart', value: '99%', label: 'Satisfaction Rate' },
  ],
  timeline: [
    { year: '2020', title: 'The Beginning', desc: 'GR Groups was born from a passion for luxury fashion, launching our first curated collection of streetwear and accessories.' },
    { year: '2021', title: 'Going Global', desc: 'We expanded to 20+ countries, partnering with exclusive artisan brands from Italy, Japan, and Scandinavia.' },
    { year: '2022', title: 'Tech Innovation', desc: 'Launched our AI-powered styling recommendations and augmented reality try-on features.' },
    { year: '2023', title: 'Community First', desc: 'Introduced our members-only Elite program, offering early access drops and personalized experiences.' },
    { year: '2024', title: 'Sustainability', desc: 'Committed to carbon-neutral shipping and partnered with eco-conscious brands worldwide.' },
  ]
};

/**
 * Helper to read settings from fallback file
 */
function getFallbackSettings() {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const data = fs.readFileSync(FALLBACK_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('[SettingsService] Failed to read fallback file:', error.message);
  }
  return {};
}

/**
 * Helper to save settings to fallback file
 */
function saveFallbackSettings(key, value) {
  try {
    const settings = getFallbackSettings();
    settings[key] = value;
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('[SettingsService] Failed to write fallback file:', error.message);
  }
}

/**
 * Fetch Story details
 * @returns {Promise<Object>} Story settings
 */
export async function getStorySettings() {
  const fallback = getFallbackSettings();
  if (fallback.story) {
    return fallback.story;
  }
  return DEFAULT_STORY;
}

/**
 * Save / Update Story details
 * @param {Object} storyData - New story data
 * @returns {Promise<Object>} Saved story data
 */
export async function saveStorySettings(storyData) {
  const storyItem = {
    heroTitle: storyData.heroTitle || DEFAULT_STORY.heroTitle,
    heroSubtitle: storyData.heroSubtitle || DEFAULT_STORY.heroSubtitle,
    heroDescription: storyData.heroDescription || DEFAULT_STORY.heroDescription,
    missionTitle: storyData.missionTitle || DEFAULT_STORY.missionTitle,
    missionDescription: storyData.missionDescription || DEFAULT_STORY.missionDescription,
    stats: storyData.stats || DEFAULT_STORY.stats,
    timeline: storyData.timeline || DEFAULT_STORY.timeline,
    updatedAt: new Date().toISOString(),
  };

  saveFallbackSettings('story', storyItem);
  return storyItem;
}
