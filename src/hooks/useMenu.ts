import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MenuItem } from '../types';

export const useMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      
      // Fetch menu items with their variations and add-ons
      const { data: items, error: itemsError } = await supabase
        .from('menu_items')
        .select(`
          id,
          name,
          description,
          base_price,
          discounted_price,
          category,
          subcategory,
          image_url,
          popular,
          available,
          stock,
          sku,
          brand,
          weight,
          ingredients,
          created_at,
          updated_at,
          variations (*),
          add_ons (*)
        `)
        .order('created_at', { ascending: true });

      if (itemsError) {
        console.error('❌ Database error:', itemsError);
        throw itemsError;
      }


      const formattedItems: MenuItem[] = items?.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        basePrice: item.base_price,
        discountedPrice: item.discounted_price || undefined,
        category: item.category,
        subcategory: item.subcategory || undefined,
        images: item.image_url ? [item.image_url] : [],
        popular: item.popular,
        available: item.available ?? true,
        stock: (item.stock !== null && item.stock !== undefined) ? item.stock : 50,
        sku: item.sku || undefined,
        brand: item.brand || undefined,
        weight: item.weight || undefined,
        variations: item.variations?.map((v: any) => ({
          id: v.id,
          name: v.name,
          price: v.price,
          images: v.image_url ? [v.image_url] : [],
          image_url: v.image_url,
          sku: v.sku || undefined,
          stock: v.stock || undefined,
          sort_order: v.sort_order || undefined,
          created_at: v.created_at,
          updated_at: v.updated_at
        })) || [],
        addOns: item.add_ons?.map((a: any) => ({
          id: a.id,
          name: a.name,
          price: a.price,
          category: a.category,
          image: a.image,
          description: a.description
        })) || []
      })) || [];


      setMenuItems(formattedItems);
      setError(null);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    try {
      // Insert menu item
      const { data: menuItem, error: itemError } = await supabase
        .from('menu_items')
        .insert({
          name: item.name,
          description: item.description,
          base_price: item.basePrice,
          discounted_price: item.discountedPrice || null,
          category: item.category,
          subcategory: item.subcategory || null,
          popular: item.popular || false,
          available: item.available ?? true,
          stock: item.stock || 0,
          sku: item.sku || null,
          brand: item.brand || null,
          weight: item.weight || null,
          image_url: item.images?.[0] || null
        })
        .select()
        .single();

      if (itemError) throw itemError;

      // Insert variations if any
      if (item.variations && item.variations.length > 0) {
        const { error: variationsError } = await supabase
          .from('variations')
          .insert(
            item.variations.map(v => ({
              menu_item_id: menuItem.id,
              name: v.name,
              price: v.price,
              image_url: v.image_url || null
            }))
          );

        if (variationsError) throw variationsError;
      }

      // Insert add-ons if any
      if (item.addOns && item.addOns.length > 0) {
        const { error: addOnsError } = await supabase
          .from('add_ons')
          .insert(
            item.addOns.map(a => ({
              menu_item_id: menuItem.id,
              name: a.name,
              price: a.price,
              category: a.category
            }))
          );

        if (addOnsError) throw addOnsError;
      }

      await fetchMenuItems();
      return menuItem;
    } catch (err) {
      console.error('Error adding menu item:', err);
      throw err;
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      // Update menu item
      const { error: itemError } = await supabase
        .from('menu_items')
        .update({
          name: updates.name,
          description: updates.description,
          base_price: updates.basePrice,
          discounted_price: updates.discountedPrice || null,
          category: updates.category,
          subcategory: updates.subcategory || null,
          popular: updates.popular,
          available: updates.available,
          stock: updates.stock,
          sku: updates.sku || null,
          brand: updates.brand || null,
          weight: updates.weight || null,
          image_url: updates.images?.[0] || null
        })
        .eq('id', id);

      if (itemError) throw itemError;

      // Delete existing variations and add-ons
      await supabase.from('variations').delete().eq('menu_item_id', id);
      await supabase.from('add_ons').delete().eq('menu_item_id', id);

      // Insert new variations
      if (updates.variations && updates.variations.length > 0) {
        const { error: variationsError } = await supabase
          .from('variations')
          .insert(
            updates.variations.map(v => ({
              menu_item_id: id,
              name: v.name,
              price: v.price,
              image_url: v.image_url || null
            }))
          );

        if (variationsError) throw variationsError;
      }

      // Insert new add-ons
      if (updates.addOns && updates.addOns.length > 0) {
        const { error: addOnsError } = await supabase
          .from('add_ons')
          .insert(
            updates.addOns.map(a => ({
              menu_item_id: id,
              name: a.name,
              price: a.price,
              category: a.category
            }))
          );

        if (addOnsError) throw addOnsError;
      }

      await fetchMenuItems();
    } catch (err) {
      console.error('Error updating menu item:', err);
      throw err;
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchMenuItems();
    } catch (err) {
      console.error('Error deleting menu item:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Force refresh function
  const refreshMenuItems = async () => {
    console.log('🔄 Force refreshing menu items...');
    await fetchMenuItems();
  };

  return {
    menuItems,
    loading,
    error,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    refetch: fetchMenuItems,
    refreshMenuItems
  };
};