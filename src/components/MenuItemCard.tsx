import React, { useState } from 'react';
import { Plus, Minus, X, ShoppingCart } from 'lucide-react';
import { MenuItem, Variation, AddOn } from '../types';

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
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<Variation | undefined>(
    item.variations?.[0]
  );
  const [selectedAddOns, setSelectedAddOns] = useState<(AddOn & { quantity: number })[]>([]);

  const calculatePrice = () => {
    let price = item.basePrice;
    if (selectedVariation) {
      price = item.basePrice + selectedVariation.price;
    }
    selectedAddOns.forEach(addOn => {
      price += addOn.price * addOn.quantity;
    });
    return price;
  };

  const handleAddToCart = () => {
    if (item.variations?.length || item.addOns?.length) {
      setShowCustomization(true);
    } else {
      onAddToCart(item, 1);
    }
  };

  const handleCustomizedAddToCart = () => {
    // Convert selectedAddOns back to regular AddOn array for cart
    const addOnsForCart: AddOn[] = selectedAddOns.flatMap(addOn => 
      Array(addOn.quantity).fill({ ...addOn, quantity: undefined })
    );
    onAddToCart(item, 1, selectedVariation, addOnsForCart);
    setShowCustomization(false);
    setSelectedAddOns([]);
  };

  const handleIncrement = () => {
    onUpdateQuantity(item.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onUpdateQuantity(item.id, quantity - 1);
    }
  };

  const updateAddOnQuantity = (addOn: AddOn, quantity: number) => {
    setSelectedAddOns(prev => {
      const existingIndex = prev.findIndex(a => a.id === addOn.id);
      
      if (quantity === 0) {
        // Remove add-on if quantity is 0
        return prev.filter(a => a.id !== addOn.id);
      }
      
      if (existingIndex >= 0) {
        // Update existing add-on quantity
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity };
        return updated;
      } else {
        // Add new add-on with quantity
        return [...prev, { ...addOn, quantity }];
      }
    });
  };

  const groupedAddOns = item.addOns?.reduce((groups, addOn) => {
    const category = addOn.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(addOn);
    return groups;
  }, {} as Record<string, AddOn[]>);

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
          {item.image ? (
            <img
              src={item.image}
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
          <div className={`absolute inset-0 flex items-center justify-center ${item.image ? 'hidden' : ''}`}>
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
              <span className="text-3xl font-bold text-black-800">
                ₱{item.basePrice}
                {item.variations && item.variations.length > 0 && (
                  <span className="text-sm text-black-600 ml-2 font-normal">starting</span>
                )}
              </span>
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

      {/* Customization Modal */}
      {showCustomization && (
        <div className="fixed inset-0 bg-black-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-brown-200">
            <div className="sticky top-0 bg-gradient-to-r from-brown-50 to-green-50 border-b border-brown-200 p-6 flex items-center justify-between">
              <h3 className="text-xl font-noto font-bold text-black-900">Customize {item.name}</h3>
              <button
                onClick={() => setShowCustomization(false)}
                className="p-2 hover:bg-brown-200 rounded-full transition-colors duration-200 text-brown-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Size Variations */}
              {item.variations && item.variations.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-black-900 mb-4 text-lg">Choose Size</h4>
                  <div className="space-y-3">
                    {item.variations.map((variation) => (
                      <label
                        key={variation.id}
                        className="flex items-center justify-between p-4 border-2 border-brown-200 rounded-xl hover:border-green-400 hover:bg-green-50 cursor-pointer transition-all duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="variation"
                            checked={selectedVariation?.id === variation.id}
                            onChange={() => setSelectedVariation(variation)}
                            className="text-green-600 focus:ring-green-500"
                          />
                          <span className="font-semibold text-black-900">{variation.name}</span>
                        </div>
                        <span className="text-green-600 font-bold text-lg">
                          ₱{item.basePrice + variation.price}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {groupedAddOns && Object.keys(groupedAddOns).length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-black-900 mb-4 text-lg">Add-ons</h4>
                  {Object.entries(groupedAddOns).map(([category, addOns]) => (
                    <div key={category} className="mb-4">
                      <h5 className="text-sm font-semibold text-brown-700 mb-3 capitalize">
                        {category.replace('-', ' ')}
                      </h5>
                      <div className="space-y-3">
                        {addOns.map((addOn) => (
                          <div
                            key={addOn.id}
                            className="flex items-center justify-between p-4 border border-brown-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all duration-200"
                          >
                            <div className="flex-1">
                              <span className="font-semibold text-black-900">{addOn.name}</span>
                              <div className="text-sm text-brown-600">
                                {addOn.price > 0 ? `₱${addOn.price} each` : 'Free'}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {selectedAddOns.find(a => a.id === addOn.id) ? (
                                <div className="flex items-center space-x-2 bg-green-100 rounded-full p-1 border border-green-200">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = selectedAddOns.find(a => a.id === addOn.id);
                                      updateAddOnQuantity(addOn, (current?.quantity || 1) - 1);
                                    }}
                                    className="p-1 hover:bg-green-200 rounded-full transition-colors duration-200 text-green-700"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="font-bold text-black-900 min-w-[20px] text-center text-sm">
                                    {selectedAddOns.find(a => a.id === addOn.id)?.quantity || 0}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = selectedAddOns.find(a => a.id === addOn.id);
                                      updateAddOnQuantity(addOn, (current?.quantity || 0) + 1);
                                    }}
                                    className="p-1 hover:bg-green-200 rounded-full transition-colors duration-200 text-green-700"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => updateAddOnQuantity(addOn, 1)}
                                  className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-green-500/25"
                                >
                                  <Plus className="h-3 w-3" />
                                  <span>Add</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Summary */}
              <div className="border-t border-brown-200 pt-4 mb-6">
                <div className="flex items-center justify-between text-2xl font-noto font-bold text-black-900">
                  <span>Total:</span>
                  <span className="text-green-600">₱{calculatePrice()}</span>
                </div>
              </div>

              <button
                onClick={handleCustomizedAddToCart}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-bold flex items-center justify-center space-x-2 shadow-lg hover:shadow-green-500/25 text-lg"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart - ₱{calculatePrice()}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuItemCard;