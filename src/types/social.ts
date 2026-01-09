// Platform types
export type Platform =
  | 'facebook'
  | 'twitter'
  | 'instagram'
  | 'linkedin'
  | 'tiktok'
  | 'pinterest'
  | 'youtube'
  | 'threads'
  | 'telegram';

// Content categories for posts
export type ContentCategory =
  | 'announcement'
  | 'promo'
  | 'quote'
  | 'testimonial'
  | 'tip'
  | 'behind-the-scenes'
  | 'product-spotlight'
  | 'sale'
  | 'other';

// Media types
export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number; // For videos, in seconds
}

// Social post interface
export interface SocialPost {
  id: string;
  content: string;
  platforms: Platform[];
  scheduledDate: Date;
  scheduledTime: string;
  status: 'draft' | 'scheduled' | 'published';
  media: MediaItem[];
  hashtags: string[];
  category: ContentCategory;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
  analytics?: PostAnalytics;
}

// Analytics for individual posts
export interface PostAnalytics {
  impressions: number;
  engagements: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  reach: number;
}

// Content library item
export interface ContentLibraryItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
  size: number;
  folder: string;
  tags: string[];
  createdAt: Date;
  usedCount: number;
}

// Template for quick post creation
export interface PostTemplate {
  id: string;
  title: string;
  description: string;
  category: ContentCategory;
  platform: Platform | 'all';
  content: string;
  hashtags: string[];
  thumbnail: string;
}

// Platform configuration with all rules
export interface PlatformConfig {
  id: Platform;
  name: string;
  color: string;
  icon: string;
  maxChars: number;
  maxHashtags: number;
  mediaRules: {
    allowImages: boolean;
    allowVideos: boolean;
    allowCarousel: boolean;
    maxMediaCount: number;
    imageRatios: string[];
    maxVideoLength: number; // seconds
    minImageWidth: number;
    minImageHeight: number;
  };
}

// Full platform configurations
export const PLATFORMS: PlatformConfig[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877F2',
    icon: 'facebook',
    maxChars: 63206,
    maxHashtags: 30,
    mediaRules: {
      allowImages: true,
      allowVideos: true,
      allowCarousel: true,
      maxMediaCount: 10,
      imageRatios: ['1:1', '4:5', '16:9', '9:16'],
      maxVideoLength: 240 * 60,
      minImageWidth: 600,
      minImageHeight: 315
    }
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    color: '#000000',
    icon: 'twitter',
    maxChars: 280,
    maxHashtags: 10,
    mediaRules: {
      allowImages: true,
      allowVideos: true,
      allowCarousel: false,
      maxMediaCount: 4,
      imageRatios: ['16:9', '1:1'],
      maxVideoLength: 140,
      minImageWidth: 600,
      minImageHeight: 335
    }
  },
  {
    id: 'instagram',
    name: 'Instagram',
    color: '#E4405F',
    icon: 'instagram',
    maxChars: 2200,
    maxHashtags: 30,
    mediaRules: {
      allowImages: true,
      allowVideos: true,
      allowCarousel: true,
      maxMediaCount: 10,
      imageRatios: ['1:1', '4:5', '1.91:1'],
      maxVideoLength: 90,
      minImageWidth: 1080,
      minImageHeight: 1080
    }
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: '#0A66C2',
    icon: 'linkedin',
    maxChars: 3000,
    maxHashtags: 5,
    mediaRules: {
      allowImages: true,
      allowVideos: true,
      allowCarousel: true,
      maxMediaCount: 9,
      imageRatios: ['1:1', '1.91:1', '4:5'],
      maxVideoLength: 600,
      minImageWidth: 1200,
      minImageHeight: 627
    }
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    color: '#000000',
    icon: 'tiktok',
    maxChars: 150,
    maxHashtags: 5,
    mediaRules: {
      allowImages: false,
      allowVideos: true,
      allowCarousel: false,
      maxMediaCount: 1,
      imageRatios: [],
      maxVideoLength: 180,
      minImageWidth: 0,
      minImageHeight: 0
    }
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    color: '#E60023',
    icon: 'pinterest',
    maxChars: 500,
    maxHashtags: 20,
    mediaRules: {
      allowImages: true,
      allowVideos: true,
      allowCarousel: true,
      maxMediaCount: 5,
      imageRatios: ['2:3', '1:1'],
      maxVideoLength: 60,
      minImageWidth: 1000,
      minImageHeight: 1500
    }
  },
  {
    id: 'youtube',
    name: 'YouTube Shorts',
    color: '#FF0000',
    icon: 'youtube',
    maxChars: 100,
    maxHashtags: 15,
    mediaRules: {
      allowImages: false,
      allowVideos: true,
      allowCarousel: false,
      maxMediaCount: 1,
      imageRatios: [],
      maxVideoLength: 60,
      minImageWidth: 0,
      minImageHeight: 0
    }
  },
  {
    id: 'threads',
    name: 'Threads',
    color: '#000000',
    icon: 'threads',
    maxChars: 500,
    maxHashtags: 10,
    mediaRules: {
      allowImages: true,
      allowVideos: true,
      allowCarousel: true,
      maxMediaCount: 10,
      imageRatios: ['1:1', '4:5', '16:9'],
      maxVideoLength: 300,
      minImageWidth: 1080,
      minImageHeight: 1080
    }
  },
  {
    id: 'telegram',
    name: 'Telegram',
    color: '#26A5E4',
    icon: 'send',
    maxChars: 4096,
    maxHashtags: 50,
    mediaRules: {
      allowImages: true,
      allowVideos: true,
      allowCarousel: true,
      maxMediaCount: 10,
      imageRatios: ['any'],
      maxVideoLength: 60 * 60,
      minImageWidth: 100,
      minImageHeight: 100
    }
  }
];

