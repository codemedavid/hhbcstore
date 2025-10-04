import React, { useState } from 'react';
import { X, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Product, MenuItem, Variation, AddOn } from '../types';

interface VariationSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: Product | MenuItem, quantity: number, variation?: Variation, addOns?: AddOn[]) => void;
  item: Product | MenuItem;
  itemType: 'product' | 'menu';
}

const VariationSelectionModal: React.FC<VariationSelectionModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  item,
  itemType
}) => {
  const [selectedVariation, setSelectedVariation] = useState<Variation | undefined>(
    item.variations?.[0]
  );
  const [selectedAddOns, setSelectedAddOns] = useState<(AddOn & { quantity: number })[]>([]);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const calculatePrice = () => {
    const basePrice = itemType === 'product' 
      ? (item as Product).discountedPrice || (item as Product).basePrice
      : (item as MenuItem).discountedPrice || (item as MenuItem).basePrice;
    
    let price = basePrice;
    if (selectedVariation) {
      price += selectedVariation.price;
    }
    selectedAddOns.forEach(addOn => {
      price += addOn.price * addOn.quantity;
    });
    return price * quantity;
  };

  const handleAddToCart = () => {
    // Convert selectedAddOns back to regular AddOn array for cart
    const addOnsForCart: AddOn[] = selectedAddOns.flatMap(addOn => 
      Array(addOn.quantity).fill({ ...addOn, quantity: undefined })
    );
    
    onAddToCart(item, quantity, selectedVariation, addOnsForCart);
    onClose();
    // Reset state
    setSelectedVariation(item.variations?.[0]);
    setSelectedAddOns([]);
    setQuantity(1);
  };

  const updateAddOnQuantity = (addOn: AddOn, newQuantity: number) => {
    setSelectedAddOns(prev => {
      const existingIndex = prev.findIndex(a => a.id === addOn.id);
      
      if (newQuantity === 0) {
        return prev.filter(a => a.id !== addOn.id);
      }
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQuantity };
        return updated;
      } else {
        return [...prev, { ...addOn, quantity: newQuantity }];
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

  const hasVariations = item.variations && item.variations.length > 0;
  const hasAddOns = item.addOns && item.addOns.length > 0;
  const requiresSelection = hasVariations || hasAddOns;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-gray-200 p-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {hasVariations ? 'Choose Options' : 'Customize'} {item.name}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200 text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Item Image */}
          <div className="mb-6">
            <img
              key={selectedVariation?.id || 'default'} // Force re-render when variation changes
              src={(() => {
                // Show variation image if selected, otherwise show product image
                if (selectedVariation) {
                  // Check for database image_url first, then fallback to images array
                  if (selectedVariation.image_url) {
                    return selectedVariation.image_url;
                  }
                  if (selectedVariation.images && selectedVariation.images.length > 0) {
                    return selectedVariation.images[0];
                  }
                }
                return item.images && item.images.length > 0 ? item.images[0] : '/placeholder-product.jpg';
              })()}
              alt={selectedVariation ? `${item.name} - ${selectedVariation.name}` : item.name}
              className="w-full h-32 object-cover rounded-xl border border-gray-200 transition-all duration-500 ease-in-out"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-product.jpg';
              }}
            />
          </div>

          {/* Size Variations */}
          {hasVariations && (
            <div className="mb-6">
              <h4 className="font-bold text-gray-900 mb-4 text-lg">Choose Variant</h4>
                  <div className="space-y-3">
                    {item.variations!.map((variation) => (
                      <label
                        key={variation.id}
                        className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedVariation?.id === variation.id
                            ? 'border-pink-400 bg-pink-50 shadow-md'
                            : 'border-gray-200 hover:border-pink-400 hover:bg-pink-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="variation"
                            checked={selectedVariation?.id === variation.id}
                            onChange={() => setSelectedVariation(variation)}
                            className="text-pink-600 focus:ring-pink-500"
                          />
                          <div className="flex items-center space-x-3">
                            {/* Variation Preview Image */}
                            <div className="relative">
                              <img
                                src={variation.image_url || (variation.images && variation.images.length > 0 ? variation.images[0] : item.images[0]) || '/placeholder-product.jpg'}
                                alt={variation.name}
                                className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder-product.jpg';
                                }}
                              />
                              {selectedVariation?.id === variation.id && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                            <span className="font-semibold text-gray-900">{variation.name}</span>
                          </div>
                        </div>
                        <span className="text-pink-600 font-bold text-lg">
                          ₱{((itemType === 'product' 
                            ? (item as Product).discountedPrice || (item as Product).basePrice
                            : (item as MenuItem).discountedPrice || (item as MenuItem).basePrice) + variation.price)}
                        </span>
                      </label>
                    ))}
                  </div>
            </div>
          )}

          {/* Add-ons */}
          {hasAddOns && groupedAddOns && Object.keys(groupedAddOns).length > 0 && (
            <div className="mb-6">
              <h4 className="font-bold text-gray-900 mb-4 text-lg">Add-ons (Optional)</h4>
              {Object.entries(groupedAddOns).map(([category, addOns]) => (
                <div key={category} className="mb-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3 capitalize">
                    {category.replace('-', ' ')}
                  </h5>
                  <div className="space-y-3">
                    {addOns.map((addOn) => (
                      <div
                        key={addOn.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-pink-400 hover:bg-pink-50 transition-all duration-200"
                      >
                        <div className="flex-1">
                          <span className="font-semibold text-gray-900">{addOn.name}</span>
                          <div className="text-sm text-gray-600">
                            {addOn.price > 0 ? `₱${addOn.price} each` : 'Free'}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {selectedAddOns.find(a => a.id === addOn.id) ? (
                            <div className="flex items-center space-x-2 bg-pink-100 rounded-full p-1 border border-pink-200">
                              <button
                                type="button"
                                onClick={() => {
                                  const current = selectedAddOns.find(a => a.id === addOn.id);
                                  updateAddOnQuantity(addOn, (current?.quantity || 1) - 1);
                                }}
                                className="p-1 hover:bg-pink-200 rounded-full transition-colors duration-200 text-pink-700"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="font-bold text-gray-900 min-w-[20px] text-center text-sm">
                                {selectedAddOns.find(a => a.id === addOn.id)?.quantity || 0}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const current = selectedAddOns.find(a => a.id === addOn.id);
                                  updateAddOnQuantity(addOn, (current?.quantity || 0) + 1);
                                }}
                                className="p-1 hover:bg-pink-200 rounded-full transition-colors duration-200 text-pink-700"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => updateAddOnQuantity(addOn, 1)}
                              className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-full hover:from-pink-700 hover:to-pink-800 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-pink-500/25"
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

          {/* Quantity Selector */}
          <div className="mb-6">
            <h4 className="font-bold text-gray-900 mb-4 text-lg">Quantity</h4>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200 text-gray-700"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="font-bold text-gray-900 text-xl min-w-[40px] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200 text-gray-700"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Price Summary */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex items-center justify-between text-2xl font-bold text-gray-900">
              <span>Total:</span>
              <span className="text-pink-600">₱{calculatePrice().toLocaleString()}</span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={hasVariations && !selectedVariation}
            className={`w-full py-4 rounded-xl transition-all duration-200 font-bold flex items-center justify-center space-x-2 text-lg ${
              hasVariations && !selectedVariation
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-600 to-pink-700 text-white hover:from-pink-700 hover:to-pink-800 shadow-lg hover:shadow-pink-500/25'
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>
              {hasVariations && !selectedVariation 
                ? 'Please select a size' 
                : `Add to Cart - ₱${calculatePrice().toLocaleString()}`
              }
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariationSelectionModal;
