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
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-bold text-3xl">M</span>
        </div>
        <h2 className="text-3xl font-noto font-bold text-black-900 mb-3">Your cart is empty</h2>
        <p className="text-brown-600 mb-8 text-lg">Add some delicious items to get started!</p>
        <button
          onClick={onContinueShopping}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-green-500/25"
        >
          Browse Menu
        </button>
      </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onContinueShopping}
          className="flex items-center space-x-2 text-brown-600 hover:text-black-900 transition-colors duration-200 font-semibold"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Continue Shopping</span>
        </button>
        <h1 className="text-4xl font-noto font-bold text-black-900">Your Cart</h1>
        <button
          onClick={clearCart}
          className="text-brown-500 hover:text-red-600 transition-colors duration-200 font-semibold"
        >
          Clear All
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
                <p className="text-xl font-bold text-green-600">₱{item.totalPrice} each</p>
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
                    className="p-2 hover:bg-green-200 rounded-full transition-colors duration-200 text-green-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">₱{item.totalPrice * item.quantity}</p>
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
          <span className="text-green-600">₱{parseFloat(getTotalPrice() || 0).toFixed(2)}</span>
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