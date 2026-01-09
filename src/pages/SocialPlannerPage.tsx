import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  FolderOpen,
  Layout,
  BarChart3,
  Download,
  ChevronLeft,
  Save,
  Plus,
  Edit3,
  Smartphone,
  Menu
} from 'lucide-react';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { SocialPost, ContentCategory, PostTemplate, ContentLibraryItem, MediaItem } from '../types/social';
import {
  savePosts,
  loadPosts,
  saveCurrentPost,
  loadCurrentPost,
  clearCurrentPost,
  generateId,
  getUserTimezone,
  debounce
} from '../utils/socialUtils';
import { useToast } from '../utils/useToast';

// Import components
import { ContentCalendar } from '../components/social/ContentCalendar';
import { PostComposer } from '../components/social/PostComposer';
import { DevicePreview } from '../components/social/DevicePreview';
import { TemplatesPanel } from '../components/social/TemplatesPanel';
import { ContentLibrary } from '../components/social/ContentLibrary';
import { AnalyticsPanel } from '../components/social/AnalyticsPanel';

type BottomPanelTab = 'library' | 'templates' | 'analytics';
type MobilePanel = 'calendar' | 'composer' | 'preview';

export const SocialPlannerPage: React.FC = () => {
  const { addToast } = useToast();

  // Posts state
  const [posts, setPosts] = useState<SocialPost[]>(() => loadPosts());

  // Current post being edited
  const [currentPost, setCurrentPost] = useState<Partial<SocialPost>>(() => {
    const saved = loadCurrentPost();
    return saved || {
      content: '',
      platforms: [],
      media: [],
      hashtags: [],
      category: 'other' as ContentCategory,
      scheduledDate: new Date(),
      scheduledTime: '09:00',
      timezone: getUserTimezone(),
      status: 'draft'
    };
  });

  // UI state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [activeBottomTab, setActiveBottomTab] = useState<BottomPanelTab>('templates');
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('composer');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Auto-save functionality
  const autoSave = useMemo(
    () => debounce((post: Partial<SocialPost>) => {
      saveCurrentPost(post);
      setLastSaved(new Date());
    }, 5000),
    []
  );

  // Auto-save when current post changes
  useEffect(() => {
    if (currentPost.content || currentPost.platforms?.length) {
      autoSave(currentPost);
    }
  }, [currentPost, autoSave]);

  // Handle date selection from calendar
  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setCurrentPost(prev => ({
      ...prev,
      scheduledDate: date
    }));
  };

  // Handle post selection for editing
  const handleSelectPost = (post: SocialPost) => {
    setEditingPostId(post.id);
    setCurrentPost({
      ...post,
      scheduledDate: new Date(post.scheduledDate)
    });
    setMobilePanel('composer');
  };

  // Handle adding post on specific date
  const handleAddPostOnDate = (date: Date) => {
    setEditingPostId(null);
    setCurrentPost({
      content: '',
      platforms: [],
      media: [],
      hashtags: [],
      category: 'other' as ContentCategory,
      scheduledDate: date,
      scheduledTime: '09:00',
      timezone: getUserTimezone(),
      status: 'draft'
    });
    setMobilePanel('composer');
  };

  // Handle moving post to new date (drag-and-drop)
  const handleMovePost = (postId: string, newDate: Date) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          scheduledDate: newDate,
          updatedAt: new Date()
        };
      }
      return post;
    });
    setPosts(updatedPosts);
    savePosts(updatedPosts);
    addToast('Post rescheduled successfully!', 'success');
  };

  // Update current post
  const handleUpdatePost = (updatedPost: Partial<SocialPost>) => {
    setCurrentPost(updatedPost);
  };

  // Save as draft
  const handleSaveDraft = () => {
    const draftPost: SocialPost = {
      id: editingPostId || generateId(),
      content: currentPost.content || '',
      platforms: currentPost.platforms || [],
      media: currentPost.media || [],
      hashtags: currentPost.hashtags || [],
      category: currentPost.category || 'other',
      scheduledDate: currentPost.scheduledDate || new Date(),
      scheduledTime: currentPost.scheduledTime || '09:00',
      timezone: currentPost.timezone || getUserTimezone(),
      status: 'draft',
      createdAt: editingPostId ? posts.find(p => p.id === editingPostId)?.createdAt || new Date() : new Date(),
      updatedAt: new Date()
    };

    let updatedPosts: SocialPost[];
    if (editingPostId) {
      updatedPosts = posts.map(p => p.id === editingPostId ? draftPost : p);
    } else {
      updatedPosts = [...posts, draftPost];
    }

    setPosts(updatedPosts);
    savePosts(updatedPosts);
    clearCurrentPost();
    resetForm();
    addToast('Draft saved successfully!', 'success');
  };

  // Schedule post
  const handleSchedule = () => {
    if (!currentPost.content || !currentPost.platforms?.length) {
      addToast('Please add content and select at least one platform', 'error');
      return;
    }

    const scheduledPost: SocialPost = {
      id: editingPostId || generateId(),
      content: currentPost.content,
      platforms: currentPost.platforms,
      media: currentPost.media || [],
      hashtags: currentPost.hashtags || [],
      category: currentPost.category || 'other',
      scheduledDate: currentPost.scheduledDate || new Date(),
      scheduledTime: currentPost.scheduledTime || '09:00',
      timezone: currentPost.timezone || getUserTimezone(),
      status: 'scheduled',
      createdAt: editingPostId ? posts.find(p => p.id === editingPostId)?.createdAt || new Date() : new Date(),
      updatedAt: new Date()
    };

    let updatedPosts: SocialPost[];
    if (editingPostId) {
      updatedPosts = posts.map(p => p.id === editingPostId ? scheduledPost : p);
    } else {
      updatedPosts = [...posts, scheduledPost];
    }

    setPosts(updatedPosts);
    savePosts(updatedPosts);
    clearCurrentPost();
    resetForm();
    addToast('Post scheduled successfully!', 'success');
  };

  // Reset form
  const resetForm = () => {
    setEditingPostId(null);
    setCurrentPost({
      content: '',
      platforms: [],
      media: [],
      hashtags: [],
      category: 'other' as ContentCategory,
      scheduledDate: new Date(),
      scheduledTime: '09:00',
      timezone: getUserTimezone(),
      status: 'draft'
    });
  };

  // Apply template
  const handleSelectTemplate = (template: PostTemplate) => {
    setCurrentPost(prev => ({
      ...prev,
      content: template.content,
      hashtags: template.hashtags,
      category: template.category
    }));
    addToast(`Template "${template.title}" applied!`, 'success');
    setShowBottomPanel(false);
    setMobilePanel('composer');
  };

  // Select media from library
  const handleSelectMedia = (item: ContentLibraryItem) => {
    const mediaItem: MediaItem = {
      id: item.id,
      url: item.url,
      type: item.type,
      name: item.name,
      size: item.size
    };
    setCurrentPost(prev => ({
      ...prev,
      media: [...(prev.media || []), mediaItem]
    }));
    addToast('Media added to post!', 'success');
  };

  // Export calendar as PDF
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const calendarElement = document.getElementById('calendar-container');
      if (!calendarElement) return;

      const canvas = await html2canvas(calendarElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const pdf = new jsPDF('l', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`content-calendar-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      addToast('Calendar exported as PDF!', 'success');
    } catch (error) {
      console.error('Export error:', error);
      addToast('Failed to export calendar', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Export calendar as PNG
  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      const calendarElement = document.getElementById('calendar-container');
      if (!calendarElement) return;

      const canvas = await html2canvas(calendarElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `content-calendar-${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      addToast('Calendar exported as PNG!', 'success');
    } catch (error) {
      console.error('Export error:', error);
      addToast('Failed to export calendar', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const bottomPanelTabs = [
    { id: 'templates' as BottomPanelTab, label: 'Templates', icon: Layout },
    { id: 'library' as BottomPanelTab, label: 'Library', icon: FolderOpen },
    { id: 'analytics' as BottomPanelTab, label: 'Analytics', icon: BarChart3 }
  ];

  const mobilePanelTabs = [
    { id: 'calendar' as MobilePanel, label: 'Calendar', icon: Calendar },
    { id: 'composer' as MobilePanel, label: 'Compose', icon: Edit3 },
    { id: 'preview' as MobilePanel, label: 'Preview', icon: Smartphone }
  ];

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col overflow-hidden">
      {/* Header - Responsive */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 bg-white border-b">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
            <Calendar className="text-white" size={18} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
              Social Planner
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm hidden sm:block">
              {posts.length} posts • {posts.filter(p => p.status === 'draft').length} drafts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Auto-save indicator - desktop only */}
          {lastSaved && (
            <div className="text-xs text-gray-400 items-center gap-1 hidden lg:flex">
              <Save size={12} />
              Saved {format(lastSaved, 'HH:mm')}
            </div>
          )}

          {/* Export buttons - desktop only */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all"
            >
              <Download size={14} />
              PDF
            </button>
            <button
              onClick={handleExportPNG}
              disabled={isExporting}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all"
            >
              <Download size={14} />
              PNG
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={20} />
          </button>

          {/* New post button */}
          <motion.button
            onClick={() => {
              resetForm();
              setMobilePanel('composer');
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow text-sm sm:text-base"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Post</span>
          </motion.button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-b overflow-hidden"
          >
            <div className="p-3 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => { handleExportPDF(); setShowMobileMenu(false); }}
                  disabled={isExporting}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium"
                >
                  <Download size={14} />
                  Export PDF
                </button>
                <button
                  onClick={() => { handleExportPNG(); setShowMobileMenu(false); }}
                  disabled={isExporting}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium"
                >
                  <Download size={14} />
                  Export PNG
                </button>
              </div>
              <div className="text-xs text-gray-500 text-center">
                {posts.length} posts scheduled • {posts.filter(p => p.status === 'draft').length} drafts
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Panel Switcher - visible on mobile/tablet */}
      <div className="lg:hidden flex bg-gray-100 p-1 mx-3 mt-3 rounded-xl">
        {mobilePanelTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMobilePanel(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all
              ${mobilePanel === tab.id
                ? 'bg-white shadow-sm text-purple-600'
                : 'text-gray-600'
              }
            `}
          >
            <tab.icon size={16} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main content - Responsive layout */}
      <div className="flex-1 flex overflow-hidden mt-3 lg:mt-0">
        {/* Left Panel - Calendar */}
        <div
          id="calendar-container"
          className={`
            lg:w-[400px] lg:border-r lg:flex-shrink-0 overflow-hidden
            ${mobilePanel === 'calendar' ? 'flex-1' : 'hidden lg:block'}
          `}
        >
          <ContentCalendar
            posts={posts}
            onSelectDate={handleSelectDate}
            onSelectPost={handleSelectPost}
            onAddPost={handleAddPostOnDate}
            onMovePost={handleMovePost}
            selectedDate={selectedDate}
          />
        </div>

        {/* Center Panel - Post Composer */}
        <div
          className={`
            lg:flex-1 lg:min-w-0 overflow-hidden
            ${mobilePanel === 'composer' ? 'flex-1' : 'hidden lg:block'}
          `}
        >
          <PostComposer
            post={currentPost}
            onUpdate={handleUpdatePost}
            onSaveDraft={handleSaveDraft}
            onSchedule={handleSchedule}
            isEditing={!!editingPostId}
          />
        </div>

        {/* Right Panel - Device Preview */}
        <div
          className={`
            lg:w-[360px] lg:border-l lg:flex-shrink-0 overflow-hidden
            ${mobilePanel === 'preview' ? 'flex-1' : 'hidden lg:block'}
          `}
        >
          <DevicePreview
            post={currentPost}
            userName="Your Brand"
          />
        </div>
      </div>

      {/* Bottom Panel - Collapsible (responsive) */}
      <div className="border-t bg-white">
        {/* Bottom panel tabs */}
        <div className="flex items-center justify-between px-2 sm:px-4 py-2 bg-gray-50 border-b overflow-x-auto">
          <div className="flex gap-1">
            {bottomPanelTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveBottomTab(tab.id);
                  setShowBottomPanel(true);
                }}
                className={`
                  flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap
                  ${activeBottomTab === tab.id && showBottomPanel
                    ? 'bg-white shadow-sm text-purple-600'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <tab.icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowBottomPanel(!showBottomPanel)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <motion.div
              animate={{ rotate: showBottomPanel ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft size={18} className="rotate-90" />
            </motion.div>
          </button>
        </div>

        {/* Bottom panel content */}
        <AnimatePresence>
          {showBottomPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="h-[200px] sm:h-[280px] p-2 sm:p-4">
                {activeBottomTab === 'templates' && (
                  <div className="h-full overflow-hidden">
                    <TemplatesPanel onSelectTemplate={handleSelectTemplate} />
                  </div>
                )}
                {activeBottomTab === 'library' && (
                  <div className="h-full overflow-hidden">
                    <ContentLibrary onSelectMedia={handleSelectMedia} />
                  </div>
                )}
                {activeBottomTab === 'analytics' && (
                  <div className="h-full overflow-hidden">
                    <AnalyticsPanel posts={posts} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
