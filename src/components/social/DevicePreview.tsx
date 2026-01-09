import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Smartphone,
    Heart,
    MessageCircle,
    Share2,
    Bookmark,
    MoreHorizontal,
    Play,
    ThumbsUp,
    Repeat2,
    Send,
    Eye
} from 'lucide-react';
import { SocialPost, Platform, PLATFORMS } from '../../types/social';
import { format } from 'date-fns';

interface DevicePreviewProps {
    post: Partial<SocialPost>;
    userName?: string;
    userAvatar?: string;
}

export const DevicePreview: React.FC<DevicePreviewProps> = ({
    post,
    userName = 'Your Brand',
    userAvatar
}) => {
    const [selectedPlatform, setSelectedPlatform] = useState<Platform>(
        post.platforms?.[0] || 'instagram'
    );

    const content = post.content || 'Your post content will appear here...';
    const hashtags = post.hashtags || [];
    const media = post.media?.[0];

    // Simulated engagement numbers
    const engagement = {
        likes: Math.floor(Math.random() * 500) + 50,
        comments: Math.floor(Math.random() * 50) + 5,
        shares: Math.floor(Math.random() * 30) + 2
    };

    const renderInstagramPreview = () => (
        <div className="bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                        {userName.charAt(0)}
                    </div>
                    <span className="font-semibold text-sm">{userName.toLowerCase().replace(/\s/g, '')}</span>
                </div>
                <MoreHorizontal size={20} />
            </div>

            {/* Media */}
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                {media ? (
                    media.type === 'image' ? (
                        <img src={media.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="relative w-full h-full bg-black flex items-center justify-center">
                            <Play size={48} className="text-white" />
                        </div>
                    )
                ) : (
                    <div className="text-gray-400 text-center p-4">
                        <Smartphone size={48} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Your media preview</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-4">
                        <Heart size={24} className="text-gray-800" />
                        <MessageCircle size={24} className="text-gray-800" />
                        <Send size={24} className="text-gray-800" />
                    </div>
                    <Bookmark size={24} className="text-gray-800" />
                </div>
                <div className="font-semibold text-sm mb-1">{engagement.likes.toLocaleString()} likes</div>
                <div className="text-sm">
                    <span className="font-semibold">{userName.toLowerCase().replace(/\s/g, '')}</span>{' '}
                    <span className="whitespace-pre-wrap">{content.substring(0, 100)}</span>
                    {content.length > 100 && <span className="text-gray-500">...more</span>}
                </div>
                {hashtags.length > 0 && (
                    <div className="text-sm text-blue-600 mt-1">
                        {hashtags.slice(0, 5).join(' ')}
                    </div>
                )}
                <div className="text-xs text-gray-400 mt-2">
                    View all {engagement.comments} comments
                </div>
            </div>
        </div>
    );

    const renderTwitterPreview = () => (
        <div className="bg-white p-4">
            <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white font-bold">
                    {userName.charAt(0)}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-1">
                        <span className="font-bold text-black">{userName}</span>
                        <span className="text-gray-500">@{userName.toLowerCase().replace(/\s/g, '')}</span>
                        <span className="text-gray-500">·</span>
                        <span className="text-gray-500">1h</span>
                    </div>
                    <p className="text-black mt-1 whitespace-pre-wrap">{content}</p>
                    {hashtags.length > 0 && (
                        <div className="text-blue-500 mt-1">
                            {hashtags.slice(0, 3).join(' ')}
                        </div>
                    )}
                    {media && (
                        <div className="mt-3 rounded-2xl overflow-hidden border">
                            {media.type === 'image' ? (
                                <img src={media.url} alt="" className="w-full" />
                            ) : (
                                <div className="relative aspect-video bg-black flex items-center justify-center">
                                    <Play size={48} className="text-white" />
                                </div>
                            )}
                        </div>
                    )}
                    <div className="flex justify-between mt-3 text-gray-500 max-w-xs">
                        <div className="flex items-center gap-1">
                            <MessageCircle size={18} />
                            <span className="text-sm">{engagement.comments}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Repeat2 size={18} />
                            <span className="text-sm">{engagement.shares}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Heart size={18} />
                            <span className="text-sm">{engagement.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye size={18} />
                            <span className="text-sm">{(engagement.likes * 10).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFacebookPreview = () => (
        <div className="bg-white">
            <div className="p-3">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold">
                        {userName.charAt(0)}
                    </div>
                    <div>
                        <div className="font-semibold text-sm">{userName}</div>
                        <div className="text-xs text-gray-500">Just now · 🌐</div>
                    </div>
                </div>
                <p className="mt-3 text-sm whitespace-pre-wrap">{content}</p>
                {hashtags.length > 0 && (
                    <div className="text-blue-600 text-sm mt-1">
                        {hashtags.slice(0, 5).join(' ')}
                    </div>
                )}
            </div>
            {media && (
                <div className="border-t border-b">
                    {media.type === 'image' ? (
                        <img src={media.url} alt="" className="w-full" />
                    ) : (
                        <div className="relative aspect-video bg-black flex items-center justify-center">
                            <Play size={48} className="text-white" />
                        </div>
                    )}
                </div>
            )}
            <div className="p-2 text-xs text-gray-500 border-b flex justify-between">
                <span>👍❤️ {engagement.likes}</span>
                <span>{engagement.comments} comments · {engagement.shares} shares</span>
            </div>
            <div className="flex divide-x">
                <button className="flex-1 py-2 text-gray-600 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50">
                    <ThumbsUp size={18} /> Like
                </button>
                <button className="flex-1 py-2 text-gray-600 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50">
                    <MessageCircle size={18} /> Comment
                </button>
                <button className="flex-1 py-2 text-gray-600 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50">
                    <Share2 size={18} /> Share
                </button>
            </div>
        </div>
    );

    const renderLinkedInPreview = () => (
        <div className="bg-white">
            <div className="p-3">
                <div className="flex items-start gap-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold">
                        {userName.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <div className="font-semibold text-sm">{userName}</div>
                        <div className="text-xs text-gray-500">Professional Title</div>
                        <div className="text-xs text-gray-500">1h · 🌐</div>
                    </div>
                    <MoreHorizontal size={20} className="text-gray-400" />
                </div>
                <p className="mt-3 text-sm whitespace-pre-wrap">{content}</p>
                {hashtags.length > 0 && (
                    <div className="text-blue-600 text-sm mt-2">
                        {hashtags.slice(0, 5).join(' ')}
                    </div>
                )}
            </div>
            {media && (
                <div className="border-t">
                    {media.type === 'image' ? (
                        <img src={media.url} alt="" className="w-full" />
                    ) : (
                        <div className="relative aspect-video bg-black flex items-center justify-center">
                            <Play size={48} className="text-white" />
                        </div>
                    )}
                </div>
            )}
            <div className="p-2 text-xs text-gray-500 border-t flex items-center gap-1">
                <span className="flex -space-x-1">
                    <span className="w-4 h-4 rounded-full bg-blue-500 border border-white" />
                    <span className="w-4 h-4 rounded-full bg-green-500 border border-white" />
                    <span className="w-4 h-4 rounded-full bg-red-500 border border-white" />
                </span>
                <span>{engagement.likes} · {engagement.comments} comments</span>
            </div>
            <div className="flex border-t divide-x py-1">
                <button className="flex-1 py-2 text-gray-600 text-sm flex items-center justify-center gap-2 hover:bg-gray-50">
                    <ThumbsUp size={16} /> Like
                </button>
                <button className="flex-1 py-2 text-gray-600 text-sm flex items-center justify-center gap-2 hover:bg-gray-50">
                    <MessageCircle size={16} /> Comment
                </button>
                <button className="flex-1 py-2 text-gray-600 text-sm flex items-center justify-center gap-2 hover:bg-gray-50">
                    <Repeat2 size={16} /> Repost
                </button>
                <button className="flex-1 py-2 text-gray-600 text-sm flex items-center justify-center gap-2 hover:bg-gray-50">
                    <Send size={16} /> Send
                </button>
            </div>
        </div>
    );

    const renderTikTokPreview = () => (
        <div className="bg-black text-white relative aspect-[9/16] flex flex-col justify-end">
            {media && media.type === 'video' ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Play size={64} className="text-white/80" />
                </div>
            ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-black flex items-center justify-center">
                    <div className="text-center text-gray-400">
                        <Play size={48} className="mx-auto mb-2" />
                        <p className="text-sm">Video Preview</p>
                    </div>
                </div>
            )}

            {/* Right sidebar */}
            <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    {userName.charAt(0)}
                </div>
                <div className="text-center">
                    <Heart size={28} />
                    <span className="text-xs">{engagement.likes}</span>
                </div>
                <div className="text-center">
                    <MessageCircle size={28} />
                    <span className="text-xs">{engagement.comments}</span>
                </div>
                <div className="text-center">
                    <Bookmark size={28} />
                    <span className="text-xs">{engagement.shares}</span>
                </div>
                <div className="text-center">
                    <Share2 size={28} />
                    <span className="text-xs">Share</span>
                </div>
            </div>

            {/* Bottom content */}
            <div className="p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="font-bold text-sm">@{userName.toLowerCase().replace(/\s/g, '')}</div>
                <p className="text-sm mt-1 line-clamp-2">{content}</p>
                {hashtags.length > 0 && (
                    <div className="text-sm mt-1 opacity-80">
                        {hashtags.slice(0, 3).join(' ')}
                    </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs">🎵</span>
                    <span className="text-xs">Original Sound - {userName}</span>
                </div>
            </div>
        </div>
    );

    const renderPinterestPreview = () => (
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
            <div className="aspect-[2/3] bg-gray-200 relative">
                {media && media.type === 'image' ? (
                    <img src={media.url} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <Smartphone size={48} className="mx-auto mb-2" />
                            <p className="text-sm">Pin Preview</p>
                        </div>
                    </div>
                )}
                <button className="absolute top-2 right-2 bg-red-600 text-white px-4 py-2 rounded-full font-semibold text-sm">
                    Save
                </button>
            </div>
            <div className="p-4">
                <h3 className="font-bold text-lg line-clamp-2">{content.substring(0, 50)}</h3>
                <div className="flex items-center gap-2 mt-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <span className="text-sm font-medium">{userName}</span>
                </div>
            </div>
        </div>
    );

    const renderPreview = () => {
        switch (selectedPlatform) {
            case 'instagram':
                return renderInstagramPreview();
            case 'twitter':
                return renderTwitterPreview();
            case 'facebook':
                return renderFacebookPreview();
            case 'linkedin':
                return renderLinkedInPreview();
            case 'tiktok':
                return renderTikTokPreview();
            case 'pinterest':
                return renderPinterestPreview();
            case 'youtube':
                return renderTikTokPreview();
            case 'threads':
                return renderTwitterPreview();
            case 'telegram':
                return renderFacebookPreview();
            default:
                return renderInstagramPreview();
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-cyan-50 to-blue-50">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Smartphone className="text-cyan-600" size={20} />
                    Device Preview
                </h2>
                <p className="text-sm text-gray-500">See how your post will appear</p>
            </div>

            {/* Platform tabs */}
            <div className="flex overflow-x-auto border-b px-2 py-1 gap-1 bg-gray-50">
                {(post.platforms || ['instagram']).map((platformId) => {
                    const platform = PLATFORMS.find(p => p.id === platformId);
                    if (!platform) return null;

                    return (
                        <button
                            key={platformId}
                            onClick={() => setSelectedPlatform(platformId)}
                            className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap
                transition-all
                ${selectedPlatform === platformId
                                    ? 'text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }
              `}
                            style={{
                                backgroundColor: selectedPlatform === platformId ? platform.color : undefined
                            }}
                        >
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: selectedPlatform === platformId ? 'white' : platform.color }}
                            />
                            {platform.name}
                        </button>
                    );
                })}
            </div>

            {/* Phone mockup */}
            <div className="flex-1 p-4 bg-gray-100 overflow-auto flex items-start justify-center">
                <motion.div
                    key={selectedPlatform}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-[320px]"
                >
                    {/* Phone frame */}
                    <div className="bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
                        <div className="bg-black rounded-[2rem] overflow-hidden">
                            {/* Notch */}
                            <div className="bg-black h-6 flex items-center justify-center">
                                <div className="w-20 h-4 bg-black rounded-full" />
                            </div>

                            {/* Screen content */}
                            <div className="bg-white max-h-[500px] overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={selectedPlatform}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {renderPreview()}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Home indicator */}
                            <div className="bg-black h-6 flex items-center justify-center">
                                <div className="w-24 h-1 bg-gray-600 rounded-full" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Info footer */}
            <div className="p-3 border-t bg-gray-50 text-xs text-gray-500 text-center">
                Preview is approximate. Actual appearance may vary.
            </div>
        </div>
    );
};
