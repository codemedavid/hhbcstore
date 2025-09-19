import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface FloatingCartButtonProps {
  itemCount: number;
  onCartClick: () => void;
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ itemCount, onCartClick }) => {
  if (itemCount === 0) return null;

  return (
    <button
      onClick={onCartClick}
      className="fixed bottom-8 right-8 bg-gradient-to-r from-pink-400 to-pink-500 text-white p-5 rounded-cute shadow-floating hover:from-pink-500 hover:to-pink-600 transition-all duration-300 transform hover:scale-110 z-40 md:hidden border border-pink-300/50 backdrop-blur-sm group animate-bounce-cute"
    >
      <div className="relative">
        <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
        <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-pill h-6 w-6 flex items-center justify-center font-bold border-2 border-white shadow-cute animate-bounce-cute">
          {itemCount}
        </span>
      </div>
    </button>
  );
};

export default FloatingCartButton;