// Content categories with metadata
export const CONTENT_CATEGORIES: { id: ContentCategory; name: string; icon: string; color: string }[] = [
  { id: 'announcement', name: 'Announcement', icon: 'megaphone', color: '#3B82F6' },
  { id: 'promo', name: 'Promo', icon: 'tag', color: '#10B981' },
  { id: 'quote', name: 'Quote', icon: 'quote', color: '#8B5CF6' },
  { id: 'testimonial', name: 'Testimonial', icon: 'star', color: '#F59E0B' },
  { id: 'tip', name: 'Tip', icon: 'lightbulb', color: '#06B6D4' },
  { id: 'behind-the-scenes', name: 'Behind the Scenes', icon: 'camera', color: '#EC4899' },
  { id: 'product-spotlight', name: 'Product Spotlight', icon: 'sparkles', color: '#F97316' },
  { id: 'sale', name: 'Sale', icon: 'percent', color: '#EF4444' },
  { id: 'other', name: 'Other', icon: 'file', color: '#6B7280' }
];

// Analytics overview data
export interface AnalyticsOverview {
  totalPosts: number;
  totalEngagements: number;
  totalImpressions: number;
  avgEngagementRate: number;
  postsByPlatform: Record<Platform, number>;
  postsByCategory: Record<ContentCategory, number>;
  topPerformingPosts: SocialPost[];
  consistencyScore: number;
  weeklyPostCounts: number[];
}

