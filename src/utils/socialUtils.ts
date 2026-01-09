import {
    SocialPost,
    Platform,
    PLATFORMS,
    ContentCategory,
    ContentLibraryItem,
    BEST_POSTING_TIMES
} from '../types/social';

// Storage keys
const STORAGE_KEYS = {
    POSTS: 'social_planner_posts',
    DRAFTS: 'social_planner_drafts',
    LIBRARY: 'social_planner_library',
    CURRENT_POST: 'social_planner_current_post'
};

// Get user's timezone
export const getUserTimezone = (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

// Get platform config by ID
export const getPlatformConfig = (platformId: Platform) => {
    return PLATFORMS.find(p => p.id === platformId);
};

// Validate content length for selected platforms
export const validateContentLength = (content: string, platforms: Platform[]): {
    valid: boolean;
    errors: { platform: Platform; maxChars: number; currentLength: number }[]
} => {
    const errors: { platform: Platform; maxChars: number; currentLength: number }[] = [];

    platforms.forEach(platformId => {
        const config = getPlatformConfig(platformId);
        if (config && content.length > config.maxChars) {
            errors.push({
                platform: platformId,
                maxChars: config.maxChars,
                currentLength: content.length
            });
        }
    });

    return { valid: errors.length === 0, errors };
};

// Get minimum character limit for selected platforms
export const getMinCharLimit = (platforms: Platform[]): number => {
    if (platforms.length === 0) return 280;

    return Math.min(
        ...platforms.map(p => getPlatformConfig(p)?.maxChars || 280)
    );
};

// Validate hashtags count for platforms
export const validateHashtags = (hashtags: string[], platforms: Platform[]): {
    valid: boolean;
    errors: { platform: Platform; maxHashtags: number; currentCount: number }[]
} => {
    const errors: { platform: Platform; maxHashtags: number; currentCount: number }[] = [];

    platforms.forEach(platformId => {
        const config = getPlatformConfig(platformId);
        if (config && hashtags.length > config.maxHashtags) {
            errors.push({
                platform: platformId,
                maxHashtags: config.maxHashtags,
                currentCount: hashtags.length
            });
        }
    });

    return { valid: errors.length === 0, errors };
};

// Parse hashtags from text
export const parseHashtags = (text: string): string[] => {
    const matches = text.match(/#[\w\u0080-\uFFFF]+/g);
    return matches || [];
};

// Generate hashtag suggestions based on category and keywords
export const generateHashtagSuggestions = (
    category: ContentCategory,
    keywords: string[] = []
): string[] => {
    const categoryHashtags: Record<ContentCategory, string[]> = {
        announcement: ['#news', '#announcement', '#update', '#exciting', '#comingsoon', '#staytuned', '#bigreveal'],
        promo: ['#sale', '#deal', '#offer', '#discount', '#limited', '#exclusive', '#specialoffer', '#promo'],
        quote: ['#quotes', '#motivation', '#inspiration', '#wisdom', '#mindset', '#success', '#positivity'],
        testimonial: ['#review', '#testimonial', '#customerlove', '#feedback', '#happycustomer', '#5stars'],
        tip: ['#tips', '#howto', '#tutorial', '#learn', '#education', '#guide', '#protip', '#lifehack'],
        'behind-the-scenes': ['#bts', '#behindthescenes', '#dayinthelife', '#reallife', '#authentic', '#team'],
        'product-spotlight': ['#newproduct', '#product', '#musthave', '#trending', '#featured', '#spotlight'],
        sale: ['#sale', '#flashsale', '#clearance', '#deals', '#savings', '#shopnow', '#limitedtime'],
        other: ['#content', '#share', '#follow', '#like', '#community', '#viral']
    };

    const trendingHashtags = [
        '#fyp', '#viral', '#trending', '#explore', '#reels',
        '#contentcreator', '#socialmedia', '#marketing', '#business',
        '#entrepreneur', '#growth', '#brand', '#digital'
    ];

    const suggestions = new Set(categoryHashtags[category] || []);

    // Add keyword-based hashtags
    keywords.forEach(keyword => {
        const clean = keyword.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (clean.length > 2) {
            suggestions.add(`#${clean}`);
        }
    });

    // Add some trending tags
    trendingHashtags.slice(0, 5).forEach(tag => suggestions.add(tag));

    return Array.from(suggestions).slice(0, 30);
};

// Get best times to post for a specific day
export const getBestTimesToPost = (platform: Platform, dayOfWeek: number): string[] => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[dayOfWeek];
    const platformTimes = BEST_POSTING_TIMES[platform];

    if (!platformTimes) return [];

    const dayTimes = platformTimes.find(d => d.day === dayName);
    return dayTimes?.times || [];
};

// Get next best time to post
export const getNextBestTime = (platforms: Platform[]): { date: Date; time: string } => {
    const now = new Date();
    const dayOfWeek = now.getDay();

    // Get the primary platform (first one or default to instagram)
    const primaryPlatform = platforms[0] || 'instagram';
    const times = getBestTimesToPost(primaryPlatform, dayOfWeek);

    // Check if there's a good time today that hasn't passed
    for (const timeStr of times) {
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let hour24 = hours;

        if (period === 'PM' && hours !== 12) hour24 += 12;
        if (period === 'AM' && hours === 12) hour24 = 0;

        const suggestedTime = new Date(now);
        suggestedTime.setHours(hour24, minutes, 0, 0);

        if (suggestedTime > now) {
            return { date: suggestedTime, time: timeStr };
        }
    }

    // If no time today, suggest tomorrow's first time
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimes = getBestTimesToPost(primaryPlatform, tomorrow.getDay());

    return {
        date: tomorrow,
        time: tomorrowTimes[0] || '9:00 AM'
    };
};

// LocalStorage operations for posts
export const savePosts = (posts: SocialPost[]): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    } catch (error) {
        console.error('Error saving posts:', error);
    }
};

export const loadPosts = (): SocialPost[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.POSTS);
        if (!data) return [];

        const posts = JSON.parse(data);
        return posts.map((p: any) => ({
            ...p,
            scheduledDate: new Date(p.scheduledDate),
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt)
        }));
    } catch (error) {
        console.error('Error loading posts:', error);
        return [];
    }
};

// Save current editing post (auto-save)
export const saveCurrentPost = (post: Partial<SocialPost>): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.CURRENT_POST, JSON.stringify({
            ...post,
            updatedAt: new Date().toISOString()
        }));
    } catch (error) {
        console.error('Error saving current post:', error);
    }
};

export const loadCurrentPost = (): Partial<SocialPost> | null => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.CURRENT_POST);
        if (!data) return null;
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading current post:', error);
        return null;
    }
};

export const clearCurrentPost = (): void => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_POST);
};

// Content library operations
export const saveLibrary = (items: ContentLibraryItem[]): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(items));
    } catch (error) {
        console.error('Error saving library:', error);
    }
};

export const loadLibrary = (): ContentLibraryItem[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.LIBRARY);
        if (!data) return [];

        const items = JSON.parse(data);
        return items.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt)
        }));
    } catch (error) {
        console.error('Error loading library:', error);
        return [];
    }
};

// Convert file to base64 for storage
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// Get file size in human readable format
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generate UUID
export const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Debounce function for auto-save
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => func(...args), wait);
    };
};

// Format date for display
export const formatScheduleDate = (date: Date): string => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';

    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
};

// Get platform icon component name (for lucide-react)
export const getPlatformIcon = (platform: Platform): string => {
    const iconMap: Record<Platform, string> = {
        facebook: 'Facebook',
        twitter: 'Twitter',
        instagram: 'Instagram',
        linkedin: 'Linkedin',
        tiktok: 'Music2',
        pinterest: 'Pin',
        youtube: 'Youtube',
        threads: 'AtSign',
        telegram: 'Send'
    };
    return iconMap[platform] || 'Share2';
};

// Get posts for a specific date
export const getPostsForDate = (posts: SocialPost[], date: Date): SocialPost[] => {
    return posts.filter(post => {
        const postDate = new Date(post.scheduledDate);
        return postDate.toDateString() === date.toDateString();
    });
};

// Get posts for date range (for calendar view)
export const getPostsInRange = (
    posts: SocialPost[],
    startDate: Date,
    endDate: Date
): SocialPost[] => {
    return posts.filter(post => {
        const postDate = new Date(post.scheduledDate);
        return postDate >= startDate && postDate <= endDate;
    });
};

// Generate simulated analytics for demo
export const generateSimulatedAnalytics = (post: SocialPost) => {
    const baseEngagement = Math.random() * 1000;
    const platformMultiplier = post.platforms.length;

    return {
        impressions: Math.floor((baseEngagement * 10 + Math.random() * 5000) * platformMultiplier),
        engagements: Math.floor(baseEngagement * platformMultiplier),
        likes: Math.floor(baseEngagement * 0.7 * platformMultiplier),
        comments: Math.floor(baseEngagement * 0.2 * platformMultiplier),
        shares: Math.floor(baseEngagement * 0.1 * platformMultiplier),
        clicks: Math.floor(baseEngagement * 0.3 * platformMultiplier),
        reach: Math.floor((baseEngagement * 8 + Math.random() * 3000) * platformMultiplier)
    };
};

// Common emoji categories for the picker
export const EMOJI_CATEGORIES = {
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐'],
    gestures: ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏', '💪', '🦾', '🦿', '🦵', '🦶'],
    hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
    symbols: ['⭐', '🌟', '✨', '💫', '🔥', '💥', '💯', '✅', '❌', '⚡', '💡', '🎯', '🏆', '🥇', '🎉', '🎊', '🎁', '📌', '📍', '🔔', '🔕', '💬', '💭', '🗨️', '👁️‍🗨️', '📢', '📣', '🔊', '📱', '💻'],
    objects: ['📷', '📸', '📹', '🎥', '🎬', '📺', '🎙️', '🎧', '🎤', '🎵', '🎶', '🎹', '🪕', '🎸', '🎺', '🎷', '🪗', '🥁', '🪘', '🎻'],
    nature: ['🌸', '🌹', '🌺', '🌻', '🌼', '🌷', '🌱', '🪴', '🌲', '🌳', '🌴', '🪵', '🌵', '🍀', '☘️', '🍃', '🍂', '🍁', '🌾', '🪺'],
    food: ['🍕', '🍔', '🍟', '🌭', '🍿', '🧁', '🍰', '🎂', '🍩', '🍪', '☕', '🍵', '🧃', '🍶', '🍾', '🍷', '🍸', '🍹', '🧋', '🥤'],
    travel: ['✈️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚢', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌']
};
