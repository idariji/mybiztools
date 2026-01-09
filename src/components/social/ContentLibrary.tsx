import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FolderOpen,
    Upload,
    Image,
    Video,
    Search,
    Tag,
    X,
    Plus,
    Grid,
    List,
    Filter
} from 'lucide-react';
import { ContentLibraryItem } from '../../types/social';
import {
    loadLibrary,
    saveLibrary,
    fileToBase64,
    generateId,
    formatFileSize
} from '../../utils/socialUtils';

interface ContentLibraryProps {
    onSelectMedia: (item: ContentLibraryItem) => void;
}

export const ContentLibrary: React.FC<ContentLibraryProps> = ({ onSelectMedia }) => {
    const [items, setItems] = useState<ContentLibraryItem[]>(() => loadLibrary());
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFolder, setSelectedFolder] = useState<string>('all');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [dragActive, setDragActive] = useState(false);
    const [showTagInput, setShowTagInput] = useState<string | null>(null);
    const [newTag, setNewTag] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get unique folders and tags
    const folders = ['all', ...new Set(items.map(i => i.folder).filter(Boolean))];
    const allTags = [...new Set(items.flatMap(i => i.tags))];

    // Filter items
    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFolder = selectedFolder === 'all' || item.folder === selectedFolder;
        const matchesTags = selectedTags.length === 0 || selectedTags.some(t => item.tags.includes(t));
        return matchesSearch && matchesFolder && matchesTags;
    });

    // Handle file upload
    const handleFileUpload = async (files: FileList | null) => {
        if (!files) return;

        const newItems: ContentLibraryItem[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');

            if (!isImage && !isVideo) continue;

            try {
                const base64 = await fileToBase64(file);
                newItems.push({
                    id: generateId(),
                    url: base64,
                    type: isImage ? 'image' : 'video',
                    name: file.name,
                    size: file.size,
                    folder: selectedFolder === 'all' ? '' : selectedFolder,
                    tags: [],
                    createdAt: new Date(),
                    usedCount: 0
                });
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }

        const updatedItems = [...items, ...newItems];
        setItems(updatedItems);
        saveLibrary(updatedItems);
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

    // Delete item
    const deleteItem = (id: string) => {
        const updatedItems = items.filter(i => i.id !== id);
        setItems(updatedItems);
        saveLibrary(updatedItems);
    };

    // Add tag to item
    const addTagToItem = (itemId: string, tag: string) => {
        if (!tag.trim()) return;

        const updatedItems = items.map(item => {
            if (item.id === itemId && !item.tags.includes(tag)) {
                return { ...item, tags: [...item.tags, tag] };
            }
            return item;
        });
        setItems(updatedItems);
        saveLibrary(updatedItems);
        setNewTag('');
        setShowTagInput(null);
    };

    // Remove tag from item
    const removeTagFromItem = (itemId: string, tag: string) => {
        const updatedItems = items.map(item => {
            if (item.id === itemId) {
                return { ...item, tags: item.tags.filter(t => t !== tag) };
            }
            return item;
        });
        setItems(updatedItems);
        saveLibrary(updatedItems);
    };

    // Create folder
    const createFolder = () => {
        const folderName = prompt('Enter folder name:');
        if (folderName && !folders.includes(folderName)) {
            setSelectedFolder(folderName);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-green-50 to-teal-50">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FolderOpen className="text-green-600" size={20} />
                    Content Library
                </h2>
                <p className="text-sm text-gray-500">{items.length} items</p>
            </div>

            {/* Toolbar */}
            <div className="p-3 border-b space-y-2">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search media..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                    />
                </div>

                {/* Filters row */}
                <div className="flex items-center gap-2">
                    {/* Folder filter */}
                    <select
                        value={selectedFolder}
                        onChange={(e) => setSelectedFolder(e.target.value)}
                        className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                    >
                        {folders.map(folder => (
                            <option key={folder} value={folder}>
                                {folder === 'all' ? 'All Folders' : folder}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={createFolder}
                        className="p-1.5 hover:bg-gray-100 rounded-lg"
                        title="Create folder"
                    >
                        <Plus size={16} className="text-gray-500" />
                    </button>

                    <div className="flex-1" />

                    {/* View toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-0.5">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Grid size={16} className={viewMode === 'grid' ? 'text-green-600' : 'text-gray-400'} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <List size={16} className={viewMode === 'list' ? 'text-green-600' : 'text-gray-400'} />
                        </button>
                    </div>
                </div>

                {/* Tag filter */}
                {allTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {allTags.slice(0, 10).map(tag => (
                            <button
                                key={tag}
                                onClick={() => {
                                    setSelectedTags(prev =>
                                        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                                    );
                                }}
                                className={`
                  px-2 py-0.5 rounded-full text-xs font-medium transition-colors
                  ${selectedTags.includes(tag)
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }
                `}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-3">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                />

                {/* Upload zone */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
            border-2 border-dashed rounded-xl p-6 text-center cursor-pointer mb-4 transition-colors
            ${dragActive ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}
          `}
                >
                    <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                    <p className="text-sm text-gray-600">
                        Drop files here or <span className="text-green-600 font-medium">browse</span>
                    </p>
                </div>

                {/* Items grid/list */}
                {filteredItems.length > 0 ? (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-2' : 'space-y-2'}>
                        {filteredItems.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`
                  group relative rounded-lg overflow-hidden border hover:shadow-md transition-shadow cursor-pointer
                  ${viewMode === 'list' ? 'flex items-center gap-3 p-2' : ''}
                `}
                                onClick={() => onSelectMedia(item)}
                            >
                                {/* Thumbnail */}
                                <div className={viewMode === 'grid' ? 'aspect-square' : 'w-16 h-16 flex-shrink-0'}>
                                    {item.type === 'image' ? (
                                        <img
                                            src={item.url}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                            <Video className="text-white" size={viewMode === 'grid' ? 32 : 20} />
                                        </div>
                                    )}
                                </div>

                                {/* Info overlay (grid) */}
                                {viewMode === 'grid' && (
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                                        <p className="text-white text-xs truncate">{item.name}</p>
                                        <p className="text-white/70 text-xs">{formatFileSize(item.size)}</p>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {item.tags.slice(0, 2).map(tag => (
                                                <span key={tag} className="text-[10px] bg-white/20 px-1 rounded text-white">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Delete button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteItem(item.id);
                                            }}
                                            className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}

                                {/* Info (list view) */}
                                {viewMode === 'list' && (
                                    <>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
                                            <div className="flex gap-1 mt-1">
                                                {item.tags.map(tag => (
                                                    <span key={tag} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowTagInput(item.id);
                                                    }}
                                                    className="text-[10px] text-green-600 hover:underline"
                                                >
                                                    + tag
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteItem(item.id);
                                            }}
                                            className="p-1 text-gray-400 hover:text-red-500"
                                        >
                                            <X size={16} />
                                        </button>
                                    </>
                                )}

                                {/* Tag input popover */}
                                <AnimatePresence>
                                    {showTagInput === item.id && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute bottom-full left-0 mb-1 bg-white border rounded-lg shadow-lg p-2 z-10"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="flex gap-1">
                                                <input
                                                    type="text"
                                                    value={newTag}
                                                    onChange={(e) => setNewTag(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') addTagToItem(item.id, newTag);
                                                        if (e.key === 'Escape') setShowTagInput(null);
                                                    }}
                                                    placeholder="Add tag..."
                                                    className="px-2 py-1 border rounded text-xs w-24"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => addTagToItem(item.id, newTag)}
                                                    className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <Image size={48} className="mx-auto mb-3 opacity-50" />
                        <p>No media files yet</p>
                        <p className="text-sm">Upload some images or videos to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
};
