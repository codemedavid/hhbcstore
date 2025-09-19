import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedDays?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const useShippingMethods = () => {
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShippingMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('shipping_methods')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        throw error;
      }

      // Convert snake_case to camelCase
      const formattedData = data?.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        estimatedDays: item.estimated_days,
        isActive: item.is_active,
        sortOrder: item.sort_order,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      })) || [];

      setShippingMethods(formattedData);
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch shipping methods');
    } finally {
      setLoading(false);
    }
  };

  const addShippingMethod = async (shippingMethod: Omit<ShippingMethod, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      
      // Convert camelCase to snake_case
      const { data, error } = await supabase
        .from('shipping_methods')
        .insert({
          name: shippingMethod.name,
          description: shippingMethod.description,
          price: shippingMethod.price,
          estimated_days: shippingMethod.estimatedDays,
          is_active: shippingMethod.isActive,
          sort_order: shippingMethod.sortOrder
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Convert snake_case to camelCase
      const formattedData = {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        estimatedDays: data.estimated_days,
        isActive: data.is_active,
        sortOrder: data.sort_order,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setShippingMethods(prev => [...prev, formattedData].sort((a, b) => a.sortOrder - b.sortOrder));
      return formattedData;
    } catch (error) {
      console.error('Error adding shipping method:', error);
      setError(error instanceof Error ? error.message : 'Failed to add shipping method');
      throw error;
    }
  };

  const updateShippingMethod = async (id: string, updates: Partial<Omit<ShippingMethod, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      setError(null);
      
      // Convert camelCase to snake_case
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.estimatedDays !== undefined) updateData.estimated_days = updates.estimatedDays;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      if (updates.sortOrder !== undefined) updateData.sort_order = updates.sortOrder;

      const { data, error } = await supabase
        .from('shipping_methods')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Convert snake_case to camelCase
      const formattedData = {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        estimatedDays: data.estimated_days,
        isActive: data.is_active,
        sortOrder: data.sort_order,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setShippingMethods(prev => 
        prev.map(item => item.id === id ? formattedData : item)
          .sort((a, b) => a.sortOrder - b.sortOrder)
      );
      return formattedData;
    } catch (error) {
      console.error('Error updating shipping method:', error);
      setError(error instanceof Error ? error.message : 'Failed to update shipping method');
      throw error;
    }
  };

  const deleteShippingMethod = async (id: string) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('shipping_methods')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setShippingMethods(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting shipping method:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete shipping method');
      throw error;
    }
  };

  useEffect(() => {
    fetchShippingMethods();
  }, []);

  return {
    shippingMethods,
    loading,
    error,
    fetchShippingMethods,
    addShippingMethod,
    updateShippingMethod,
    deleteShippingMethod
  };
};
