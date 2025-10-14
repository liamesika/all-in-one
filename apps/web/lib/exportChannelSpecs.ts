/**
 * Export Channel Specifications
 * Defines technical specs for each platform and format
 */

export interface ChannelSpec {
  channel: string;
  format: string;
  dimensions: {
    width: number;
    height: number;
  };
  aspectRatio: string;
  maxFileSize: string;
  maxDuration?: string;
  videoCodec?: string;
  audioCodec?: string;
  bitrate?: string;
  frameRate?: string;
  fileFormat: string[];
  recommendations: string[];
}

export const CHANNEL_SPECS: Record<string, ChannelSpec> = {
  'meta-story': {
    channel: 'Meta (Facebook & Instagram)',
    format: 'Story',
    dimensions: { width: 1080, height: 1920 },
    aspectRatio: '9:16',
    maxFileSize: '4GB',
    maxDuration: '60s',
    videoCodec: 'H.264',
    audioCodec: 'AAC',
    bitrate: '8 Mbps',
    frameRate: '30 fps',
    fileFormat: ['MP4', 'MOV'],
    recommendations: [
      'Keep branding visible in center safe zone',
      'Add captions for sound-off viewing',
      'Hook viewers in first 3 seconds',
      'Use vertical video for mobile optimization',
    ],
  },
  'meta-feed': {
    channel: 'Meta (Facebook & Instagram)',
    format: 'Feed',
    dimensions: { width: 1080, height: 1080 },
    aspectRatio: '1:1',
    maxFileSize: '4GB',
    maxDuration: '60s',
    videoCodec: 'H.264',
    audioCodec: 'AAC',
    bitrate: '8 Mbps',
    frameRate: '30 fps',
    fileFormat: ['MP4', 'MOV'],
    recommendations: [
      'Square format works best in feed',
      'Add captions for accessibility',
      'Optimize for mobile viewing',
      'Include strong visual hook',
    ],
  },
  'meta-reel': {
    channel: 'Meta (Instagram)',
    format: 'Reel',
    dimensions: { width: 1080, height: 1920 },
    aspectRatio: '9:16',
    maxFileSize: '4GB',
    maxDuration: '90s',
    videoCodec: 'H.264',
    audioCodec: 'AAC',
    bitrate: '8 Mbps',
    frameRate: '30 fps',
    fileFormat: ['MP4', 'MOV'],
    recommendations: [
      'Vertical format required',
      'Use trending audio for discovery',
      'Fast-paced editing keeps attention',
      'Include text overlays',
    ],
  },
  'youtube-short': {
    channel: 'YouTube',
    format: 'Short',
    dimensions: { width: 1080, height: 1920 },
    aspectRatio: '9:16',
    maxFileSize: '256MB',
    maxDuration: '60s',
    videoCodec: 'H.264',
    audioCodec: 'AAC',
    bitrate: '8 Mbps',
    frameRate: '24-60 fps',
    fileFormat: ['MP4', 'MOV'],
    recommendations: [
      'Vertical format for Shorts',
      'Loop-friendly content performs better',
      'Strong hook in first 2 seconds',
      'Keep branding visible throughout',
    ],
  },
  'youtube-video': {
    channel: 'YouTube',
    format: 'Video',
    dimensions: { width: 1920, height: 1080 },
    aspectRatio: '16:9',
    maxFileSize: '256GB',
    maxDuration: 'No limit',
    videoCodec: 'H.264',
    audioCodec: 'AAC',
    bitrate: '8-15 Mbps',
    frameRate: '24-60 fps',
    fileFormat: ['MP4', 'MOV'],
    recommendations: [
      'Horizontal format for desktop viewing',
      'Include chapter markers for longer videos',
      'Optimize thumbnail separately',
      'Add end screen with CTA',
    ],
  },
  'tiktok': {
    channel: 'TikTok',
    format: 'Video',
    dimensions: { width: 1080, height: 1920 },
    aspectRatio: '9:16',
    maxFileSize: '4GB',
    maxDuration: '10m',
    videoCodec: 'H.264',
    audioCodec: 'AAC',
    bitrate: '8 Mbps',
    frameRate: '30 fps',
    fileFormat: ['MP4', 'MOV'],
    recommendations: [
      'Vertical format essential',
      'Hook in first second',
      'Use trending sounds and effects',
      'Native look beats polished ads',
    ],
  },
  'linkedin-video': {
    channel: 'LinkedIn',
    format: 'Video',
    dimensions: { width: 1920, height: 1080 },
    aspectRatio: '16:9',
    maxFileSize: '5GB',
    maxDuration: '10m',
    videoCodec: 'H.264',
    audioCodec: 'AAC',
    bitrate: '8 Mbps',
    frameRate: '30 fps',
    fileFormat: ['MP4', 'MOV'],
    recommendations: [
      'Professional tone and production',
      'Add captions for office viewing',
      'Educational or thought-leadership content',
      'Include company branding',
    ],
  },
  'linkedin-story': {
    channel: 'LinkedIn',
    format: 'Story',
    dimensions: { width: 1080, height: 1920 },
    aspectRatio: '9:16',
    maxFileSize: '5GB',
    maxDuration: '20s',
    videoCodec: 'H.264',
    audioCodec: 'AAC',
    bitrate: '8 Mbps',
    frameRate: '30 fps',
    fileFormat: ['MP4', 'MOV'],
    recommendations: [
      'Vertical format',
      'Keep it brief and impactful',
      'Professional but personable',
      'Include clear CTA',
    ],
  },
  'banner-leaderboard': {
    channel: 'Display Ads',
    format: 'Leaderboard',
    dimensions: { width: 728, height: 90 },
    aspectRatio: '8.1:1',
    maxFileSize: '150KB',
    fileFormat: ['JPG', 'PNG', 'GIF'],
    recommendations: [
      'Keep file size under 150KB',
      'Text should be legible at small size',
      'Include clear CTA button',
      'Test on light and dark backgrounds',
    ],
  },
  'banner-rectangle': {
    channel: 'Display Ads',
    format: 'Medium Rectangle',
    dimensions: { width: 300, height: 250 },
    aspectRatio: '6:5',
    maxFileSize: '150KB',
    fileFormat: ['JPG', 'PNG', 'GIF'],
    recommendations: [
      'Most common banner size',
      'Balance image and text',
      'Strong visual hierarchy',
      'Mobile-friendly design',
    ],
  },
  'banner-skyscraper': {
    channel: 'Display Ads',
    format: 'Skyscraper',
    dimensions: { width: 160, height: 600 },
    aspectRatio: '4:15',
    maxFileSize: '150KB',
    fileFormat: ['JPG', 'PNG', 'GIF'],
    recommendations: [
      'Vertical layout',
      'Content should flow top to bottom',
      'CTA at bottom or middle',
      'Works well in sidebar placements',
    ],
  },
};

export function getChannelSpec(channelKey: string): ChannelSpec | null {
  return CHANNEL_SPECS[channelKey] || null;
}

export function getAllChannels(): ChannelSpec[] {
  return Object.values(CHANNEL_SPECS);
}

export function getChannelsByPlatform(platform: string): ChannelSpec[] {
  return Object.values(CHANNEL_SPECS).filter((spec) =>
    spec.channel.toLowerCase().includes(platform.toLowerCase())
  );
}
