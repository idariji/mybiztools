import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Plus,
  Clock,
  Instagram,
  Twitter,
  Facebook,
  X,
  Edit3,
  Trash2,
  CheckCircle,
  FileText,
  TrendingUp,
  Linkedin,
  Youtube,
  Sparkles,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday } from 'date-fns';
import { SocialPost, ContentCategory, Platform, PLATFORMS, CONTENT_CATEGORIES } from '../types/social';
import { savePosts, loadPosts, generateId, getUserTimezone } from '../utils/socialUtils';
import { useToast } from '../utils/useToast';
import { ToastContainer } from '../components/ui/Toast';

// ── Platform icon map ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PLATFORM_ICONS: Record<string, React.ComponentType<any>> = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: ({ size = 16, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
    </svg>
  ),
};

function getPlatformIcon(id: string) {
  return PLATFORM_ICONS[id] || FileText;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function emptyPost(date?: Date): Partial<SocialPost> {
  return {
    content: '',
    platforms: [],
    media: [],
    hashtags: [],
    category: 'promo' as ContentCategory,
    scheduledDate: date || new Date(),
    scheduledTime: '09:00',
    timezone: getUserTimezone(),
    status: 'draft',
  };
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  scheduled: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
};

// ── Post Card ─────────────────────────────────────────────────────────────────

function PostCard({
  post,
  onEdit,
  onDelete,
}: {
  post: SocialPost;
  onEdit: (p: SocialPost) => void;
  onDelete: (id: string) => void;
}) {
  const date = new Date(post.scheduledDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-4 group"
    >
      <div className="flex items-start gap-3">
        {/* Date badge */}
        <div className="flex-shrink-0 w-12 text-center bg-purple-50 rounded-xl p-2">
          <p className="text-[10px] font-semibold text-purple-500 uppercase">{format(date, 'MMM')}</p>
          <p className="text-xl font-bold text-purple-700 leading-none">{format(date, 'd')}</p>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Platform icons */}
            <div className="flex gap-1">
              {post.platforms.slice(0, 3).map((pid) => {
                const pl = PLATFORMS.find((p) => p.id === pid);
                const Icon = getPlatformIcon(pid);
                return (
                  <span
                    key={pid}
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: pl?.color + '20', color: pl?.color }}
                  >
                    <Icon size={11} />
                  </span>
                );
              })}
              {post.platforms.length > 3 && (
                <span className="text-xs text-slate-400">+{post.platforms.length - 3}</span>
              )}
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[post.status] || STATUS_BADGE.draft}`}>
              {post.status}
            </span>
            <span className="text-xs text-slate-400 ml-auto">{post.scheduledTime}</span>
          </div>
          <p className="text-sm text-slate-700 line-clamp-2">{post.content || <span className="italic text-slate-400">No caption</span>}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(post)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Edit3 size={12} /> Edit
        </button>
        <button
          onClick={() => {
            if (window.confirm('Delete this post?')) onDelete(post.id);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </motion.div>
  );
}

// ── Mini Calendar ─────────────────────────────────────────────────────────────

function MiniCalendar({
  posts,
  onSelectDate,
  selectedDate,
}: {
  posts: SocialPost[];
  onSelectDate: (d: Date) => void;
  selectedDate: Date | null;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const postDates = new Set(
    posts.map((p) => format(new Date(p.scheduledDate), 'yyyy-MM-dd'))
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-4">
      {/* Month header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="font-semibold text-slate-800 text-sm">{format(currentMonth, 'MMMM yyyy')}</h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((d, i) => {
          const key = format(d, 'yyyy-MM-dd');
          const hasPost = postDates.has(key);
          const isSelected = selectedDate ? isSameDay(d, selectedDate) : false;
          const isCurrent = isToday(d);
          const inMonth = isSameMonth(d, currentMonth);

          return (
            <button
              key={i}
              onClick={() => onSelectDate(d)}
              className={`
                relative flex flex-col items-center justify-center h-9 w-full rounded-lg text-sm transition-all
                ${!inMonth ? 'opacity-25' : ''}
                ${isSelected ? 'bg-purple-600 text-white' : isCurrent ? 'bg-purple-50 text-purple-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}
              `}
            >
              <span className="text-xs font-medium">{format(d, 'd')}</span>
              {hasPost && (
                <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-purple-500'}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── New/Edit Post Modal ───────────────────────────────────────────────────────

function PostModal({
  initialPost,
  onSave,
  onClose,
}: {
  initialPost: Partial<SocialPost>;
  onSave: (post: Partial<SocialPost>, schedule: boolean) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<SocialPost>>(initialPost);

  const toggle = (id: Platform) => {
    const current = form.platforms || [];
    setForm((f) => ({
      ...f,
      platforms: current.includes(id) ? current.filter((p) => p !== id) : [...current, id],
    }));
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <motion.div
        className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <h2 className="font-bold text-slate-800">{form.id ? 'Edit Post' : 'New Post'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Platforms */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Platforms</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((pl) => {
                const selected = (form.platforms || []).includes(pl.id);
                const Icon = getPlatformIcon(pl.id);
                return (
                  <button
                    key={pl.id}
                    onClick={() => toggle(pl.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                      selected ? 'text-white' : 'text-slate-600 border-slate-200 bg-white'
                    }`}
                    style={{
                      backgroundColor: selected ? pl.color : undefined,
                      borderColor: selected ? pl.color : undefined,
                    }}
                  >
                    <Icon size={12} />
                    {pl.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Caption</label>
            <textarea
              value={form.content || ''}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={5}
              placeholder="Write your post caption here... Use emojis, hashtags, and a clear call to action!"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl resize-none text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
            />
            <p className="text-xs text-slate-400 mt-1">{(form.content || '').length} characters</p>
          </div>

          {/* Content type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Content Type</label>
            <select
              value={form.category || 'promotion'}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ContentCategory }))}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all bg-white"
            >
              {CONTENT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Clock size={14} /> Schedule Date & Time
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={form.scheduledDate ? format(new Date(form.scheduledDate), 'yyyy-MM-dd') : ''}
                onChange={(e) => setForm((f) => ({ ...f, scheduledDate: new Date(e.target.value) }))}
                className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
              />
              <input
                type="time"
                value={form.scheduledTime || '09:00'}
                onChange={(e) => setForm((f) => ({ ...f, scheduledTime: e.target.value }))}
                className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-slate-100 bg-slate-50">
          <button
            onClick={() => onSave(form, false)}
            className="flex-1 py-3 border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-white transition-colors"
          >
            Save as Draft
          </button>
          <button
            onClick={() => onSave(form, true)}
            disabled={!form.content || !form.platforms?.length}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-purple-500/25"
          >
            Schedule Post
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export const SocialPlannerPage: React.FC = () => {
  const { toasts, addToast, removeToast } = useToast();
  const [posts, setPosts] = useState<SocialPost[]>(() => loadPosts());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<SocialPost> | null>(null);

  const stats = useMemo(() => ({
    total: posts.length,
    scheduled: posts.filter((p) => p.status === 'scheduled').length,
    drafts: posts.filter((p) => p.status === 'draft').length,
    published: posts.filter((p) => p.status === 'published').length,
  }), [posts]);

  // Posts to show in right panel: filtered by date if selected, else upcoming
  const displayPosts = useMemo(() => {
    if (selectedDate) {
      return posts
        .filter((p) => isSameDay(new Date(p.scheduledDate), selectedDate))
        .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    }
    return posts
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
      .slice(0, 10);
  }, [posts, selectedDate]);

  const openNewPost = (date?: Date) => {
    setEditingPost(emptyPost(date || selectedDate || new Date()));
    setShowModal(true);
  };

  const openEditPost = (post: SocialPost) => {
    setEditingPost({ ...post, scheduledDate: new Date(post.scheduledDate) });
    setShowModal(true);
  };

  const handleSave = (form: Partial<SocialPost>, schedule: boolean) => {
    const isEdit = !!(form as any).id;
    const saved: SocialPost = {
      id: (form as any).id || generateId(),
      content: form.content || '',
      platforms: form.platforms || [],
      media: form.media || [],
      hashtags: form.hashtags || [],
      category: form.category || 'promo',
      scheduledDate: form.scheduledDate || new Date(),
      scheduledTime: form.scheduledTime || '09:00',
      timezone: form.timezone || getUserTimezone(),
      status: schedule ? 'scheduled' : 'draft',
      createdAt: isEdit ? (editingPost as any)?.createdAt || new Date() : new Date(),
      updatedAt: new Date(),
    };

    const updated = isEdit
      ? posts.map((p) => (p.id === saved.id ? saved : p))
      : [...posts, saved];

    setPosts(updated);
    savePosts(updated);
    setShowModal(false);
    setEditingPost(null);
    addToast(schedule ? 'Post scheduled!' : 'Draft saved!', 'success');
  };

  const handleDelete = (id: string) => {
    const updated = posts.filter((p) => p.id !== id);
    setPosts(updated);
    savePosts(updated);
    addToast('Post deleted', 'success');
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="space-y-4 sm:space-y-6">

          {/* ── Header ── */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Social Planner</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Plan and organise your social media content calendar
              </p>
            </div>
            <button
              onClick={() => openNewPost()}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-sm shadow-md shadow-purple-500/25 hover:from-purple-700 hover:to-pink-700 transition-all active:scale-95 flex-shrink-0"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New Post</span>
            </button>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Posts', value: stats.total, color: 'bg-purple-50 text-purple-700', icon: FileText },
              { label: 'Scheduled', value: stats.scheduled, color: 'bg-blue-50 text-blue-700', icon: Clock },
              { label: 'Drafts', value: stats.drafts, color: 'bg-slate-100 text-slate-600', icon: Edit3 },
              { label: 'Published', value: stats.published, color: 'bg-green-50 text-green-700', icon: CheckCircle },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                <div className={`inline-flex p-2 rounded-xl ${s.color} mb-2`}>
                  <s.icon size={16} />
                </div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Explainer banner (if no posts) ── */}
          {posts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-5 flex items-start gap-4"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Welcome to your Social Content Planner</h3>
                <p className="text-sm text-slate-600">
                  Plan what to post on Instagram, Facebook, Twitter, TikTok and more — all in one place.
                  Create posts, pick a date/time, and track your content calendar.
                  <br />
                  <span className="text-purple-600 font-medium">Note: this tool helps you plan your posts. You still publish them manually on each platform.</span>
                </p>
                <button
                  onClick={() => openNewPost()}
                  className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-purple-700 hover:text-purple-800"
                >
                  <Plus size={14} /> Create your first post
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Main: Calendar + Posts ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">

            {/* Calendar — 3 cols */}
            <div className="lg:col-span-3 space-y-3">
              <MiniCalendar
                posts={posts}
                selectedDate={selectedDate}
                onSelectDate={(d) => setSelectedDate(isSameDay(d, selectedDate || new Date('invalid')) ? null : d)}
              />

              {/* Selected date actions */}
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{format(selectedDate, 'EEEE, d MMMM yyyy')}</p>
                    <p className="text-xs text-slate-500">
                      {displayPosts.length} post{displayPosts.length !== 1 ? 's' : ''} planned
                    </p>
                  </div>
                  <button
                    onClick={() => openNewPost(selectedDate)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus size={13} /> Add Post
                  </button>
                </motion.div>
              )}
            </div>

            {/* Posts list — 2 cols */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-slate-800">
                  {selectedDate ? `Posts on ${format(selectedDate, 'd MMM')}` : 'All Posts'}
                </h2>
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Show all
                  </button>
                )}
              </div>

              {displayPosts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                  <Calendar size={32} className="mx-auto mb-3 text-slate-300" />
                  <p className="font-medium text-slate-500 text-sm">
                    {selectedDate ? 'No posts on this day' : 'No posts yet'}
                  </p>
                  <button
                    onClick={() => openNewPost(selectedDate || undefined)}
                    className="mt-3 text-sm font-semibold text-purple-600 hover:text-purple-700"
                  >
                    + Create a post
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {displayPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onEdit={openEditPost}
                        onDelete={handleDelete}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* New / Edit Post Modal */}
      <AnimatePresence>
        {showModal && editingPost && (
          <PostModal
            initialPost={editingPost}
            onSave={handleSave}
            onClose={() => { setShowModal(false); setEditingPost(null); }}
          />
        )}
      </AnimatePresence>
    </>
  );
};
