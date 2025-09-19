import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, ArrowLeft, TrendingUp, Package, Users, FolderOpen, CreditCard, Upload } from 'lucide-react';
import { MenuItem, Variation, AddOn } from '../types';
import { addOnCategories } from '../data/menuData';
import { useMenu } from '../hooks/useMenu';
import { useCategories } from '../hooks/useCategories';
import { supabase } from '../lib/supabase';
import ImageUpload from './ImageUpload';
import CategoryManager from './CategoryManager';
import PaymentMethodManager from './PaymentMethodManager';

const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('beracah_admin_auth') === 'true';
  });
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const { menuItems, loading, addMenuItem, updateMenuItem, deleteMenuItem, refreshMenuItems } = useMenu();
  const { categories, allCategories } = useCategories();
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'items' | 'add' | 'edit' | 'categories' | 'payments'>('dashboard');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    basePrice: undefined,
    discountedPrice: undefined,
    category: 'hair-care',
    subcategory: undefined,
    popular: false,
    available: true,
    variations: [],
    addOns: [],
    stock: 0,
    sku: '',
    brand: '',
    weight: '',
    ingredients: []
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [uploadingImages, setUploadingImages] = useState(false);

  // Debug categories loading
  React.useEffect(() => {
    console.log('Categories loaded:', categories.length, 'categories');
    console.log('All categories (flat):', allCategories.length, 'categories');
    console.log('Categories with parent_id:', allCategories.filter(cat => cat.parent_id).length, 'subcategories');
    console.log('All categories details:', allCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      parent_id: cat.parent_id
    })));
  }, [categories, allCategories]);

  // Debug form data changes
  React.useEffect(() => {
    console.log('Form data changed:', formData);
  }, [formData]);


  const handleAddItem = () => {
    setCurrentView('add');
    // Get the first main category (without parent_id)
    const mainCategories = allCategories.filter(cat => !cat.parent_id);
    const defaultCategory = mainCategories.length > 0 ? mainCategories[0].id as 'hair-care' | 'cosmetics' | 'skin-care' | 'nail-care' : 'hair-care';
    
    console.log('Setting up new item with category:', defaultCategory);
    console.log('Available main categories:', mainCategories);
    
    setFormData({
      name: '',
      description: '',
      basePrice: undefined,
      discountedPrice: undefined,
      category: defaultCategory,
      subcategory: undefined,
      popular: false,
      available: true,
      variations: [],
      addOns: [],
      stock: 0,
      sku: '',
      brand: '',
      weight: '',
      ingredients: []
    });
    setFormErrors({});
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setFormData(item);
    setCurrentView('edit');
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        setIsProcessing(true);
        await deleteMenuItem(id);
      } catch (error) {
        alert('Failed to delete item. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    console.log('Validating form with data:', formData);

    if (!formData.name?.trim()) {
      errors.name = 'Product name is required';
    } else if (formData.name.length < 3) {
      errors.name = 'Product name must be at least 3 characters';
    }

    if (!formData.description?.trim()) {
      errors.description = 'Product description is required';
    } else if (formData.description.length < 5) {
      errors.description = 'Product description must be at least 5 characters';
    }

    if (!formData.basePrice || formData.basePrice <= 0) {
      errors.basePrice = 'Base price must be greater than 0';
    }

    if (formData.discountedPrice && formData.discountedPrice >= formData.basePrice!) {
      errors.discountedPrice = 'Discounted price must be less than base price';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (!formData.subcategory) {
      errors.subcategory = 'Subcategory is required';
    }

    if (formData.stock !== undefined && formData.stock < 0) {
      errors.stock = 'Stock quantity cannot be negative';
    }

    if (formData.sku && formData.sku.trim() && !/^[A-Z0-9-]+$/.test(formData.sku)) {
      errors.sku = 'SKU must contain only uppercase letters, numbers, and hyphens';
    }

    if (formData.weight && formData.weight.trim() && !/^\d+(\.\d+)?\s*(g|ml|oz|lb)$/i.test(formData.weight)) {
      errors.weight = 'Weight must be in format like "100g", "250ml", "1.5oz"';
    }

    console.log('Validation errors:', errors);
    setFormErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    console.log('Form is valid:', isValid);
    return isValid;
  };

  const handleSaveItem = async () => {
    console.log('Form data before validation:', formData);
    console.log('Form errors before validation:', formErrors);
    
    if (!validateForm()) {
      console.log('Validation failed, errors:', formErrors);
      return;
    }

    try {
      setIsProcessing(true);
      console.log('Saving item with data:', formData);
      
      if (editingItem) {
        await updateMenuItem(editingItem.id, formData);
      } else {
        await addMenuItem(formData as Omit<MenuItem, 'id'>);
      }
      setCurrentView('items');
      setEditingItem(null);
      setFormErrors({});
      console.log('Item saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save item: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setCurrentView(currentView === 'add' || currentView === 'edit' ? 'items' : 'dashboard');
    setEditingItem(null);
    setSelectedItems([]);
  };

  const handleBulkRemove = async () => {
    if (selectedItems.length === 0) {
      alert('Please select items to delete');
      return;
    }

    const itemNames = selectedItems.map(id => {
      const item = menuItems.find(i => i.id === id);
      return item ? item.name : 'Unknown Item';
    }).slice(0, 5); // Show first 5 items
    
    const displayNames = itemNames.join(', ');
    const moreItems = selectedItems.length > 5 ? ` and ${selectedItems.length - 5} more items` : '';
    
    if (confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?\n\nItems to delete: ${displayNames}${moreItems}\n\nThis action cannot be undone.`)) {
      try {
        setIsProcessing(true);
        // Delete items one by one
        for (const itemId of selectedItems) {
          await deleteMenuItem(itemId);
        }
        setSelectedItems([]);
        setShowBulkActions(false);
        alert(`Successfully deleted ${selectedItems.length} item(s).`);
      } catch (error) {
        alert('Failed to delete some items. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };
  const handleBulkCategoryChange = async (newCategoryId: string) => {
    if (selectedItems.length === 0) {
      alert('Please select items to update');
      return;
    }

    const categoryName = categories.find(cat => cat.id === newCategoryId)?.name;
    if (confirm(`Are you sure you want to change the category of ${selectedItems.length} item(s) to "${categoryName}"?`)) {
      try {
        setIsProcessing(true);
        // Update category for each selected item
        for (const itemId of selectedItems) {
          const item = menuItems.find(i => i.id === itemId);
          if (item) {
            await updateMenuItem(itemId, { ...item, category: newCategoryId as 'hair-care' | 'cosmetics' | 'skin-care' | 'nail-care' });
          }
        }
        setSelectedItems([]);
        setShowBulkActions(false);
        alert(`Successfully updated category for ${selectedItems.length} item(s)`);
      } catch (error) {
        alert('Failed to update some items');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === menuItems.length) {
      setSelectedItems([]);
      setShowBulkActions(false);
    } else {
      setSelectedItems(menuItems.map(item => item.id));
      setShowBulkActions(true);
    }
  };

  // Update bulk actions visibility when selection changes
  React.useEffect(() => {
    setShowBulkActions(selectedItems.length > 0);
  }, [selectedItems]);

  const addVariation = () => {
    const newVariation: Variation = {
      id: `var-${Date.now()}`,
      name: '',
      price: 0,
      images: [],
      image_url: '',
      sku: '',
      stock: 0
    };
    setFormData({
      ...formData,
      variations: [...(formData.variations || []), newVariation]
    });
  };

  const updateVariation = (index: number, field: keyof Variation, value: string | number) => {
    const updatedVariations = [...(formData.variations || [])];
    updatedVariations[index] = { ...updatedVariations[index], [field]: value };
    setFormData({ ...formData, variations: updatedVariations });
  };

  const removeVariation = (index: number) => {
    const updatedVariations = formData.variations?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, variations: updatedVariations });
  };

  const addVariationImage = async (variationIndex: number, file: File) => {
    try {
      console.log('Starting image upload for variation', variationIndex, 'file:', file.name);
      setUploadingImages(true);
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(`variations/${Date.now()}-${file.name}`, file);

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload successful, data:', data);

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      console.log('Public URL:', publicUrl);

      const updatedVariations = [...(formData.variations || [])];
      updatedVariations[variationIndex] = {
        ...updatedVariations[variationIndex],
        images: [...(updatedVariations[variationIndex].images || []), publicUrl]
      };
      
      console.log('Updated variations:', updatedVariations);
      setFormData({ ...formData, variations: updatedVariations });
      console.log('Image added successfully');
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploadingImages(false);
    }
  };

  const removeVariationImage = (variationIndex: number, imageIndex: number) => {
    const updatedVariations = [...(formData.variations || [])];
    updatedVariations[variationIndex] = {
      ...updatedVariations[variationIndex],
      images: updatedVariations[variationIndex].images?.filter((_, i) => i !== imageIndex) || []
    };
    setFormData({ ...formData, variations: updatedVariations });
  };

  const reorderVariationImages = (variationIndex: number, fromIndex: number, toIndex: number) => {
    const updatedVariations = [...(formData.variations || [])];
    const images = [...(updatedVariations[variationIndex].images || [])];
    const [movedImage] = images.splice(fromIndex, 1);
    images.splice(toIndex, 0, movedImage);
    
    updatedVariations[variationIndex] = {
      ...updatedVariations[variationIndex],
      images
    };
    setFormData({ ...formData, variations: updatedVariations });
  };

  const addAddOn = () => {
    const newAddOn: AddOn = {
      id: `addon-${Date.now()}`,
      name: '',
      price: 0,
      category: 'extras'
    };
    setFormData({
      ...formData,
      addOns: [...(formData.addOns || []), newAddOn]
    });
  };

  const updateAddOn = (index: number, field: keyof AddOn, value: string | number) => {
    const updatedAddOns = [...(formData.addOns || [])];
    updatedAddOns[index] = { ...updatedAddOns[index], [field]: value };
    setFormData({ ...formData, addOns: updatedAddOns });
  };

  const removeAddOn = (index: number) => {
    const updatedAddOns = formData.addOns?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, addOns: updatedAddOns });
  };

  // Dashboard Stats
  const totalItems = menuItems.length;
  const popularItems = menuItems.filter(item => item.popular).length;
  const availableItems = menuItems.filter(item => item.available).length;
  const categoryCounts = categories.map(cat => ({
    ...cat,
    count: menuItems.filter(item => item.category === cat.id).length
  }));

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'hhbcAdmin!2025') {
      setIsAuthenticated(true);
      localStorage.setItem('beracah_admin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('beracah_admin_auth');
    setPassword('');
    setCurrentView('dashboard');
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <img src="/logo.jpg" alt="H&HBC SHOPPE Logo" className="w-12 h-12 rounded-full object-cover" />
            </div>
            <h1 className="text-2xl font-semibold text-black">
              <span className="text-blue-400">H</span>
              <span className="text-gray-600">&</span>
              <span className="text-pink-500">hbc</span>
              <span className="text-gray-600"> SHOPPE</span>
              <span className="text-gray-500 text-lg"> Admin Access</span>
            </h1>
            <p className="text-gray-600 mt-2">Enter password to access the admin dashboard</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-black mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter admin password"
                required
              />
              {loginError && (
                <p className="text-red-500 text-sm mt-2">{loginError}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
                  {currentView === 'add' ? 'Add Item' : 'Edit Item'}
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
                  onClick={handleSaveItem}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  <span>{isProcessing ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                    formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'
                  }`}
                  placeholder="Enter product name"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Base Price *</label>
                <input
                  type="number"
                  value={formData.basePrice || ''}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value ? Number(e.target.value) : undefined })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                    formErrors.basePrice ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'
                  }`}
                  placeholder="Enter price"
                  step="0.01"
                  min="0"
                />
                {formErrors.basePrice && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.basePrice}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Discounted Price</label>
                <input
                  type="number"
                  value={formData.discountedPrice || ''}
                  onChange={(e) => setFormData({ ...formData, discountedPrice: Number(e.target.value) || undefined })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Leave empty for no discount"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Enter a discounted price to show a sale price
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Category *</label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => {
                    const selectedCategory = e.target.value as 'hair-care' | 'cosmetics' | 'skin-care' | 'nail-care';
                    console.log('Category changed to:', selectedCategory);
                    setFormData({ 
                      ...formData, 
                      category: selectedCategory,
                      subcategory: undefined // Reset subcategory when category changes
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  {allCategories.filter(cat => !cat.parent_id).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Subcategory *
                </label>
                <select
                  value={formData.subcategory || ''}
                  onChange={(e) => {
                    console.log('Subcategory changed to:', e.target.value);
                    setFormData({ ...formData, subcategory: e.target.value || undefined });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                    formErrors.subcategory ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'
                  }`}
                  disabled={!formData.category}
                >
                  <option value="">Select a subcategory</option>
                  {formData.category && (() => {
                    const subcategories = allCategories.filter(cat => cat.parent_id === formData.category);
                    console.log('Selected category:', formData.category);
                    console.log('All categories for filtering:', allCategories);
                    console.log('Filtered subcategories:', subcategories);
                    console.log('Rendering subcategory options...');
                    
                    if (subcategories.length === 0) {
                      console.log('No subcategories found for category:', formData.category);
                      return <option value="" disabled>No subcategories available</option>;
                    }
                    
                    const options = subcategories.map(cat => {
                      console.log('Creating option for:', cat.name, 'with id:', cat.id);
                      return <option key={cat.id} value={cat.id}>{cat.name}</option>;
                    });
                    
                    console.log('Rendered options:', options.length);
                    return options;
                  })()}
                  {/* Test option to see if dropdown is working */}
                  <option value="test" style={{color: 'red'}}>TEST OPTION</option>
                </select>
                {formErrors.subcategory && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.subcategory}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Choose a specific subcategory within the selected category
                </p>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.popular || false}
                    onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-black">Mark as Popular</span>
                </label>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.available ?? true}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-black">Available for Order</span>
                </label>
              </div>

              {/* Additional Product Fields */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Brand <span className="text-gray-500 text-sm">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.brand || ''}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter brand name"
                />
                <p className="text-sm text-gray-500 mt-1">
                  The brand or manufacturer of this product
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  SKU (Stock Keeping Unit) <span className="text-gray-500 text-sm">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.sku || ''}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                    formErrors.sku ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'
                  }`}
                  placeholder="e.g., HAIR-001, LIP-123"
                />
                <p className="text-sm text-gray-500 mt-1">
                  SKU is a unique identifier for your product (letters, numbers, and hyphens only)
                </p>
                {formErrors.sku && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.sku}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Weight <span className="text-gray-500 text-sm">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.weight || ''}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                    formErrors.weight ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'
                  }`}
                  placeholder="e.g., 100g, 250ml, 1.5oz"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Product weight or volume (e.g., 100g, 250ml, 1.5oz)
                </p>
                {formErrors.weight && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.weight}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Stock Quantity</label>
                <input
                  type="number"
                  value={formData.stock || ''}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                    formErrors.stock ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'
                  }`}
                  placeholder="0"
                  min="0"
                />
                {formErrors.stock && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.stock}</p>
                )}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-black mb-2">Description *</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter item description"
                rows={3}
              />
            </div>

            <div className="mb-8">
              <ImageUpload
                currentImage={formData.images?.[0] || ''}
                onImageChange={(imageUrl) => setFormData({ ...formData, images: imageUrl ? [imageUrl] : [] })}
              />
            </div>

            {/* Variations Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-playfair font-medium text-black">Size Variations</h3>
                <button
                  onClick={addVariation}
                  className="flex items-center space-x-2 px-3 py-2 bg-cream-100 text-black rounded-lg hover:bg-cream-200 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Variation</span>
                </button>
              </div>

              {formData.variations?.map((variation, index) => (
                <div key={variation.id} className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <input
                      type="text"
                      value={variation.name}
                      onChange={(e) => updateVariation(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Variation name (e.g., Small, Medium, Large)"
                    />
                    <input
                      type="number"
                      value={variation.price}
                      onChange={(e) => updateVariation(index, 'price', Number(e.target.value))}
                      className="w-24 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Price"
                    />
                    <button
                      onClick={() => removeVariation(index)}
                      className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Variation Images Upload */}
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Variation Images (Multiple)
                    </label>
                    
                    {/* Multiple Images Display */}
                    {variation.images && variation.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                        {variation.images.map((image, imgIndex) => (
                          <div key={imgIndex} className="relative group">
                            <img
                              src={image}
                              alt={`${variation.name} image ${imgIndex + 1}`}
                              className="w-full h-20 object-cover rounded-lg border border-gray-200"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-1">
                              <button
                                onClick={() => removeVariationImage(index, imgIndex)}
                                className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                                title="Remove image"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (imgIndex > 0) {
                                    reorderVariationImages(index, imgIndex, imgIndex - 1);
                                  }
                                }}
                                disabled={imgIndex === 0}
                                className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                title="Move left"
                              >
                                ←
                              </button>
                              <button
                                onClick={() => {
                                  if (imgIndex < variation.images!.length - 1) {
                                    reorderVariationImages(index, imgIndex, imgIndex + 1);
                                  }
                                }}
                                disabled={imgIndex === variation.images!.length - 1}
                                className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                title="Move right"
                              >
                                →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Image Upload */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          console.log('Files selected:', files);
                          
                          for (const file of files) {
                            if (file.size > 5 * 1024 * 1024) {
                              alert('Image size must be less than 5MB');
                              continue;
                            }
                            
                            // Validate file type
                            if (!file.type.startsWith('image/')) {
                              alert('Please select only image files');
                              continue;
                            }
                            
                            console.log('Uploading file:', file.name);
                            await addVariationImage(index, file);
                          }
                          
                          // Reset file input
                          e.target.value = '';
                        }}
                        className="hidden"
                        id={`variation-images-${index}`}
                      />
                      <label
                        htmlFor={`variation-images-${index}`}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Upload Multiple Images</span>
                      </label>
                      {uploadingImages && (
                        <span className="text-sm text-gray-500">Uploading...</span>
                      )}
                    </div>
                    
                    {/* Single Image for backward compatibility */}
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Image (Single)
                      </label>
                      <ImageUpload
                        onImageChange={(url) => updateVariation(index, 'image_url', url || '')}
                        currentImage={variation.image_url || ''}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add-ons Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-playfair font-medium text-black">Add-ons</h3>
                <button
                  onClick={addAddOn}
                  className="flex items-center space-x-2 px-3 py-2 bg-cream-100 text-black rounded-lg hover:bg-cream-200 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Add-on</span>
                </button>
              </div>

              {formData.addOns?.map((addOn, index) => (
                <div key={addOn.id} className="flex items-center space-x-3 mb-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={addOn.name}
                    onChange={(e) => updateAddOn(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Add-on name"
                  />
                  <select
                    value={addOn.category}
                    onChange={(e) => updateAddOn(index, 'category', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {addOnCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={addOn.price}
                    onChange={(e) => updateAddOn(index, 'price', Number(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Price"
                  />
                  <button
                    onClick={() => removeAddOn(index)}
                    className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Items List View
  if (currentView === 'items') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Dashboard</span>
                </button>
                <h1 className="text-2xl font-playfair font-semibold text-black">Items</h1>
              </div>
              <div className="flex items-center space-x-3">
                {showBulkActions && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {selectedItems.length} item(s) selected
                    </span>
                    <button
                      onClick={() => setShowBulkActions(!showBulkActions)}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <span>Bulk Actions</span>
                    </button>
                  </div>
                )}
                <button
                  onClick={handleAddItem}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Bulk Actions Panel */}
          {showBulkActions && selectedItems.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-l-4 border-blue-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium text-black mb-1">Bulk Actions</h3>
                  <p className="text-sm text-gray-600">{selectedItems.length} item(s) selected</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Change Category */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Change Category:</label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleBulkCategoryChange(e.target.value);
                          e.target.value = ''; // Reset selection
                        }
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      disabled={isProcessing}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Remove Items */}
                  <button
                    onClick={handleBulkRemove}
                    disabled={isProcessing}
                    className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{isProcessing ? 'Removing...' : 'Remove Selected'}</span>
                  </button>
                  
                  {/* Clear Selection */}
                  <button
                    onClick={() => {
                      setSelectedItems([]);
                      setShowBulkActions(false);
                    }}
                    className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm"
                  >
                    <X className="h-4 w-4" />
                    <span>Clear Selection</span>
                  </button>
            </div>
          </div>
        </div>
      )}


          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Bulk Actions Bar */}
            {menuItems.length > 0 && (
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === menuItems.length && menuItems.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Select All ({menuItems.length} items)
                      </span>
                    </label>
                  </div>
                  {selectedItems.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {selectedItems.length} item(s) selected
                      </span>
                      <button
                        onClick={() => setSelectedItems([])}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      >
                        Clear Selection
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                      Select
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Variations</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Add-ons</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {menuItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>
                          <div className="font-medium">
                            {allCategories.find(cat => cat.id === item.category)?.name}
                          </div>
                          {item.subcategory && (
                            <div className="text-xs text-gray-400">
                              {allCategories.find(cat => cat.id === item.subcategory)?.name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.discountedPrice ? (
                          <div className="flex flex-col">
                            <span className="text-green-600 font-bold">₱{item.discountedPrice}</span>
                            <span className="text-gray-400 line-through text-xs">₱{item.basePrice}</span>
                          </div>
                        ) : (
                          <span>₱{item.basePrice}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.variations?.length || 0} variations
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.addOns?.length || 0} add-ons
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          {item.popular && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-600 text-white">
                              Popular
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.available 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditItem(item)}
                            disabled={isProcessing}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={isProcessing}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              {menuItems.map((item) => (
                <div key={item.id} className={`p-4 border-b border-gray-200 last:border-b-0 ${selectedItems.includes(item.id) ? 'bg-blue-50' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-600">Select</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        disabled={isProcessing}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={isProcessing}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <div className="ml-1 text-gray-900">
                        <div className="font-medium">
                          {allCategories.find(cat => cat.id === item.category)?.name}
                        </div>
                        {item.subcategory && (
                          <div className="text-xs text-gray-400">
                            {allCategories.find(cat => cat.id === item.subcategory)?.name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Price:</span>
                      {item.discountedPrice ? (
                        <div className="ml-1 flex flex-col">
                          <span className="text-green-600 font-bold">₱{item.discountedPrice}</span>
                          <span className="text-gray-400 line-through text-xs">₱{item.basePrice}</span>
                        </div>
                      ) : (
                        <span className="ml-1 font-medium text-gray-900">₱{item.basePrice}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-500">Variations:</span>
                      <span className="ml-1 text-gray-900">{item.variations?.length || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Add-ons:</span>
                      <span className="ml-1 text-gray-900">{item.addOns?.length || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2">
                      {item.popular && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-600 text-white">
                          Popular
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Categories View
  if (currentView === 'categories') {
    return <CategoryManager onBack={() => setCurrentView('dashboard')} />;
  }

  // Payment Methods View
  if (currentView === 'payments') {
    return <PaymentMethodManager onBack={() => setCurrentView('dashboard')} />;
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
            <img src="/logo.jpg" alt="H&HBC SHOPPE Logo" className="w-8 h-8 rounded-soft object-cover" />
              <h1 className="text-2xl font-semibold text-black">
                <span className="text-blue-400">H</span>
                <span className="text-gray-600">&</span>
                <span className="text-pink-500">hbc</span>
                <span className="text-gray-600"> SHOPPE</span>
                <span className="text-gray-500 text-lg"> Admin</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshMenuItems}
                className="text-gray-600 hover:text-black transition-colors duration-200"
                title="Refresh data from database"
              >
                🔄 Refresh
              </button>
              <a
                href="/"
                className="text-gray-600 hover:text-black transition-colors duration-200"
              >
                View Website
              </a>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-black transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-600 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-semibold text-gray-900">{totalItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Items</p>
                <p className="text-2xl font-semibold text-gray-900">{availableItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-cream-500 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Popular Items</p>
                <p className="text-2xl font-semibold text-gray-900">{popularItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-semibold text-gray-900">Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-playfair font-medium text-black mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleAddItem}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <Plus className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-gray-900">Add Item</span>
              </button>
              <button
                onClick={() => setCurrentView('items')}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <Package className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-gray-900">Manage Items</span>
              </button>
              <button
                onClick={() => setCurrentView('categories')}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <FolderOpen className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-gray-900">Manage Categories</span>
              </button>
              <button
                onClick={() => setCurrentView('payments')}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <CreditCard className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-gray-900">Payment Methods</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-playfair font-medium text-black mb-4">Categories Overview</h3>
            <div className="space-y-3">
              {categoryCounts.map((category) => (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{category.count} items</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;