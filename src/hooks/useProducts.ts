import { useState, useEffect } from 'react';
import { Product } from '../types';
import { supabase } from '../lib/supabase';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
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
        .eq('available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProducts: Product[] = data?.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        basePrice: item.base_price,
        discountedPrice: item.discounted_price || undefined,
        category: item.category,
        subcategory: item.subcategory || undefined,
        images: item.image_url ? [item.image_url] : [],
        popular: item.popular,
        available: item.available,
        stock: (item.stock !== null && item.stock !== undefined) ? item.stock : 50,
        sku: item.sku || undefined,
        brand: item.brand || undefined,
        weight: item.weight || undefined,
        ingredients: item.ingredients || [],
        variations: item.variations?.map((v: any) => ({
          id: v.id,
          name: v.name,
          price: v.price,
          images: v.image_url ? [v.image_url] : [],
          image_url: v.image_url,
          sku: v.sku,
          stock: v.stock,
          sort_order: v.sort_order,
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

      setProducts(formattedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProductsByCategory = (category: string) => {
    return products.filter(product => product.category === category);
  };

  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  const searchProducts = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.brand?.toLowerCase().includes(lowercaseQuery)
    );
  };

  return {
    products,
    loading,
    error,
    getProductsByCategory,
    getProductById,
    searchProducts,
    refetch: fetchProducts
  };
}
