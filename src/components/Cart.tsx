import React from 'react';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  onContinueShopping: () => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({
  cartItems,
  updateQuantity,
  removeFromCart,
  clearCart,
  getTotalPrice,
  onContinueShopping,
  onCheckout
}) => {
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-gradient-to-br from-pink-200 to-pink-300 rounded-cute flex items-center justify-center mx-auto mb-8 shadow-floating">
          <img src="/logo.jpg" alt="H&HBC Logo" className="w-16 h-16 rounded-soft object-cover" />
        </div>
        <h2 className="text-4xl font-noto font-bold text-soft-800 mb-4">Your cart is empty ✨</h2>
        <p className="text-soft-600 mb-10 text-xl">Add some beautiful products to get started! 💕</p>
        <button
          onClick={onContinueShopping}
          className="bg-gradient-to-r from-pink-400 to-pink-500 text-white px-10 py-4 rounded-cute hover:from-pink-500 hover:to-pink-600 transition-all duration-300 font-bold text-lg shadow-floating hover:shadow-glow hover:scale-105"
        >
          🛍️ Browse Products
        </button>
      </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={onContinueShopping}
          className="flex items-center space-x-2 text-pink-600 hover:text-pink-700 transition-colors duration-200 font-semibold hover:scale-105"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Continue Shopping</span>
        </button>
        <h1 className="text-5xl font-noto font-bold text-soft-800">🛍️ Your Cart</h1>
        <button
          onClick={clearCart}
          className="text-red-500 hover:text-red-600 transition-colors duration-200 font-semibold hover:scale-105"
        >
          🗑️ Clear All
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-brown-100">
        {cartItems.map((item, index) => (
          <div key={item.id} className={`p-6 ${index !== cartItems.length - 1 ? 'border-b border-brown-200' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-noto font-bold text-black-900 mb-2">{item.name}</h3>
                {item.selectedVariation && (
                  <p className="text-sm text-brown-600 mb-1 font-medium">Size: {item.selectedVariation.name}</p>
                )}
                {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                  <p className="text-sm text-brown-600 mb-1 font-medium">
                    Add-ons: {item.selectedAddOns.map(addOn => 
                      addOn.quantity && addOn.quantity > 1 
                        ? `${addOn.name} x${addOn.quantity}`
                        : addOn.name
                    ).join(', ')}
                  </p>
                )}
                <p className="text-xl font-bold text-green-600">₱{Math.round(item.totalPrice / item.quantity)} each</p>
                {/* Stock Information */}
                <p className="text-xs text-soft-500 mt-1">
                  📦 {item.stock ?? 0} available in stock
                  {item.selectedVariation && item.stock !== item.selectedVariation.stock && (
                    <span className="text-pink-500 ml-1">
                      (variation: {item.selectedVariation.stock})
                    </span>
                  )}
                </p>
              </div>
              
              <div className="flex items-center space-x-4 ml-4">
                <div className="flex items-center space-x-3 bg-green-100 rounded-full p-1 border border-green-200">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-2 hover:bg-green-200 rounded-full transition-colors duration-200 text-green-700"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-semibold text-black min-w-[32px] text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={(() => {
                      const availableStock = item.selectedVariation?.stock ?? item.stock ?? 0;
                      return item.quantity >= availableStock;
                    })()}
                    className={`p-2 rounded-full transition-colors duration-200 ${
                      (() => {
                        const availableStock = item.selectedVariation?.stock ?? item.stock ?? 0;
                        return item.quantity >= availableStock
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'hover:bg-green-200 text-green-700';
                      })()
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">₱{item.totalPrice}</p>
                </div>
                
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-brown-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-brown-50 to-green-50 rounded-2xl shadow-lg p-8 border border-brown-200">
        <div className="flex items-center justify-between text-3xl font-noto font-bold text-black-900 mb-8">
          <span>Total:</span>
          <span className="text-green-600">₱{getTotalPrice().toFixed(2)}</span>
        </div>
        
        <button
          onClick={onCheckout}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-[1.02] font-bold text-xl shadow-lg hover:shadow-green-500/25"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;