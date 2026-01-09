import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    Heart,
    MessageCircle,
    Share2,
    Eye,
    Target,
    Calendar,
    Award
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { SocialPost, PLATFORMS, CONTENT_CATEGORIES } from '../../types/social';
import { generateSimulatedAnalytics } from '../../utils/socialUtils';

interface AnalyticsPanelProps {
    posts: SocialPost[];
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ posts }) => {
    // Generate analytics data
    const analytics = useMemo(() => {
        const postsWithAnalytics = posts.map(post => ({
            ...post,
            analytics: post.analytics || generateSimulatedAnalytics(post)
        }));

        const totalImpressions = postsWithAnalytics.reduce((sum, p) => sum + (p.analytics?.impressions || 0), 0);
        const totalEngagements = postsWithAnalytics.reduce((sum, p) => sum + (p.analytics?.engagements || 0), 0);
        const totalLikes = postsWithAnalytics.reduce((sum, p) => sum + (p.analytics?.likes || 0), 0);
        const totalComments = postsWithAnalytics.reduce((sum, p) => sum + (p.analytics?.comments || 0), 0);
        const totalShares = postsWithAnalytics.reduce((sum, p) => sum + (p.analytics?.shares || 0), 0);

        // Posts by platform
        const platformCounts: Record<string, number> = {};
        posts.forEach(post => {
            post.platforms.forEach(p => {
                platformCounts[p] = (platformCounts[p] || 0) + 1;
            });
        });

        // Posts by category
        const categoryCounts: Record<string, number> = {};
        posts.forEach(post => {
            categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
        });

        // Weekly posting data (last 4 weeks simulation)
        const weeklyData = [
            { week: 'Week 1', posts: Math.floor(Math.random() * 10) + 5 },
            { week: 'Week 2', posts: Math.floor(Math.random() * 10) + 5 },
            { week: 'Week 3', posts: Math.floor(Math.random() * 10) + 5 },
            { week: 'Week 4', posts: posts.length }
        ];

        // Engagement rate
        const engagementRate = totalImpressions > 0
            ? ((totalEngagements / totalImpressions) * 100).toFixed(2)
            : '0.00';

        // Consistency score (based on regular posting)
        const consistencyScore = Math.min(100, (posts.length * 10) + Math.floor(Math.random() * 30));

        // Top performing posts
        const topPosts = [...postsWithAnalytics]
            .sort((a, b) => (b.analytics?.engagements || 0) - (a.analytics?.engagements || 0))
            .slice(0, 3);

        return {
            totalPosts: posts.length,
            totalImpressions,
            totalEngagements,
            totalLikes,
            totalComments,
            totalShares,
            platformCounts,
            categoryCounts,
            weeklyData,
            engagementRate,
            consistencyScore,
            topPosts
        };
    }, [posts]);

    // Chart data
    const platformChartData = Object.entries(analytics.platformCounts).map(([platform, count]) => ({
        name: PLATFORMS.find(p => p.id === platform)?.name || platform,
        value: count,
        color: PLATFORMS.find(p => p.id === platform)?.color || '#6B7280'
    }));

    const categoryChartData = Object.entries(analytics.categoryCounts).map(([cat, count]) => ({
        name: CONTENT_CATEGORIES.find(c => c.id === cat)?.name || cat,
        value: count,
        color: CONTENT_CATEGORIES.find(c => c.id === cat)?.color || '#6B7280'
    }));

    const StatCard = ({
        icon: Icon,
        label,
        value,
        color,
        trend
    }: {
        icon: any;
        label: string;
        value: string | number;
        color: string;
        trend?: number;
    }) => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 border shadow-sm"
        >
            <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon size={20} className="text-white" />
                </div>
                {trend !== undefined && (
                    <span className={`text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div className="mt-3">
                <div className="text-2xl font-bold text-gray-800">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
                <div className="text-sm text-gray-500">{label}</div>
            </div>
        </motion.div>
    );

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <BarChart3 className="text-indigo-600" size={20} />
                    Analytics Dashboard
                </h2>
                <p className="text-sm text-gray-500">Performance overview for your posts</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Stats grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard
                        icon={Calendar}
                        label="Total Posts"
                        value={analytics.totalPosts}
                        color="bg-blue-500"
                        trend={12}
                    />
                    <StatCard
                        icon={Eye}
                        label="Impressions"
                        value={analytics.totalImpressions}
                        color="bg-purple-500"
                        trend={8}
                    />
                    <StatCard
                        icon={Heart}
                        label="Engagements"
                        value={analytics.totalEngagements}
                        color="bg-pink-500"
                        trend={15}
                    />
                    <StatCard
                        icon={Target}
                        label="Engagement Rate"
                        value={`${analytics.engagementRate}%`}
                        color="bg-green-500"
                        trend={5}
                    />
                </div>

                {/* Consistency score */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Award className="text-amber-600" size={20} />
                            <span className="font-semibold text-gray-800">Posting Consistency</span>
                        </div>
                        <span className="text-2xl font-bold text-amber-600">{analytics.consistencyScore}%</span>
                    </div>
                    <div className="w-full bg-amber-200 rounded-full h-2">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${analytics.consistencyScore}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="bg-amber-500 h-2 rounded-full"
                        />
                    </div>
                    <p className="text-xs text-amber-700 mt-2">
                        {analytics.consistencyScore >= 80
                            ? 'Excellent! Keep up the great work!'
                            : analytics.consistencyScore >= 50
                                ? 'Good progress. Try to post more regularly.'
                                : 'Post more frequently to improve your score.'}
                    </p>
                </div>

                {/* Engagement breakdown */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <Heart className="mx-auto text-red-500 mb-1" size={24} />
                        <div className="text-xl font-bold">{analytics.totalLikes.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Likes</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <MessageCircle className="mx-auto text-blue-500 mb-1" size={24} />
                        <div className="text-xl font-bold">{analytics.totalComments.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Comments</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <Share2 className="mx-auto text-green-500 mb-1" size={24} />
                        <div className="text-xl font-bold">{analytics.totalShares.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Shares</div>
                    </div>
                </div>

                {/* Weekly posting chart */}
                <div className="border rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-indigo-500" />
                        Weekly Posting Activity
                    </h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Bar dataKey="posts" fill="#6366F1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Platform distribution */}
                {platformChartData.length > 0 && (
                    <div className="border rounded-xl p-4">
                        <h3 className="font-semibold text-gray-800 mb-4">Posts by Platform</h3>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={platformChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {platformChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                            {platformChartData.map((item) => (
                                <div key={item.name} className="flex items-center gap-1 text-xs">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span>{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Top performing posts */}
                {analytics.topPosts.length > 0 && (
                    <div className="border rounded-xl p-4">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Award size={18} className="text-yellow-500" />
                            Top Performing Posts
                        </h3>
                        <div className="space-y-3">
                            {analytics.topPosts.map((post, index) => (
                                <div key={post.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                    ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'}
                  `}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-800 line-clamp-1">{post.content}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Heart size={12} /> {post.analytics?.likes.toLocaleString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MessageCircle size={12} /> {post.analytics?.comments.toLocaleString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Eye size={12} /> {post.analytics?.impressions.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {posts.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <BarChart3 size={48} className="mx-auto mb-3 opacity-50" />
                        <p>No analytics data yet</p>
                        <p className="text-sm">Schedule some posts to see your performance metrics</p>
                    </div>
                )}
            </div>
        </div>
    );
};
