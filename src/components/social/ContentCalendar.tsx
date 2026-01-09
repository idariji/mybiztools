import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Calendar as CalendarIcon,
    Grid3X3,
    List,
    LayoutGrid
} from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths,
    addWeeks,
    subWeeks,
    isSameMonth,
    isSameDay,
    isToday
} from 'date-fns';
import { SocialPost, PLATFORMS, Platform } from '../../types/social';
import { getPostsForDate } from '../../utils/socialUtils';

interface ContentCalendarProps {
    posts: SocialPost[];
    onSelectDate: (date: Date) => void;
    onSelectPost: (post: SocialPost) => void;
    onAddPost: (date: Date) => void;
    onMovePost: (postId: string, newDate: Date) => void;
    selectedDate: Date | null;
}

type ViewMode = 'month' | 'week' | 'day';

export const ContentCalendar: React.FC<ContentCalendarProps> = ({
    posts,
    onSelectDate,
    onSelectPost,
    onAddPost,
    onMovePost,
    selectedDate
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [draggedPost, setDraggedPost] = useState<string | null>(null);
    const [hoveredPost, setHoveredPost] = useState<SocialPost | null>(null);
    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

    // Navigation handlers
    const navigatePrevious = () => {
        if (viewMode === 'month') {
            setCurrentDate(subMonths(currentDate, 1));
        } else if (viewMode === 'week') {
            setCurrentDate(subWeeks(currentDate, 1));
        } else {
            setCurrentDate(addDays(currentDate, -1));
        }
    };

    const navigateNext = () => {
        if (viewMode === 'month') {
            setCurrentDate(addMonths(currentDate, 1));
        } else if (viewMode === 'week') {
            setCurrentDate(addWeeks(currentDate, 1));
        } else {
            setCurrentDate(addDays(currentDate, 1));
        }
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Drag and drop handlers
    const handleDragStart = (e: React.DragEvent, postId: string) => {
        setDraggedPost(postId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', postId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, date: Date) => {
        e.preventDefault();
        const postId = e.dataTransfer.getData('text/plain');
        if (postId) {
            onMovePost(postId, date);
        }
        setDraggedPost(null);
    };

    const handleDragEnd = () => {
        setDraggedPost(null);
    };

    // Hover tooltip
    const handlePostHover = (e: React.MouseEvent, post: SocialPost) => {
        setHoveredPost(post);
        setHoverPosition({ x: e.clientX, y: e.clientY });
    };

    const handlePostLeave = () => {
        setHoveredPost(null);
    };

    // Render month view
    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows: JSX.Element[] = [];
        let days: JSX.Element[] = [];
        let day = startDate;

        // Week day headers
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const currentDay = day;
                const dayPosts = getPostsForDate(posts, currentDay);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);

                days.push(
                    <motion.div
                        key={day.toISOString()}
                        className={`
              min-h-[100px] border border-gray-100 p-1 cursor-pointer transition-all
              ${!isCurrentMonth ? 'bg-gray-50 opacity-50' : 'bg-white hover:bg-gray-50'}
              ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}
              ${isTodayDate ? 'bg-blue-50' : ''}
              ${draggedPost ? 'hover:bg-blue-100' : ''}
            `}
                        onClick={() => onSelectDate(currentDay)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, currentDay)}
                        whileHover={{ scale: 1.01 }}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className={`
                text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full
                ${isTodayDate ? 'bg-blue-600 text-white' : 'text-gray-700'}
              `}>
                                {format(day, 'd')}
                            </span>
                            {isCurrentMonth && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddPost(currentDay);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded transition-opacity"
                                >
                                    <Plus size={14} className="text-gray-500" />
                                </button>
                            )}
                        </div>
                        <div className="space-y-0.5 overflow-hidden max-h-[70px]">
                            {dayPosts.slice(0, 3).map((post) => (
                                <motion.div
                                    key={post.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e as any, post.id)}
                                    onDragEnd={handleDragEnd}
                                    onMouseEnter={(e) => handlePostHover(e, post)}
                                    onMouseLeave={handlePostLeave}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectPost(post);
                                    }}
                                    className={`
                    text-xs p-1 rounded truncate cursor-move
                    ${draggedPost === post.id ? 'opacity-50' : ''}
                  `}
                                    style={{
                                        backgroundColor: PLATFORMS.find(p => p.id === post.platforms[0])?.color + '20',
                                        borderLeft: `3px solid ${PLATFORMS.find(p => p.id === post.platforms[0])?.color}`
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="flex items-center gap-1">
                                        <div className="flex -space-x-1">
                                            {post.platforms.slice(0, 2).map((p) => (
                                                <div
                                                    key={p}
                                                    className="w-3 h-3 rounded-full border border-white"
                                                    style={{ backgroundColor: PLATFORMS.find(pl => pl.id === p)?.color }}
                                                />
                                            ))}
                                            {post.platforms.length > 2 && (
                                                <span className="text-[10px] text-gray-500">+{post.platforms.length - 2}</span>
                                            )}
                                        </div>
                                        <span className="truncate text-gray-700">{post.content.substring(0, 20)}</span>
                                    </div>
                                </motion.div>
                            ))}
                            {dayPosts.length > 3 && (
                                <div className="text-xs text-gray-500 pl-1">
                                    +{dayPosts.length - 3} more
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day.toISOString()} className="grid grid-cols-7 group">
                    {days}
                </div>
            );
            days = [];
        }

        return (
            <div className="flex flex-col h-full">
                <div className="grid grid-cols-7 bg-gray-50 border-b">
                    {weekDays.map((day) => (
                        <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="flex-1 overflow-auto">
                    {rows}
                </div>
            </div>
        );
    };

    // Render week view
    const renderWeekView = () => {
        const weekStart = startOfWeek(currentDate);
        const days: JSX.Element[] = [];

        for (let i = 0; i < 7; i++) {
            const day = addDays(weekStart, i);
            const dayPosts = getPostsForDate(posts, day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);

            days.push(
                <motion.div
                    key={day.toISOString()}
                    className={`
            flex-1 min-h-[400px] border-r last:border-r-0 p-2 cursor-pointer
            ${isSelected ? 'bg-blue-50' : 'bg-white'}
            ${isTodayDate ? 'bg-blue-50/50' : ''}
          `}
                    onClick={() => onSelectDate(day)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day)}
                >
                    <div className="text-center mb-3">
                        <div className="text-xs text-gray-500 uppercase">
                            {format(day, 'EEE')}
                        </div>
                        <div className={`
              text-lg font-semibold mt-1 w-8 h-8 mx-auto flex items-center justify-center rounded-full
              ${isTodayDate ? 'bg-blue-600 text-white' : 'text-gray-800'}
            `}>
                            {format(day, 'd')}
                        </div>
                    </div>
                    <div className="space-y-2">
                        {dayPosts.map((post) => (
                            <motion.div
                                key={post.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e as any, post.id)}
                                onDragEnd={handleDragEnd}
                                onMouseEnter={(e) => handlePostHover(e, post)}
                                onMouseLeave={handlePostLeave}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectPost(post);
                                }}
                                className={`
                  p-2 rounded-lg cursor-move text-sm
                  ${draggedPost === post.id ? 'opacity-50' : ''}
                `}
                                style={{
                                    backgroundColor: PLATFORMS.find(p => p.id === post.platforms[0])?.color + '15',
                                    borderLeft: `4px solid ${PLATFORMS.find(p => p.id === post.platforms[0])?.color}`
                                }}
                                whileHover={{ scale: 1.02, x: 2 }}
                            >
                                <div className="flex gap-1 mb-1">
                                    {post.platforms.map((p) => (
                                        <div
                                            key={p}
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: PLATFORMS.find(pl => pl.id === p)?.color }}
                                        />
                                    ))}
                                </div>
                                <div className="text-gray-800 line-clamp-2">{post.content}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {post.scheduledTime}
                                </div>
                            </motion.div>
                        ))}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddPost(day);
                            }}
                            className="w-full p-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-1"
                        >
                            <Plus size={16} />
                            <span className="text-sm">Add</span>
                        </button>
                    </div>
                </motion.div>
            );
        }

        return (
            <div className="flex h-full border-t">
                {days}
            </div>
        );
    };

    // Render day view
    const renderDayView = () => {
        const dayPosts = getPostsForDate(posts, currentDate);
        const hours = Array.from({ length: 24 }, (_, i) => i);

        return (
            <div className="flex-1 overflow-auto border-t">
                <div className="relative">
                    {hours.map((hour) => {
                        const hourPosts = dayPosts.filter(post => {
                            const postHour = parseInt(post.scheduledTime?.split(':')[0] || '0');
                            return postHour === hour;
                        });

                        return (
                            <div
                                key={hour}
                                className="flex border-b min-h-[60px]"
                                onDragOver={handleDragOver}
                                onDrop={(e) => {
                                    const newDate = new Date(currentDate);
                                    newDate.setHours(hour, 0, 0, 0);
                                    handleDrop(e, newDate);
                                }}
                            >
                                <div className="w-16 py-2 pr-2 text-right text-sm text-gray-500 border-r bg-gray-50">
                                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                                </div>
                                <div className="flex-1 p-1 relative">
                                    {hourPosts.map((post) => (
                                        <motion.div
                                            key={post.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e as any, post.id)}
                                            onDragEnd={handleDragEnd}
                                            onClick={() => onSelectPost(post)}
                                            className={`
                        p-2 rounded-lg mb-1 cursor-move
                        ${draggedPost === post.id ? 'opacity-50' : ''}
                      `}
                                            style={{
                                                backgroundColor: PLATFORMS.find(p => p.id === post.platforms[0])?.color + '20',
                                                borderLeft: `4px solid ${PLATFORMS.find(p => p.id === post.platforms[0])?.color}`
                                            }}
                                            whileHover={{ scale: 1.01 }}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                {post.platforms.map((p) => {
                                                    const platform = PLATFORMS.find(pl => pl.id === p);
                                                    return (
                                                        <span
                                                            key={p}
                                                            className="text-xs px-2 py-0.5 rounded-full text-white"
                                                            style={{ backgroundColor: platform?.color }}
                                                        >
                                                            {platform?.name}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                            <div className="text-sm text-gray-800">{post.content}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-3">
                    <CalendarIcon className="text-blue-600" size={24} />
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            {viewMode === 'day'
                                ? format(currentDate, 'EEEE, MMMM d, yyyy')
                                : format(currentDate, 'MMMM yyyy')
                            }
                        </h2>
                        <p className="text-sm text-gray-500">{posts.length} scheduled posts</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* View mode toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('month')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'month' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Month view"
                        >
                            <Grid3X3 size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'week' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Week view"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('day')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'day' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Day view"
                        >
                            <List size={18} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <button
                        onClick={goToToday}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={navigatePrevious}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={navigateNext}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Calendar content */}
            <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${viewMode}-${currentDate.toISOString()}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {viewMode === 'month' && renderMonthView()}
                        {viewMode === 'week' && renderWeekView()}
                        {viewMode === 'day' && renderDayView()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Hover tooltip */}
            <AnimatePresence>
                {hoveredPost && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="fixed z-50 bg-white rounded-lg shadow-xl border p-3 max-w-xs"
                        style={{
                            left: Math.min(hoverPosition.x + 10, window.innerWidth - 300),
                            top: Math.min(hoverPosition.y + 10, window.innerHeight - 200)
                        }}
                    >
                        <div className="flex gap-1 mb-2">
                            {hoveredPost.platforms.map((p) => {
                                const platform = PLATFORMS.find(pl => pl.id === p);
                                return (
                                    <span
                                        key={p}
                                        className="text-xs px-2 py-0.5 rounded-full text-white"
                                        style={{ backgroundColor: platform?.color }}
                                    >
                                        {platform?.name}
                                    </span>
                                );
                            })}
                        </div>
                        <p className="text-sm text-gray-800 mb-2 line-clamp-3">{hoveredPost.content}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{format(new Date(hoveredPost.scheduledDate), 'MMM d')}</span>
                            <span>•</span>
                            <span>{hoveredPost.scheduledTime}</span>
                            <span>•</span>
                            <span className={`px-1.5 py-0.5 rounded ${hoveredPost.status === 'scheduled' ? 'bg-green-100 text-green-700' :
                                    hoveredPost.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-blue-100 text-blue-700'
                                }`}>
                                {hoveredPost.status}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