// Best times to post per platform
export const BEST_POSTING_TIMES: Record<Platform, { day: string; times: string[] }[]> = {
  facebook: [
    { day: 'Monday', times: ['9:00 AM', '1:00 PM'] },
    { day: 'Tuesday', times: ['9:00 AM', '1:00 PM', '3:00 PM'] },
    { day: 'Wednesday', times: ['9:00 AM', '1:00 PM'] },
    { day: 'Thursday', times: ['9:00 AM', '12:00 PM', '2:00 PM'] },
    { day: 'Friday', times: ['9:00 AM', '11:00 AM'] },
    { day: 'Saturday', times: ['10:00 AM', '12:00 PM'] },
    { day: 'Sunday', times: ['10:00 AM', '12:00 PM'] }
  ],
  twitter: [
    { day: 'Monday', times: ['8:00 AM', '12:00 PM', '5:00 PM'] },
    { day: 'Tuesday', times: ['9:00 AM', '12:00 PM', '5:00 PM'] },
    { day: 'Wednesday', times: ['9:00 AM', '12:00 PM', '5:00 PM'] },
    { day: 'Thursday', times: ['9:00 AM', '12:00 PM', '5:00 PM'] },
    { day: 'Friday', times: ['9:00 AM', '12:00 PM'] },
    { day: 'Saturday', times: ['10:00 AM'] },
    { day: 'Sunday', times: ['10:00 AM'] }
  ],
  instagram: [
    { day: 'Monday', times: ['6:00 AM', '10:00 AM', '10:00 PM'] },
    { day: 'Tuesday', times: ['2:00 AM', '4:00 AM', '9:00 AM'] },
    { day: 'Wednesday', times: ['7:00 AM', '8:00 AM', '11:00 PM'] },
    { day: 'Thursday', times: ['9:00 AM', '12:00 PM', '7:00 PM'] },
    { day: 'Friday', times: ['5:00 AM', '1:00 PM', '3:00 PM'] },
    { day: 'Saturday', times: ['11:00 AM', '7:00 PM', '8:00 PM'] },
    { day: 'Sunday', times: ['7:00 AM', '8:00 AM', '4:00 PM'] }
  ],
  linkedin: [
    { day: 'Monday', times: ['7:00 AM', '12:00 PM'] },
    { day: 'Tuesday', times: ['7:00 AM', '10:00 AM', '12:00 PM'] },
    { day: 'Wednesday', times: ['7:00 AM', '8:00 AM', '12:00 PM'] },
    { day: 'Thursday', times: ['7:00 AM', '9:00 AM', '1:00 PM'] },
    { day: 'Friday', times: ['7:00 AM', '12:00 PM'] },
    { day: 'Saturday', times: ['10:00 AM'] },
    { day: 'Sunday', times: ['10:00 AM'] }
  ],
  tiktok: [
    { day: 'Monday', times: ['6:00 AM', '10:00 AM', '10:00 PM'] },
    { day: 'Tuesday', times: ['2:00 AM', '4:00 AM', '9:00 AM'] },
    { day: 'Wednesday', times: ['7:00 AM', '8:00 AM', '11:00 PM'] },
    { day: 'Thursday', times: ['9:00 AM', '12:00 PM', '7:00 PM'] },
    { day: 'Friday', times: ['5:00 AM', '1:00 PM', '3:00 PM'] },
    { day: 'Saturday', times: ['11:00 AM', '7:00 PM', '8:00 PM'] },
    { day: 'Sunday', times: ['7:00 AM', '8:00 AM', '4:00 PM'] }
  ],
  pinterest: [
    { day: 'Monday', times: ['2:00 PM', '9:00 PM'] },
    { day: 'Tuesday', times: ['2:00 PM', '9:00 PM'] },
    { day: 'Wednesday', times: ['2:00 PM', '9:00 PM'] },
    { day: 'Thursday', times: ['2:00 PM', '9:00 PM'] },
    { day: 'Friday', times: ['2:00 PM', '9:00 PM'] },
    { day: 'Saturday', times: ['8:00 PM', '11:00 PM'] },
    { day: 'Sunday', times: ['8:00 PM', '11:00 PM'] }
  ],
  youtube: [
    { day: 'Monday', times: ['2:00 PM', '4:00 PM'] },
    { day: 'Tuesday', times: ['2:00 PM', '4:00 PM'] },
    { day: 'Wednesday', times: ['2:00 PM', '4:00 PM'] },
    { day: 'Thursday', times: ['2:00 PM', '4:00 PM'] },
    { day: 'Friday', times: ['2:00 PM', '4:00 PM'] },
    { day: 'Saturday', times: ['9:00 AM', '11:00 AM'] },
    { day: 'Sunday', times: ['9:00 AM', '11:00 AM'] }
  ],
  threads: [
    { day: 'Monday', times: ['7:00 AM', '12:00 PM', '7:00 PM'] },
    { day: 'Tuesday', times: ['7:00 AM', '12:00 PM', '7:00 PM'] },
    { day: 'Wednesday', times: ['7:00 AM', '12:00 PM', '7:00 PM'] },
    { day: 'Thursday', times: ['7:00 AM', '12:00 PM', '7:00 PM'] },
    { day: 'Friday', times: ['7:00 AM', '12:00 PM'] },
    { day: 'Saturday', times: ['10:00 AM', '7:00 PM'] },
    { day: 'Sunday', times: ['10:00 AM', '7:00 PM'] }
  ],
  telegram: [
    { day: 'Monday', times: ['9:00 AM', '1:00 PM', '6:00 PM'] },
    { day: 'Tuesday', times: ['9:00 AM', '1:00 PM', '6:00 PM'] },
    { day: 'Wednesday', times: ['9:00 AM', '1:00 PM', '6:00 PM'] },
    { day: 'Thursday', times: ['9:00 AM', '1:00 PM', '6:00 PM'] },
    { day: 'Friday', times: ['9:00 AM', '1:00 PM'] },
    { day: 'Saturday', times: ['11:00 AM', '5:00 PM'] },
    { day: 'Sunday', times: ['11:00 AM', '5:00 PM'] }
  ]
};

