import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { CartItem } from '../types';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  contact_number: string;
  shipping_address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  shipping_method: string;
  shipping_fee: number;
  subtotal: number;
  voucher_discount: number;
  total_amount: number;
  payment_method: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  voucher_id?: string;
  voucher_code?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_description?: string;
  base_price: number;
  discounted_price?: number;
  quantity: number;
  variation_id?: string;
  variation_name?: string;
  variation_price: number;
  add_ons: any[];
  item_total: number;
  created_at: string;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = useCallback(async (
    orderData: {
      customer_name: string;
      contact_number: string;
      shipping_address: any;
      shipping_method: string;
      shipping_fee: number;
      subtotal: number;
      voucher_discount: number;
      total_amount: number;
      payment_method: string;
      notes?: string;
      voucher_id?: string;
      voucher_code?: string;
    },
    cartItems: CartItem[]
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Generate order number in frontend
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const timestamp = Date.now().toString().slice(-4);
      const orderNumber = `${dateStr}-${timestamp}`;

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          ...orderData,
          order_number: orderNumber
        }])
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(`Order creation failed: ${orderError.message}`);
      }

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_description: item.description,
        base_price: item.basePrice,
        discounted_price: item.discountedPrice,
        quantity: item.quantity,
        variation_id: item.selectedVariation?.id,
        variation_name: item.selectedVariation?.name,
        variation_price: item.selectedVariation?.price || 0,
        add_ons: item.selectedAddOns || [],
        item_total: item.totalPrice
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw new Error(`Order items creation failed: ${itemsError.message}`);
      }

      // Update voucher usage if applicable
      if (orderData.voucher_id) {
        try {
          // First get the current voucher data
          const { data: voucherData, error: fetchError } = await supabase
            .from('vouchers')
            .select('used_count, max_uses, is_active')
            .eq('id', orderData.voucher_id)
            .single();

          if (fetchError) {
            console.error('Error fetching voucher:', fetchError);
          } else {
            const newUsedCount = (voucherData.used_count || 0) + 1;
            const shouldDeactivate = voucherData.max_uses && newUsedCount >= voucherData.max_uses;

            console.log('Updating voucher usage:', {
              voucherId: orderData.voucher_id,
              oldUsedCount: voucherData.used_count,
              newUsedCount: newUsedCount,
              maxUses: voucherData.max_uses,
              shouldDeactivate: shouldDeactivate
            });

            const { error: voucherError } = await supabase
              .from('vouchers')
              .update({ 
                used_count: newUsedCount,
                is_active: shouldDeactivate ? false : voucherData.is_active
              })
              .eq('id', orderData.voucher_id);

            if (voucherError) {
              console.error('Error updating voucher usage:', voucherError);
              // Don't throw error here as order is already created
            } else {
              console.log('Voucher usage updated successfully');
            }
          }
        } catch (error) {
          console.error('Error in voucher update process:', error);
          // Don't throw error here as order is already created
        }
      }

      return order;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching orders...');

      // First try a simple query to check if table exists
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      console.log('Orders query result:', { data, error });

      if (error) {
        console.error('Orders query error:', error);
        
        // If table doesn't exist, show a helpful message
        if (error.message.includes('relation "public.orders" does not exist')) {
          setError('Orders table not found. Please run the database setup script.');
          setOrders([]);
          return;
        }
        
        throw error;
      }
      
      console.log('Setting orders:', data || []);
      setOrders(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(errorMessage);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status']) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrderById = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:menu_items (
              id,
              name,
              image_url
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    loading,
    error,
    createOrder,
    fetchOrders,
    updateOrderStatus,
    getOrderById
  };
};
