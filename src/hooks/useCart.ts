import { useState, useCallback } from 'react';
import { CartItem, MenuItem, Variation, AddOn } from '../types';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const calculateItemPrice = (item: MenuItem, variation?: Variation, addOns?: AddOn[]) => {
    // Use discounted price if available, otherwise use base price
    let price = item.discountedPrice || item.basePrice;
    if (variation) {
      price += variation.price;
    }
    if (addOns) {
      addOns.forEach(addOn => {
        price += addOn.price;
      });
    }
    return price;
  };

  const addToCart = useCallback((item: MenuItem, quantity: number = 1, variation?: Variation, addOns?: AddOn[]) => {
    // Check stock availability
    const availableStock = variation?.stock ?? item.stock ?? 0;
    if (availableStock <= 0) {
      alert('This item is out of stock!');
      return false;
    }

    const totalPrice = calculateItemPrice(item, variation, addOns);
    
    // Group add-ons by name and sum their quantities
    const groupedAddOns = addOns?.reduce((groups, addOn) => {
      const existing = groups.find(g => g.id === addOn.id);
      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
      } else {
        groups.push({ ...addOn, quantity: 1 });
      }
      return groups;
    }, [] as (AddOn & { quantity: number })[]);
    
    setCartItems(prev => {
      // Find existing item with same product, variation, and add-ons
      const existingItem = prev.find(cartItem => {
        // Check if it's the same product
        if (cartItem.id !== item.id) return false;
        
        // Check if variations match (both undefined or same id)
        const cartVariationId = cartItem.selectedVariation?.id;
        const newVariationId = variation?.id;
        if (cartVariationId !== newVariationId) return false;
        
        // Check if add-ons match (simplified comparison)
        const cartAddOns = cartItem.selectedAddOns || [];
        const newAddOns = groupedAddOns || [];
        
        if (cartAddOns.length !== newAddOns.length) return false;
        
        // Simple add-ons comparison by id and quantity
        return cartAddOns.every(cartAddOn => 
          newAddOns.some(newAddOn => 
            newAddOn.id === cartAddOn.id && 
            (newAddOn.quantity || 1) === (cartAddOn.quantity || 1)
          )
        );
      });
      
      if (existingItem) {
        // Item already exists, just increase quantity
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > availableStock) {
          alert(`Only ${availableStock} items available in stock! You already have ${existingItem.quantity} in your cart.`);
          return prev;
        }
        return prev.map(cartItem =>
          cartItem === existingItem
            ? { ...cartItem, quantity: newQuantity, totalPrice: calculateItemPrice(item, variation, groupedAddOns) * newQuantity }
            : cartItem
        );
      } else {
        // New item, add to cart
        if (quantity > availableStock) {
          alert(`Only ${availableStock} items available in stock!`);
          return prev;
        }
        return [...prev, { 
          ...item,
          quantity,
          selectedVariation: variation,
          selectedAddOns: groupedAddOns || [],
          totalPrice: calculateItemPrice(item, variation, groupedAddOns) * quantity
        }];
      }
    });
    return true;
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCartItems(prev => {
      return prev.map(item => {
        if (item.id === id) {
          // Check stock availability for this specific item/variation
          const availableStock = item.selectedVariation?.stock ?? item.stock ?? 0;
          if (quantity > availableStock) {
            alert(`Only ${availableStock} items available in stock!`);
            return item; // Return unchanged item
          }
          
          // Recalculate total price for the new quantity
          const itemPrice = calculateItemPrice(item, item.selectedVariation, item.selectedAddOns);
          const newTotalPrice = itemPrice * quantity;
          
          console.log('🛒 Updating quantity:', {
            itemName: item.name,
            oldQuantity: item.quantity,
            newQuantity: quantity,
            itemPrice: itemPrice,
            oldTotalPrice: item.totalPrice,
            newTotalPrice: newTotalPrice
          });
          
          return { ...item, quantity, totalPrice: newTotalPrice };
        }
        return item;
      });
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  }, [cartItems]);

  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  return {
    cartItems,
    isCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
    openCart,
    closeCart
  };
};