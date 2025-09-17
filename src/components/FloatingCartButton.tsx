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
      className="fixed bottom-8 right-8 bg-gradient-to-r from-black-700 to-black-800 text-white p-5 rounded-2xl shadow-large hover:from-black-600 hover:to-black-700 transition-all duration-300 transform hover:scale-110 z-40 md:hidden border border-brown-600/30 backdrop-blur-sm group"
    >
      <div className="relative">
        <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
        <span className="absolute -top-2 -right-2 bg-brown-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold border-2 border-white shadow-glow animate-bounce-gentle">
          {itemCount}
        </span>
      </div>
    </button>
  );
};

export default FloatingCartButton;