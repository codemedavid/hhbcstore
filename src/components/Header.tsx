import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onCatalogClick: () => void;
  onCategoryClick?: (categoryId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ cartItemsCount, onCartClick, onCatalogClick, onCategoryClick }) => {
  const beautyCategories = [
    { id: 'hair-care', name: 'Hair Care' },
    { id: 'cosmetics', name: 'Cosmetics' },
    { id: 'skin-care', name: 'Skin Care' },
    { id: 'nail-care', name: 'Nail Care' }
  ];

  const handleCategoryClick = (categoryId: string) => {
    onCatalogClick();
    if (onCategoryClick) {
      onCategoryClick(categoryId);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-pastel-white/95 backdrop-blur-md border-b border-pink-200/30 shadow-cute">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button 
            onClick={onCatalogClick}
            className="flex items-center space-x-4 text-soft-800 hover:text-pink-600 transition-all duration-300 group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-pink-200 to-pink-300 rounded-cute flex items-center justify-center shadow-floating group-hover:shadow-glow transition-all duration-300 group-hover:scale-105">
              <img src="/logo.jpg" alt="H&HBC SHOPPE Logo" className="w-10 h-10 rounded-soft object-cover" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold tracking-wide group-hover:scale-105 transition-all duration-300 whitespace-nowrap flex items-center">
                <span className="text-blue-400">H</span>
                <span className="text-gray-400 text-sm flex items-center">&</span>
                <span className="text-pink-500">hbc</span>
                <span className="text-black text-lg font-semibold tracking-widest ml-1">SHOPPE</span>
              </h1>
              <p className="text-sm text-pink-500 font-medium tracking-wider">Beauty & Care For Everyone ✨</p>
            </div>
          </button>
          
          <nav className="hidden md:flex items-center space-x-6">
            {beautyCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="px-4 py-2 rounded-pill bg-pastel-pink/50 hover:bg-pink-200 text-soft-700 hover:text-pink-700 transition-all duration-300 font-medium text-sm tracking-wide hover:scale-105 hover:shadow-soft"
              >
                {category.name}
              </button>
            ))}
          </nav>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={onCartClick}
              className="relative p-3 text-soft-600 hover:text-pink-600 hover:bg-pink-100 rounded-cute transition-all duration-300 group"
            >
              <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-pill h-6 w-6 flex items-center justify-center animate-bounce-cute font-bold shadow-cute">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;