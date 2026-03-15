import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Image,
    Video,
    X,
    Hash,
    Smile,
    Sparkles,
    Clock,
    AlertCircle,
    Check,
    Upload
} from 'lucide-react';
import {
    SocialPost,
    Platform,
    PLATFORMS,
    ContentCategory,
    CONTENT_CATEGORIES,
    MediaItem
} from '../../types/social';
import {
    validateContentLength,
    getMinCharLimit,
    generateHashtagSuggestions,
    fileToBase64,
    generateId,
    formatFileSize,
    getNextBestTime,
    EMOJI_CATEGORIES
} from '../../utils/socialUtils';

interface PostComposerProps {
    post: Partial<SocialPost>;
    onUpdate: (post: Partial<SocialPost>) => void;
    onSaveDraft: () => void;
    onSchedule: () => void;
    isEditing?: boolean;
}

export const PostComposer: React.FC<PostComposerProps> = ({
    post,
    onUpdate,
    onSaveDraft,
    onSchedule,
    isEditing = false
}) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
    const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
    const [activeEmojiCategory, setActiveEmojiCategory] = useState<keyof typeof EMOJI_CATEGORIES>('smileys');
    const [dragActive, setDragActive] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const selectedPlatforms = post.platforms || [];
    const content = post.content || '';
    const media = post.media || [];
    const hashtags = post.hashtags || [];
    const category = post.category || 'other';

    // Character limit based on selected platforms
    const charLimit = getMinCharLimit(selectedPlatforms);
    const charsUsed = content.length;
    const isOverLimit = charsUsed > charLimit;

    // Validate content whenever it changes
    useEffect(() => {
        if (selectedPlatforms.length > 0) {
            const validation = validateContentLength(content, selectedPlatforms);
            if (!validation.valid) {
                setValidationErrors(
                    validation.errors.map(e =>
                        `${PLATFORMS.find(p => p.id === e.platform)?.name}: ${e.currentLength}/${e.maxChars} chars`
                    )
                );
            } else {
                setValidationErrors([]);
            }
        }
    }, [content, selectedPlatforms]);

    // Generate hashtag suggestions
    const handleGenerateHashtags = () => {
        const keywords = content.split(/\s+/).filter(w => w.length > 4);
        const suggestions = generateHashtagSuggestions(category as ContentCategory, keywords);
        setSuggestedHashtags(suggestions);
        setShowHashtagSuggestions(true);
    };

    // Toggle platform selection
    const togglePlatform = (platformId: Platform) => {
        const newPlatforms = selectedPlatforms.includes(platformId)
            ? selectedPlatforms.filter(p => p !== platformId)
            : [...selectedPlatforms, platformId];
        onUpdate({ ...post, platforms: newPlatforms });
    };

    // Handle content change
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdate({ ...post, content: e.target.value });
    };

    // Add emoji to content
    const addEmoji = (emoji: string) => {
        const textarea = textareaRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newContent = content.substring(0, start) + emoji + content.substring(end);
            onUpdate({ ...post, content: newContent });

            // Reset cursor position
            setTimeout(() => {
                textarea.setSelectionRange(start + emoji.length, start + emoji.length);
                textarea.focus();
            }, 0);
        } else {
            onUpdate({ ...post, content: content + emoji });
        }
    };

    // Add hashtag
    const addHashtag = (tag: string) => {
        if (!hashtags.includes(tag)) {
            onUpdate({ ...post, hashtags: [...hashtags, tag] });
        }
    };

    // Remove hashtag
    const removeHashtag = (tag: string) => {
        onUpdate({ ...post, hashtags: hashtags.filter(h => h !== tag) });
    };

    // Handle file upload
    const handleFileUpload = async (files: FileList | null) => {
        if (!files) return;

        const newMedia: MediaItem[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');

            if (!isImage && !isVideo) continue;

            try {
                const base64 = await fileToBase64(file);
                newMedia.push({
                    id: generateId(),
                    url: base64,
                    type: isImage ? 'image' : 'video',
                    name: file.name,
                    size: file.size
                });
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }

        onUpdate({ ...post, media: [...media, ...newMedia] });
    };

    // Handle drag events
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFileUpload(e.dataTransfer.files);
    };

    // Remove media
    const removeMedia = (mediaId: string) => {
        onUpdate({ ...post, media: media.filter(m => m.id !== mediaId) });
    };

    // Get best time suggestion
    const bestTime = getNextBestTime(selectedPlatforms);

    // Set scheduled date/time
    const handleSetSchedule = (date: string, time: string) => {
        onUpdate({
            ...post,
            scheduledDate: new Date(date),
            scheduledTime: time
        });
    };

    const useBestTime = () => {
        handleSetSchedule(
            bestTime.date.toISOString().split('T')[0],
            bestTime.time
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Sparkles className="text-purple-500" size={20} />
                    {isEditing ? 'Edit Post' : 'Create Post'}
                </h2>
                <p className="text-sm text-gray-500">Craft your perfect social media post</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Platform Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Platforms
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {PLATFORMS.map((platform) => {
                            const isSelected = selectedPlatforms.includes(platform.id);
                            return (
                                <motion.button
                                    key={platform.id}
                                    onClick={() => togglePlatform(platform.id)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`
                    flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium
                    transition-all border-2
                    ${isSelected
                                            ? 'text-white shadow-md'
                                            : 'text-gray-600 border-gray-200 bg-white hover:border-gray-300'
                                        }
                  `}
                                    style={{
                                        backgroundColor: isSelected ? platform.color : undefined,
                                        borderColor: isSelected ? platform.color : undefined
                                    }}
                                >
                                    <div
                                        className={`w-3 h-3 rounded-full ${isSelected ? 'bg-white/30' : ''}`}
                                        style={{ backgroundColor: isSelected ? 'white' : platform.color }}
                                    />
                                    {platform.name}
                                    {isSelected && <Check size={14} />}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content Type
                    </label>
                    <select
                        value={category}
                        onChange={(e) => onUpdate({ ...post, category: e.target.value as ContentCategory })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                        {CONTENT_CATEGORIES.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Caption/Content */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Caption
                    </label>
                    <div className="relative">
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={handleContentChange}
                            rows={6}
                            placeholder="What's on your mind? Write your post content here..."
                            className={`
                w-full px-4 py-3 border rounded-xl resize-none
                focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                ${isOverLimit ? 'border-red-300 bg-red-50' : 'border-gray-200'}
              `}
                        />

                        {/* Character counter */}
                        <div className={`
              absolute bottom-3 right-3 text-sm font-medium
              ${isOverLimit ? 'text-red-500' : charsUsed > charLimit * 0.9 ? 'text-yellow-500' : 'text-gray-400'}
            `}>
                            {charsUsed} / {charLimit}
                        </div>
                    </div>

                    {/* Validation errors */}
                    <AnimatePresence>
                        {validationErrors.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg"
                            >
                                {validationErrors.map((error, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-red-600">
                                        <AlertCircle size={14} />
                                        {error}
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Quick actions toolbar */}
                    <div className="flex items-center gap-2 mt-2">
                        <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Add emoji"
                        >
                            <Smile size={20} className="text-gray-500" />
                        </button>
                        <button
                            onClick={handleGenerateHashtags}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Generate hashtags"
                        >
                            <Hash size={20} className="text-gray-500" />
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Add media"
                        >
                            <Image size={20} className="text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Emoji Picker */}
                <AnimatePresence>
                    {showEmojiPicker && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="border rounded-xl p-3 bg-gray-50"
                        >
                            <div className="flex gap-1 mb-2 border-b pb-2 overflow-x-auto">
                                {Object.keys(EMOJI_CATEGORIES).map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveEmojiCategory(cat as keyof typeof EMOJI_CATEGORIES)}
                                        className={`
                      px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap
                      ${activeEmojiCategory === cat ? 'bg-purple-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}
                    `}
                                    >
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-10 gap-1 max-h-32 overflow-y-auto">
                                {EMOJI_CATEGORIES[activeEmojiCategory].map((emoji, i) => (
                                    <button
                                        key={i}
                                        onClick={() => addEmoji(emoji)}
                                        className="p-1 text-xl hover:bg-white rounded transition-colors"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Hashtag Suggestions */}
                <AnimatePresence>
                    {showHashtagSuggestions && suggestedHashtags.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="border rounded-xl p-3 bg-blue-50"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-blue-800">Suggested Hashtags</span>
                                <button
                                    onClick={() => setShowHashtagSuggestions(false)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {suggestedHashtags.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => addHashtag(tag)}
                                        disabled={hashtags.includes(tag)}
                                        className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${hashtags.includes(tag)
                                                ? 'bg-blue-200 text-blue-400 cursor-not-allowed'
                                                : 'bg-white text-blue-600 hover:bg-blue-100'}
                    `}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Selected Hashtags */}
                {hashtags.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hashtags ({hashtags.length})
                        </label>
                        <div className="flex flex-wrap gap-1">
                            {hashtags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                                >
                                    {tag}
                                    <button
                                        onClick={() => removeHashtag(tag)}
                                        className="hover:text-purple-900"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Media Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Media
                    </label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                    />

                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`
              border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer
              ${dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}
            `}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                        <p className="text-sm text-gray-600">
                            Drag & drop files here, or <span className="text-purple-600 font-medium">browse</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Supports images and videos
                        </p>
                    </div>

                    {/* Media preview */}
                    {media.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-3">
                            {media.map((item) => (
                                <div key={item.id} className="relative group">
                                    {item.type === 'image' ? (
                                        <img
                                            src={item.url}
                                            alt={item.name}
                                            className="w-full h-24 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-full h-24 bg-gray-800 rounded-lg flex items-center justify-center">
                                            <Video className="text-white" size={24} />
                                        </div>
                                    )}
                                    <button
                                        onClick={() => removeMedia(item.id)}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                    <div className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1 rounded">
                                        {formatFileSize(item.size)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Schedule */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Clock size={16} />
                        Schedule
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="date"
                            value={post.scheduledDate ? new Date(post.scheduledDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleSetSchedule(e.target.value, post.scheduledTime || '09:00')}
                            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                            type="time"
                            value={post.scheduledTime || ''}
                            onChange={(e) => onUpdate({ ...post, scheduledTime: e.target.value })}
                            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    {selectedPlatforms.length > 0 && (
                        <button
                            onClick={useBestTime}
                            className="mt-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                        >
                            <Sparkles size={14} />
                            Use best time: {bestTime.time} on {bestTime.date.toLocaleDateString()}
                        </button>
                    )}
                </div>
            </div>

            {/* Footer actions */}
            <div className="p-4 border-t bg-gray-50 flex gap-3">
                <button
                    onClick={onSaveDraft}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                    Save Draft
                </button>
                <motion.button
                    onClick={onSchedule}
                    disabled={!content || selectedPlatforms.length === 0 || isOverLimit}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
            flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors
            ${(!content || selectedPlatforms.length === 0 || isOverLimit)
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                        }
          `}
                >
                    Schedule Post
                </motion.button>
            </div>
        </div>
    );
};