// Default templates
export const DEFAULT_TEMPLATES: PostTemplate[] = [
  {
    id: 'motivational-quote',
    title: 'Motivational Quote',
    description: 'Inspiring quote to engage your audience',
    category: 'quote',
    platform: 'all',
    content: '"[Your inspiring quote here]"\n\n— [Author Name]\n\nWhat\'s your favorite quote that keeps you motivated? Share it below! 👇',
    hashtags: ['#motivation', '#inspiration', '#quotes', '#dailymotivation', '#success'],
    thumbnail: '💪'
  },
  {
    id: 'carousel-promo',
    title: 'Carousel Promo',
    description: 'Multi-slide promotional content',
    category: 'promo',
    platform: 'instagram',
    content: '🔥 [Product/Service Name] 🔥\n\nSwipe through to discover:\n\n➡️ Benefit 1\n➡️ Benefit 2\n➡️ Benefit 3\n➡️ Benefit 4\n\n💫 Limited time offer!\n\nTap the link in bio to learn more.',
    hashtags: ['#promo', '#specialoffer', '#limitedtime', '#sale', '#shopnow'],
    thumbnail: '🛒'
  },
  {
    id: 'sale-announcement',
    title: 'Sale Announcement',
    description: 'Announce a flash sale or discount',
    category: 'sale',
    platform: 'all',
    content: '🚨 FLASH SALE ALERT! 🚨\n\n[X]% OFF EVERYTHING!\n\n⏰ Limited time only: [Date/Time]\n\n✅ [Highlight 1]\n✅ [Highlight 2]\n✅ [Highlight 3]\n\n🔗 Shop now: [Link]\n\nDon\'t miss out! ⚡',
    hashtags: ['#sale', '#flashsale', '#discount', '#deals', '#shopnow'],
    thumbnail: '🏷️'
  },
  {
    id: 'testimonial',
    title: 'Customer Testimonial',
    description: 'Share customer success stories',
    category: 'testimonial',
    platform: 'all',
    content: '⭐⭐⭐⭐⭐\n\n"[Customer quote/testimonial here]"\n\n— [Customer Name], [Location/Title]\n\nThank you for your kind words, [First Name]! 🙏\n\nWant to share your experience? Drop a comment below!',
    hashtags: ['#testimonial', '#customerlove', '#review', '#happycustomer', '#thankyou'],
    thumbnail: '⭐'
  },
  {
    id: 'product-spotlight',
    title: 'Product Spotlight',
    description: 'Highlight a specific product or feature',
    category: 'product-spotlight',
    platform: 'all',
    content: '✨ PRODUCT SPOTLIGHT ✨\n\nIntroducing: [Product Name]\n\n🎯 What it does:\n[Brief description]\n\n💎 Key Features:\n• [Feature 1]\n• [Feature 2]\n• [Feature 3]\n\n👉 [Call to action]\n\n📦 Available now at [Location/Link]',
    hashtags: ['#newproduct', '#productlaunch', '#musthave', '#trending'],
    thumbnail: '🌟'
  },
  {
    id: 'behind-the-scenes',
    title: 'Behind the Scenes',
    description: 'Show the human side of your brand',
    category: 'behind-the-scenes',
    platform: 'all',
    content: '👀 BEHIND THE SCENES 👀\n\nEver wondered what goes into [process/product]?\n\nHere\'s a sneak peek! 🎬\n\n[Brief description of what\'s shown]\n\nWhat would you like to see more of? Let us know! 💬',
    hashtags: ['#behindthescenes', '#bts', '#teamwork', '#dayinthelife', '#authentic'],
    thumbnail: '🎬'
  },
  {
    id: 'tip-of-the-day',
    title: 'Tip of the Day',
    description: 'Share valuable tips with your audience',
    category: 'tip',
    platform: 'all',
    content: '💡 TIP OF THE DAY 💡\n\n[Tip Title]\n\n📝 Here\'s what you need to know:\n\n1️⃣ [Step/Point 1]\n2️⃣ [Step/Point 2]\n3️⃣ [Step/Point 3]\n\n💾 Save this post for later!\n\nDrop a 💡 if you found this helpful!',
    hashtags: ['#tips', '#protip', '#lifehack', '#didyouknow', '#learnwithme'],
    thumbnail: '💡'
  },
  {
    id: 'announcement',
    title: 'General Announcement',
    description: 'Make important announcements',
    category: 'announcement',
    platform: 'all',
    content: '📢 ANNOUNCEMENT 📢\n\nWe have exciting news to share!\n\n🎉 [Main announcement]\n\n📅 When: [Date/Time]\n📍 Where: [Location/Platform]\n\nStay tuned for more updates!\n\n🔔 Turn on notifications to not miss out!',
    hashtags: ['#announcement', '#news', '#exciting', '#update', '#staytuned'],
    thumbnail: '📢'
  }
];
