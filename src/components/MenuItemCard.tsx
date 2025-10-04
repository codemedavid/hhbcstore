import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { MenuItem, Variation, AddOn } from '../types';
import VariationSelectionModal from './VariationSelectionModal';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity?: number, variation?: Variation, addOns?: AddOn[]) => void;
  quantity: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ 
  item, 
  onAddToCart, 
  quantity, 
  onUpdateQuantity 
}) => {
  const [showVariationModal, setShowVariationModal] = useState(false);


  const handleAddToCart = () => {
    if (item.variations?.length || item.addOns?.length) {
      setShowVariationModal(true);
    } else {
      onAddToCart(item, 1);
    }
  };

  const handleAddToCartFromModal = (item: MenuItem, quantity: number, variation?: Variation, addOns?: AddOn[]) => {
    onAddToCart(item, quantity, variation, addOns);
  };

  const handleIncrement = () => {
    onUpdateQuantity(item.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onUpdateQuantity(item.id, quantity - 1);
    }
  };


  return (
    <>
      <div className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-soft hover:shadow-large transition-all duration-500 overflow-hidden group animate-scale-in border border-black-200/40 hover:border-black-300/60 ${!item.available ? 'opacity-60' : ''}`}>
        {item.popular && (
          <div className="bg-gradient-to-r from-black-700 to-black-800 text-white text-xs font-bold px-4 py-2 rounded-full absolute top-4 right-4 z-10 shadow-medium">
            POPULAR
          </div>
        )}
        
        {!item.available && (
          <div className="bg-gradient-to-r from-black-600 to-black-700 text-white text-xs font-bold px-4 py-2 rounded-full absolute top-4 left-4 z-10 shadow-medium">
            UNAVAILABLE
          </div>
        )}
        
        <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-black-50/60 to-brown-50/60 relative overflow-hidden">
          {item.images && item.images.length > 0 ? (
            <img
              src={item.images[0]}
              alt={item.name}
              className="w-full h-48 object-cover transition-opacity duration-300"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
              onLoad={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              style={{ opacity: 0 }}
            />
          ) : null}
          <div className={`absolute inset-0 flex items-center justify-center ${item.images && item.images.length > 0 ? 'hidden' : ''}`}>
            <div className="text-6xl opacity-30">☕</div>
          </div>
        </div>
        
        <div className="p-8">
          <h4 className="text-2xl font-noto font-bold text-black-900 mb-4 tracking-tight">{item.name}</h4>
          <p className={`text-sm mb-6 leading-relaxed ${!item.available ? 'text-brown-400' : 'text-brown-600'}`}>
            {!item.available ? 'Currently Unavailable' : item.description}
          </p>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              {item.discountedPrice ? (
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-green-600">
                    ₱{item.discountedPrice}
                  </span>
                  <span className="text-xl text-gray-400 line-through">
                    ₱{item.basePrice}
                  </span>
                  {item.variations && item.variations.length > 0 && (
                    <span className="text-sm text-black-600 font-normal">starting</span>
                  )}
                </div>
              ) : (
                <span className="text-3xl font-bold text-black-800">
                  ₱{item.basePrice}
                  {item.variations && item.variations.length > 0 && (
                    <span className="text-sm text-black-600 ml-2 font-normal">starting</span>
                  )}
                </span>
              )}
              {item.variations && item.variations.length > 0 && (
                <div className="text-xs text-black-600 mt-1 font-medium">
                  {item.variations.length} size{item.variations.length > 1 ? 's' : ''} available
                </div>
              )}
            </div>
            
            {!item.available ? (
              <button
                disabled
                className="bg-black-200 text-black-500 px-8 py-3 rounded-2xl cursor-not-allowed font-semibold"
              >
                Unavailable
              </button>
            ) : quantity === 0 ? (
              <button
                onClick={handleAddToCart}
                className="bg-gradient-to-r from-black-700 to-black-800 text-white px-8 py-3 rounded-2xl hover:from-black-600 hover:to-black-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-medium hover:shadow-glow group relative overflow-hidden border border-brown-600/30"
              >
                <span className="relative z-10">{item.variations?.length || item.addOns?.length ? 'Customize' : 'Add to Cart'}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-brown-500/20 to-brown-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            ) : (
              <div className="flex items-center space-x-3 bg-black-100/80 rounded-2xl p-2 border border-black-200/50 backdrop-blur-sm">
                <button
                  onClick={handleDecrement}
                  className="p-2 hover:bg-black-200 rounded-xl transition-colors duration-200 text-black-700 hover:text-black-900"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-bold text-black-900 min-w-[28px] text-center text-lg">{quantity}</span>
                <button
                  onClick={handleIncrement}
                  className="p-2 hover:bg-black-200 rounded-xl transition-colors duration-200 text-black-700 hover:text-black-900"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {item.addOns && item.addOns.length > 0 && (
            <div className="text-xs text-brown-500">
              {item.addOns.length} add-on{item.addOns.length > 1 ? 's' : ''} available
            </div>
          )}
        </div>
      </div>

      {/* Variation Selection Modal */}
      <VariationSelectionModal
        isOpen={showVariationModal}
        onClose={() => setShowVariationModal(false)}
        onAddToCart={handleAddToCartFromModal}
        item={item}
        itemType="menu"
      />
    </>
  );
};

export default MenuItemCard;