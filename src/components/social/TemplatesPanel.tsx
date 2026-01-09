import React from 'react';
import { motion } from 'framer-motion';
import { Layout, Check, Sparkles } from 'lucide-react';
import { PostTemplate, DEFAULT_TEMPLATES, CONTENT_CATEGORIES } from '../../types/social';

interface TemplatesPanelProps {
    onSelectTemplate: (template: PostTemplate) => void;
    selectedCategory?: string;
}

export const TemplatesPanel: React.FC<TemplatesPanelProps> = ({
    onSelectTemplate,
    selectedCategory
}) => {
    const [filter, setFilter] = React.useState<string>('all');

    const filteredTemplates = filter === 'all'
        ? DEFAULT_TEMPLATES
        : DEFAULT_TEMPLATES.filter(t => t.category === filter);

    const getCategoryInfo = (categoryId: string) => {
        return CONTENT_CATEGORIES.find(c => c.id === categoryId);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-amber-50 to-orange-50">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Layout className="text-amber-600" size={20} />
                    Templates
                </h2>
                <p className="text-sm text-gray-500">Quick-start with pre-made content</p>
            </div>

            {/* Filter tabs */}
            <div className="flex overflow-x-auto border-b px-2 py-2 gap-1 bg-gray-50">
                <button
                    onClick={() => setFilter('all')}
                    className={`
            px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap
            ${filter === 'all' ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-100'}
          `}
                >
                    All
                </button>
                {CONTENT_CATEGORIES.slice(0, 5).map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setFilter(cat.id)}
                        className={`
              px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap
              ${filter === cat.id ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}
            `}
                        style={{
                            backgroundColor: filter === cat.id ? cat.color : undefined
                        }}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Templates grid */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="grid gap-3">
                    {filteredTemplates.map((template, index) => {
                        const categoryInfo = getCategoryInfo(template.category);

                        return (
                            <motion.div
                                key={template.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => onSelectTemplate(template)}
                                className="border rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-amber-200 transition-all group"
                            >
                                <div className="flex items-start gap-3">
                                    {/* Thumbnail emoji */}
                                    <div
                                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                                        style={{ backgroundColor: categoryInfo?.color + '20' }}
                                    >
                                        {template.thumbnail}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-800">{template.title}</h3>
                                            {template.platform !== 'all' && (
                                                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                                                    {template.platform}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mb-2">{template.description}</p>

                                        {/* Preview text */}
                                        <p className="text-xs text-gray-400 line-clamp-2 bg-gray-50 p-2 rounded">
                                            {template.content.substring(0, 80)}...
                                        </p>

                                        {/* Hashtags preview */}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {template.hashtags.slice(0, 3).map((tag) => (
                                                <span key={tag} className="text-xs text-blue-600">
                                                    {tag}
                                                </span>
                                            ))}
                                            {template.hashtags.length > 3 && (
                                                <span className="text-xs text-gray-400">
                                                    +{template.hashtags.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Use button */}
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="opacity-0 group-hover:opacity-100 p-2 bg-amber-500 text-white rounded-lg transition-opacity"
                                    >
                                        <Check size={16} />
                                    </motion.button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Empty state */}
                {filteredTemplates.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <Sparkles size={48} className="mx-auto mb-3 opacity-50" />
                        <p>No templates in this category</p>
                    </div>
                )}
            </div>
        </div>
    );
};
