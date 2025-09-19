import React, { useState } from 'react';
import { Product, CartItem } from '../types';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import SearchBar from './SearchBar';

interface ProductCatalogProps {
  products: Product[];
  addToCart: (item: CartItem) => void;
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  selectedCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
}

const CATEGORIES = [
  { id: 'all', name: 'All Products', icon: '🛍️' },
  { 
    id: 'hair-care', 
    name: 'Hair Care', 
    icon: '💇‍♀️',
    subcategories: [
      { id: 'hair-care-shampoo', name: 'Shampoo', icon: '🧴' },
      { id: 'hair-care-conditioner', name: 'Conditioner', icon: '💧' },
      { id: 'hair-care-treatment', name: 'Treatment', icon: '✨' },
      { id: 'hair-care-styling', name: 'Styling', icon: '🎨' }
    ]
  },
  { 
    id: 'cosmetics', 
    name: 'Cosmetics', 
    icon: '💄',
    subcategories: [
      { id: 'cosmetics-foundation', name: 'Foundation', icon: '🎭' },
      { id: 'cosmetics-lipstick', name: 'Lipstick', icon: '💋' },
      { id: 'cosmetics-eyeshadow', name: 'Eyeshadow', icon: '👁️' },
      { id: 'cosmetics-mascara', name: 'Mascara', icon: '👀' }
    ]
  },
  { 
    id: 'skin-care', 
    name: 'Skin Care', 
    icon: '✨',
    subcategories: [
      { id: 'skin-care-cleanser', name: 'Cleanser', icon: '🧼' },
      { id: 'skin-care-moisturizer', name: 'Moisturizer', icon: '💧' },
      { id: 'skin-care-serum', name: 'Serum', icon: '💎' },
      { id: 'skin-care-mask', name: 'Face Mask', icon: '🎭' }
    ]
  },
  { 
    id: 'nail-care', 
    name: 'Nail Care', 
    icon: '💅',
    subcategories: [
      { id: 'nail-care-polish', name: 'Nail Polish', icon: '💅' },
      { id: 'nail-care-remover', name: 'Nail Polish Remover', icon: '🧽' },
      { id: 'nail-care-tools', name: 'Nail Tools', icon: '✂️' },
      { id: 'nail-care-treatment', name: 'Nail Treatment', icon: '💪' }
    ]
  }
];

export default function ProductCatalog({ products, addToCart, cartItems, updateQuantity, selectedCategory: propSelectedCategory, onCategoryChange }: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState(propSelectedCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'popular'>('popular');

  // Sync prop with local state
  React.useEffect(() => {
    if (propSelectedCategory) {
      setSelectedCategory(propSelectedCategory);
    }
  }, [propSelectedCategory]);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price-low':
        return a.basePrice - b.basePrice;
      case 'price-high':
        return b.basePrice - a.basePrice;
      case 'popular':
        return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
      default:
        return 0;
    }
  });

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto" data-catalog>
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold text-soft-800 mb-6 animate-fade-in">
          ✨ Discover Our Premium Collection ✨
        </h2>
        <p className="text-xl text-soft-600 max-w-3xl mx-auto leading-relaxed">
          Explore our curated selection of premium  products for hair, skin, cosmetics, and nail care 💕
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-12 space-y-6">
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="🔍 Search products, brands, or ingredients..."
        />
        
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <CategoryFilter
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onCategoryChange={(categoryId: string) => {
              setSelectedCategory(categoryId);
              if (onCategoryChange) {
                onCategoryChange(categoryId);
              }
            }}
          />
          
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-soft-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-pink-200 rounded-cute focus:ring-2 focus:ring-pink-400 focus:border-pink-400 bg-pastel-white shadow-soft"
            >
              <option value="popular">⭐ Most Popular</option>
              <option value="name">🔤 Name A-Z</option>
              <option value="price-low">💰 Price: Low to High</option>
              <option value="price-high">💎 Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
              cartItems={cartItems}
              updateQuantity={updateQuantity}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-8xl mb-6 animate-bounce-cute">🔍</div>
          <h3 className="text-2xl font-semibold text-soft-700 mb-3">No products found</h3>
          <p className="text-soft-500 text-lg">
            Try adjusting your search or filter criteria ✨
          </p>
        </div>
      )}

      {/* Results count */}
      <div className="mt-12 text-center text-sm text-soft-500 bg-pastel-pink/30 rounded-cute px-4 py-2 inline-block">
        ✨ Showing {sortedProducts.length} of {products.length} products ✨
      </div>
    </div>
  );
}
