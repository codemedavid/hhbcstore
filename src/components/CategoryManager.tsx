import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, ArrowLeft, GripVertical } from 'lucide-react';
import { useCategories, Category } from '../hooks/useCategories';

interface CategoryManagerProps {
  onBack: () => void;
}

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onAddSubcategory: (parentId: string) => void;
  level: number;
}

const CategoryList: React.FC<CategoryListProps> = ({ 
  categories, 
  onEdit, 
  onDelete, 
  onAddSubcategory, 
  level 
}) => {
  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <div key={category.id}>
          <div
            className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 ${
              level > 0 ? 'ml-6 bg-gray-50' : ''
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-400 cursor-move">
                <GripVertical className="h-4 w-4" />
                <span className="text-sm text-gray-500">#{category.sort_order}</span>
              </div>
              <div className="text-2xl">{category.icon}</div>
              <div>
                <h3 className="font-medium text-black">
                  {level > 0 && '└─ '}{category.name}
                </h3>
                <p className="text-sm text-gray-500">ID: {category.id}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                category.active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {category.active ? 'Active' : 'Inactive'}
              </span>
              
              <button
                onClick={() => onAddSubcategory(category.id)}
                className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                title="Add subcategory"
              >
                <Plus className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => onEdit(category)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200"
              >
                <Edit className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => onDelete(category.id)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Render subcategories recursively */}
          {category.subcategories && category.subcategories.length > 0 && (
            <CategoryList
              categories={category.subcategories}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSubcategory={onAddSubcategory}
              level={level + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const CategoryManager: React.FC<CategoryManagerProps> = ({ onBack }) => {
  const { 
    categories, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    reorderCategories,
    getAllCategoriesFlat 
  } = useCategories();
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit' | 'select-parent'>('list');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    icon: '☕',
    sort_order: 0,
    active: true,
    parent_id: null as string | null
  });

  const handleAddCategory = (parentId?: string) => {
    const allCategories = getAllCategoriesFlat(categories);
    const nextSortOrder = Math.max(...allCategories.map(c => c.sort_order), 0) + 1;
    setFormData({
      id: '',
      name: '',
      icon: '☕',
      sort_order: nextSortOrder,
      active: true,
      parent_id: parentId || null
    });
    setCurrentView('add');
  };

  const handleAddSubcategory = () => {
    setCurrentView('select-parent');
  };

  const handleSelectParent = (parentId: string) => {
    handleAddCategory(parentId);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      id: category.id,
      name: category.name,
      icon: category.icon,
      sort_order: category.sort_order,
      active: category.active,
      parent_id: category.parent_id || null
    });
    setCurrentView('edit');
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        await deleteCategory(id);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to delete category');
      }
    }
  };

  const handleSaveCategory = async () => {
    if (!formData.id || !formData.name || !formData.icon) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate ID format (kebab-case)
    const idRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!idRegex.test(formData.id)) {
      alert('Category ID must be in kebab-case format (e.g., "hot-drinks", "cold-beverages")');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await addCategory(formData);
      }
      setCurrentView('list');
      setEditingCategory(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save category');
    }
  };

  const handleCancel = () => {
    setCurrentView('list');
    setEditingCategory(null);
  };

  const generateIdFromName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      id: currentView === 'add' ? generateIdFromName(name) : formData.id
    });
  };

  // Parent Selection View
  if (currentView === 'select-parent') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentView('list')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back</span>
                </button>
                <h1 className="text-2xl font-playfair font-semibold text-black">
                  Select Parent Category
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-lg font-playfair font-medium text-black mb-6">
              Choose a parent category for your new subcategory
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getAllCategoriesFlat(categories).map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleSelectParent(category.id)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-left"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h3 className="font-medium text-black">{category.name}</h3>
                      <p className="text-sm text-gray-500">ID: {category.id}</p>
                      {category.level && category.level > 0 && (
                        <p className="text-xs text-blue-600">
                          Level {category.level + 1} subcategory
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form View (Add/Edit)
  if (currentView === 'add' || currentView === 'edit') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back</span>
                </button>
                <h1 className="text-2xl font-playfair font-semibold text-black">
                  {currentView === 'add' ? 'Add New Category' : 'Edit Category'}
                </h1>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Category ID *</label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="kebab-case-id"
                  disabled={currentView === 'edit'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {currentView === 'edit' 
                    ? 'Category ID cannot be changed after creation'
                    : 'Use kebab-case format (e.g., "hot-drinks", "cold-beverages")'
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Icon *</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter emoji or icon"
                  />
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                    {formData.icon}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use an emoji or icon character (e.g., ☕, 🧊, 🫖, 🥐)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Parent Category</label>
                <select
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Top-level category</option>
                  {getAllCategoriesFlat(categories).map((category) => (
                    <option key={category.id} value={category.id}>
                      {'  '.repeat(category.level || 0)} {category.icon} {category.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for top-level category, or select a parent to create a subcategory
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Sort Order</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first in the menu
                </p>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-black">Active Category</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Dashboard</span>
              </button>
              <h1 className="text-2xl font-playfair font-semibold text-black">Manage Categories</h1>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleAddCategory()}
                className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
                <span>Add Category</span>
              </button>
              <button
                onClick={handleAddSubcategory}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
                <span>Add Subcategory</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-playfair font-medium text-black mb-4">Categories</h2>
            
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No categories found</p>
                <button
                  onClick={handleAddCategory}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Add First Category
                </button>
              </div>
            ) : (
              <CategoryList 
                categories={categories} 
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                onAddSubcategory={handleAddCategory}
                level={0}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;