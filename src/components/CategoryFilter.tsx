import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories?: Category[];
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: CategoryFilterProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCategoryClick = (categoryId: string, hasSubcategories: boolean) => {
    if (hasSubcategories) {
      setActiveDropdown(activeDropdown === categoryId ? null : categoryId);
    } else {
      onCategoryChange(categoryId);
      setActiveDropdown(null);
    }
  };

  const handleSubcategoryClick = (subcategoryId: string) => {
    onCategoryChange(subcategoryId);
    setActiveDropdown(null);
  };

  return (
    <div className="flex flex-wrap gap-2 relative" ref={dropdownRef}>
      {categories.map((category) => {
        const hasSubcategories = category.subcategories && category.subcategories.length > 0;
        const isActive = selectedCategory === category.id;
        const isDropdownOpen = activeDropdown === category.id;

        return (
          <div key={category.id} className="relative">
            <button
              onClick={() => handleCategoryClick(category.id, hasSubcategories)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-floating scale-105'
                  : 'bg-pastel-white text-soft-700 border border-pink-200 hover:bg-pink-100 hover:border-pink-300 hover:scale-105 shadow-soft'
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              <span className="text-sm font-semibold">{category.name}</span>
              {hasSubcategories && (
                <ChevronDown 
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              )}
            </button>

            {/* Subcategory Dropdown */}
            {hasSubcategories && isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-pink-200 rounded-lg shadow-lg z-50 min-w-[200px]">
                <div className="py-2">
                  {category.subcategories!.map((subcategory) => (
                    <button
                      key={subcategory.id}
                      onClick={() => handleSubcategoryClick(subcategory.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-pink-50 transition-colors duration-200 ${
                        selectedCategory === subcategory.id
                          ? 'bg-pink-100 text-pink-700 font-semibold'
                          : 'text-gray-700'
                      }`}
                    >
                      <span className="text-lg">{subcategory.icon}</span>
                      <span className="text-sm">{subcategory.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
