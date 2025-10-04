import { useState } from 'react';
import { Product, CartItem, Variation, AddOn } from '../types';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import VariationSelectionModal from './VariationSelectionModal';

interface ProductCardProps {
  product: Product;
  addToCart: (item: Product, quantity: number, variation?: Variation, addOns?: AddOn[]) => boolean;
  cartItems: CartItem[];
}

export default function ProductCard({ product, addToCart, cartItems }: ProductCardProps) {
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isInCart = cartItems.some(item => item.id === product.id);

  const calculateTotalPrice = () => {
    return product.discountedPrice || product.basePrice;
  };

  const handleAddToCart = () => {
    // Check if product has variations or add-ons that require selection
    if ((product.variations && product.variations.length > 0) || (product.addOns && product.addOns.length > 0)) {
      setShowVariationModal(true);
    } else {
      // Direct add to cart for products without variations
      const success = addToCart(product, 1);
      if (success) {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
      }
    }
  };

  const handleAddToCartFromModal = (item: Product, quantity: number, variation?: Variation, addOns?: AddOn[]) => {
    const success = addToCart(item, quantity, variation, addOns);
    if (success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const getDisplayImage = () => {
    return product.images[0] || '/placeholder-product.jpg';
  };

  return (
    <div className="bg-pastel-white rounded-cute shadow-cute hover:shadow-floating transition-all duration-300 overflow-hidden group border border-pink-100/50">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-cute">
        <img
          src={getDisplayImage()}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.popular && (
            <span className="bg-pink-400 text-white text-xs px-3 py-1 rounded-pill font-medium shadow-soft animate-pulse-soft">
              ⭐ Popular
            </span>
          )}
          {product.stock && product.stock < 10 && (
            <span className="bg-orange-400 text-white text-xs px-3 py-1 rounded-pill font-medium shadow-soft">
              ⚠️ Low Stock
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="p-2 bg-pastel-white/90 backdrop-blur-sm rounded-pill shadow-soft hover:bg-pink-100 transition-colors hover:scale-110">
            <Heart className="w-4 h-4 text-pink-500" />
          </button>
          <button 
            onClick={() => {/* TODO: Implement product details modal */}}
            className="p-2 bg-pastel-white/90 backdrop-blur-sm rounded-pill shadow-soft hover:bg-blue-100 transition-colors hover:scale-110"
          >
            <Eye className="w-4 h-4 text-blue-500" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-pink-500 mb-2 font-medium">✨ {product.brand}</p>
        )}
        
        {/* Name */}
        <h3 className="font-bold text-soft-800 mb-3 line-clamp-2 text-lg">
          {product.name}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-soft-600 mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Variations Info */}
        {product.variations && product.variations.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-soft-700 mb-2">
              🎨 {product.variations.length} size{product.variations.length > 1 ? 's' : ''} available
            </p>
            <div className="flex flex-wrap gap-2">
              {product.variations.slice(0, 3).map((variation) => (
                <span
                  key={variation.id}
                  className="px-3 py-1 text-xs rounded-pill border bg-pastel-pink/50 border-pink-200 text-soft-700"
                >
                  {variation.name}
                </span>
              ))}
              {product.variations.length > 3 && (
                <span className="text-xs text-soft-500 px-2 py-1">
                  +{product.variations.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Add-ons Info */}
        {product.addOns && product.addOns.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-soft-700 mb-2">
              ✨ {product.addOns.length} add-on{product.addOns.length > 1 ? 's' : ''} available
            </p>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div>
            {product.discountedPrice ? (
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-green-600">
                  ₱{calculateTotalPrice().toLocaleString()}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ₱{product.basePrice.toLocaleString()}
                </span>
                {(product.variations && product.variations.length > 0) && (
                  <span className="text-sm text-pink-500">
                    starting
                  </span>
                )}
              </div>
            ) : (
              <div>
                <span className="text-xl font-bold text-soft-800">
                  ₱{calculateTotalPrice().toLocaleString()}
                  {(product.variations && product.variations.length > 0) && (
                    <span className="text-sm text-pink-500 ml-2">
                      starting
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
          {product.weight && (
            <span className="text-xs text-soft-500 bg-pastel-blue/50 px-2 py-1 rounded-pill">{product.weight}</span>
          )}
        </div>

        {/* Add to Cart */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddToCart}
            disabled={!product.available || (product.stock ?? 0) <= 0}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-cute font-bold transition-all duration-200 ${
              justAdded
                ? 'bg-green-500 text-white animate-pulse'
                : isInCart
                ? 'bg-pink-200 text-pink-700 border border-pink-300 shadow-soft'
                : product.available && (product.stock ?? 0) > 0
                ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white hover:from-pink-500 hover:to-pink-600 shadow-floating hover:scale-105'
                : 'bg-soft-300 text-soft-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {justAdded 
              ? '✅ Added!' 
              : isInCart 
              ? '✨ In Cart' 
              : ((product.variations && product.variations.length > 0) || (product.addOns && product.addOns.length > 0))
              ? '🎨 Customize & Add'
              : product.available && (product.stock ?? 0) > 0 
              ? '🛍️ Add to Cart' 
              : '😔 Out of Stock'
            }
          </button>
        </div>

        {/* Stock Status */}
        <div className="mt-3 text-center">
          {(() => {
            const availableStock = product.stock ?? 0;
            if (availableStock > 0) {
              return (
                <p className="text-xs text-soft-500">
                  📦 {availableStock} in stock
                </p>
              );
            } else {
              return (
                <p className="text-xs text-red-500 font-medium">
                  😔 Out of stock
                </p>
              );
            }
          })()}
        </div>
      </div>

      {/* Variation Selection Modal */}
      <VariationSelectionModal
        isOpen={showVariationModal}
        onClose={() => setShowVariationModal(false)}
        onAddToCart={handleAddToCartFromModal}
        item={product}
        itemType="product"
      />
    </div>
  );
}
