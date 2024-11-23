import React, { useState, useEffect } from 'react';
import { X, Plus, ArrowLeft } from 'lucide-react';
import { Priority, Category } from '../types';
import * as db from '../db';

interface TaskModalProps {
  mode: 'add' | 'edit';
  initialData?: Task;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'status'>) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  mode,
  initialData,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [priority, setPriority] = useState<Priority>(initialData?.priority || 'Medium');
  const [category, setCategory] = useState<Category>(initialData?.category || 'Other');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      const dbCategories = await db.getCategories();
      setCategories(dbCategories.filter(cat => !['BotWaba', 'Digital Product', 'WhatsAuto', 'ChatFlow Crm', 'Meta Ads', 'Other'].includes(cat)));
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showCustomCategory && customCategory) {
      await db.addCategory(customCategory);
      setCategories(prev => [...prev, customCategory]);
    }
    onSubmit({
      title,
      priority,
      category: showCustomCategory ? customCategory : category,
      dueDate,
      description
    });
  };

  const handleDeleteCategory = async (categoryToDelete: string) => {
    await db.deleteCategory(categoryToDelete);
    setCategories(prev => prev.filter(cat => cat !== categoryToDelete));
    if (category === categoryToDelete) {
      setCategory('Other');
    }
  };

  const defaultCategories = ['BotWaba', 'Digital Product', 'WhatsAuto', 'ChatFlow Crm', 'Meta Ads', 'Other'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {mode === 'add' ? 'Add New Task' : 'Edit Task'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500/20 outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500/20 outline-none min-h-[100px] resize-y"
                placeholder="Add a detailed description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500/20 outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <div className="space-y-2">
                  {showCustomCategory ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCustomCategory(false)}
                        className="p-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="flex-1 border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500/20 outline-none"
                        placeholder="Enter custom category"
                        required
                      />
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="flex-1 border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      >
                        {defaultCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowCustomCategory(true)}
                        className="p-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {categories.length > 0 && !showCustomCategory && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {cat}
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500/20 outline-none"
                required
              />
            </div>
          </div>

          <div className="sticky bottom-0 bg-white pt-6 pb-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {mode === 'add' ? 'Add Task' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;