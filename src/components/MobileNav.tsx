import React from 'react';
import { useCategories } from '../hooks/useCategories';

interface MobileNavProps {
  activeCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeCategory, onCategoryClick }) => {
  const { categories } = useCategories();

  return (
    <div className="sticky top-20 z-40 bg-black-900/90 backdrop-blur-md border-b border-black-200/20 md:hidden shadow-soft">
      <div className="flex overflow-x-auto scrollbar-hide px-4 py-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryClick(category.id)}
            className={`flex-shrink-0 flex items-center space-x-3 px-6 py-4 rounded-2xl mr-4 transition-all duration-300 ${
              activeCategory === category.id
                ? 'bg-gradient-to-r from-black-700 to-black-800 text-white shadow-medium'
                : 'bg-black-100/80 text-black-700 hover:bg-black-200/80 hover:text-black-900 backdrop-blur-sm'
            }`}
          >
            <span className="text-xl">{category.icon}</span>
            <span className="text-sm font-bold whitespace-nowrap tracking-wide">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileNav;