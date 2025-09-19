import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Category {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  active: boolean;
  parent_id?: string | null; // For subcategories
  created_at: string;
  updated_at: string;
  subcategories?: Category[]; // For frontend hierarchy
  level?: number; // For frontend display
  path?: string; // For breadcrumb display
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Fetch all categories directly from the categories table
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;

      // Build hierarchical structure for frontend
      const hierarchicalCategories = buildCategoryHierarchy(data || []);
      console.log('Raw categories from database:', data);
      console.log('Raw categories count:', data?.length || 0);
      console.log('Categories with parent_id:', data?.filter(cat => cat.parent_id) || []);
      console.log('Hierarchical categories built:', hierarchicalCategories);
      setCategories(hierarchicalCategories);
      setAllCategories(data || []); // Store flat list for filtering
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const buildCategoryHierarchy = (flatCategories: any[]): Category[] => {
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // First pass: create all category objects
    flatCategories.forEach(cat => {
      categoryMap.set(cat.id, {
        ...cat,
        subcategories: []
      });
    });

    // Second pass: build hierarchy
    flatCategories.forEach(cat => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.subcategories!.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    return rootCategories;
  };

  const addCategory = async (category: Omit<Category, 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('categories')
        .insert({
          id: category.id,
          name: category.name,
          icon: category.icon,
          sort_order: category.sort_order,
          active: category.active,
          parent_id: category.parent_id || null
        })
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchCategories();
      return data;
    } catch (err) {
      console.error('Error adding category:', err);
      throw err;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const { error: updateError } = await supabase
        .from('categories')
        .update({
          name: updates.name,
          icon: updates.icon,
          sort_order: updates.sort_order,
          active: updates.active,
          parent_id: updates.parent_id
        })
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchCategories();
    } catch (err) {
      console.error('Error updating category:', err);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      // Check if category has menu items
      const { data: menuItems, error: checkError } = await supabase
        .from('menu_items')
        .select('id')
        .eq('category', id)
        .limit(1);

      if (checkError) throw checkError;

      if (menuItems && menuItems.length > 0) {
        throw new Error('Cannot delete category that contains menu items. Please move or delete the items first.');
      }

      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      throw err;
    }
  };

  const reorderCategories = async (reorderedCategories: Category[]) => {
    try {
      const updates = reorderedCategories.map((cat, index) => ({
        id: cat.id,
        sort_order: index + 1
      }));

      for (const update of updates) {
        await supabase
          .from('categories')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
      }

      await fetchCategories();
    } catch (err) {
      console.error('Error reordering categories:', err);
      throw err;
    }
  };

  // Helper function to get all categories in a flat list
  const getAllCategoriesFlat = (categories: Category[]): Category[] => {
    const flat: Category[] = [];
    const flatten = (cats: Category[]) => {
      cats.forEach(cat => {
        flat.push(cat);
        if (cat.subcategories && cat.subcategories.length > 0) {
          flatten(cat.subcategories);
        }
      });
    };
    flatten(categories);
    return flat;
  };

  // Helper function to get subcategories of a specific category
  const getSubcategories = async (parentId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_subcategories', { category_id: parentId });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      throw err;
    }
  };

  // Helper function to check if a category can be deleted
  const canDeleteCategory = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('can_delete_category', { category_id: categoryId });
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error checking if category can be deleted:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    allCategories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    getAllCategoriesFlat,
    getSubcategories,
    canDeleteCategory,
    refetch: fetchCategories
  };
};