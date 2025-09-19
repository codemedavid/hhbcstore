import React, { useState } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { CartItem, PaymentMethod, ShippingMethod } from '../types';
import { usePaymentMethods } from '../hooks/usePaymentMethods';

interface CheckoutProps {
  cartItems: CartItem[];
  totalPrice: number;
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, totalPrice, onBack }) => {
  const { paymentMethods } = usePaymentMethods();
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Philippines'
  });
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('lbc-standard');
  const [shippingFee, setShippingFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Set default payment method when payment methods are loaded
  React.useEffect(() => {
    if (paymentMethods.length > 0 && !paymentMethod) {
      setPaymentMethod(paymentMethods[0].id as PaymentMethod);
    }
  }, [paymentMethods, paymentMethod]);

  const selectedPaymentMethod = paymentMethods.find(method => method.id === paymentMethod);

  const handleProceedToPayment = () => {
    setStep('payment');
  };

  const handlePlaceOrder = () => {
    const totalWithShipping = totalPrice + shippingFee;
    
    const orderDetails = `
🛍️ H&HBC SHOPPE ORDER

👤 Customer: ${customerName}
📞 Contact: ${contactNumber}

🚚 SHIPPING ADDRESS:
${shippingAddress.street}
${shippingAddress.city}, ${shippingAddress.province} ${shippingAddress.postalCode}
${shippingAddress.country}

📦 Shipping Method: ${shippingMethod.replace('lbc-', '').toUpperCase()}

📋 ORDER DETAILS:
${cartItems.map(item => {
  let itemDetails = `• ${item.name}`;
  if (item.selectedVariation) {
    itemDetails += ` (${item.selectedVariation.name})`;
  }
  if (item.selectedAddOns && item.selectedAddOns.length > 0) {
    itemDetails += ` + ${item.selectedAddOns.map(addOn => 
      addOn.quantity && addOn.quantity > 1 
        ? `${addOn.name} x${addOn.quantity}`
        : addOn.name
    ).join(', ')}`;
  }
  itemDetails += ` x${item.quantity} - ₱${item.totalPrice}`;
  return itemDetails;
}).join('\n')}

💰 SUBTOTAL: ₱${totalPrice}
🚚 SHIPPING FEE: ₱${shippingFee}
💰 TOTAL: ₱${totalWithShipping}

💳 Payment: ${selectedPaymentMethod?.name || paymentMethod}
📸 Payment Screenshot: Please attach your payment receipt screenshot

${notes ? `📝 Notes: ${notes}` : ''}

Please confirm this order to proceed. Thank you for choosing H&HBC SHOPPE! 💄✨
    `.trim();

    const encodedMessage = encodeURIComponent(orderDetails);
    const messengerUrl = `https://m.me/100082987099531?text=${encodedMessage}`;
    
    window.open(messengerUrl, '_blank');
    
  };

  const isDetailsValid = customerName && contactNumber && 
    shippingAddress.street && shippingAddress.city && shippingAddress.province && shippingAddress.postalCode;

  if (step === 'details') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-brown-600 hover:text-black-900 transition-colors duration-200 font-semibold"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Cart</span>
          </button>
          <h1 className="text-4xl font-noto font-bold text-black-900 ml-8">Order Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-noto font-medium text-black mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-red-100">
                  <div>
                    <h4 className="font-medium text-black">{item.name}</h4>
                    {item.selectedVariation && (
                      <p className="text-sm text-gray-600">Size: {item.selectedVariation.name}</p>
                    )}
                    {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                      <p className="text-sm text-gray-600">
                        Add-ons: {item.selectedAddOns.map(addOn => addOn.name).join(', ')}
                      </p>
                    )}
                    <div className="text-sm text-gray-600">
                      {item.discountedPrice ? (
                        <div className="flex items-center gap-2">
                          <span className="line-through text-gray-400">₱{item.basePrice}</span>
                          <span className="text-green-600 font-semibold">₱{item.discountedPrice}</span>
                          <span className="text-xs text-green-500">(Save ₱{item.basePrice - item.discountedPrice})</span>
                        </div>
                      ) : (
                        <span>₱{item.basePrice}</span>
                      )}
                      <span className="block text-xs text-gray-500">per item x {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-black">₱{item.totalPrice}</span>
                    {item.discountedPrice && (
                      <div className="text-xs text-green-500">
                        Saved: ₱{(item.basePrice - item.discountedPrice) * item.quantity}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-pink-200 pt-4 space-y-2">
              {(() => {
                const totalSavings = cartItems.reduce((total, item) => {
                  if (item.discountedPrice) {
                    return total + ((item.basePrice - item.discountedPrice) * item.quantity);
                  }
                  return total;
                }, 0);
                
                const originalTotal = cartItems.reduce((total, item) => {
                  return total + (item.basePrice * item.quantity);
                }, 0);
                
                return totalSavings > 0 ? (
                  <>
                    <div className="flex items-center justify-between text-lg">
                      <span>Original Total:</span>
                      <span className="line-through text-gray-400">₱{originalTotal}</span>
                    </div>
                    <div className="flex items-center justify-between text-lg text-green-600">
                      <span>You Saved:</span>
                      <span className="font-semibold">₱{totalSavings}</span>
                    </div>
                  </>
                ) : null;
              })()}
              <div className="flex items-center justify-between text-lg">
                <span>Subtotal:</span>
                <span>₱{totalPrice}</span>
              </div>
              <div className="flex items-center justify-between text-lg">
                <span>Shipping:</span>
                <span>₱{shippingFee}</span>
              </div>
              <div className="flex items-center justify-between text-2xl font-noto font-semibold text-black border-t border-pink-200 pt-2">
                <span>Total:</span>
                <span>₱{totalPrice + shippingFee}</span>
              </div>
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-noto font-medium text-black mb-6">Customer Information</h2>
            
            <form className="space-y-6">
              {/* Customer Information */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Full Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Contact Number *</label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="09XX XXX XXXX"
                  required
                />
              </div>


              {/* Shipping Method */}
              <div>
                <label className="block text-sm font-medium text-black mb-3">Shipping Method *</label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { value: 'lbc-standard', label: 'LBC Standard (3-5 days)', icon: '📦', fee: 120 },
                    { value: 'lbc-express', label: 'LBC Express (1-2 days)', icon: '⚡', fee: 200 },
                    { value: 'lbc-same-day', label: 'LBC Same Day', icon: '🚀', fee: 350 }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setShippingMethod(option.value as ShippingMethod);
                        setShippingFee(option.fee);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        shippingMethod === option.value
                          ? 'border-pink-600 bg-pink-600 text-white'
                          : 'border-pink-300 bg-white text-gray-700 hover:border-pink-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{option.icon}</span>
                          <span className="font-medium">{option.label}</span>
                        </div>
                        <span className="font-bold">₱{option.fee}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Street Address *</label>
                <input
                  type="text"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                  className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  placeholder="House number, street name, barangay"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">City *</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Province *</label>
                  <input
                    type="text"
                    value={shippingAddress.province}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, province: e.target.value }))}
                    className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    placeholder="Province"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Postal Code *</label>
                  <input
                    type="text"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                    className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    placeholder="1234"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Country</label>
                  <input
                    type="text"
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    placeholder="Country"
                    required
                  />
                </div>
              </div>

              {/* Special Notes */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Special Instructions</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Any special requests or notes..."
                  rows={3}
                />
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={!isDetailsValid}
                className={`w-full py-4 rounded-xl font-medium text-lg transition-all duration-200 transform ${
                  isDetailsValid
                    ? 'bg-red-600 text-white hover:bg-red-700 hover:scale-[1.02]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Proceed to Payment
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Payment Step
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => setStep('details')}
          className="flex items-center space-x-2 text-brown-600 hover:text-black-900 transition-colors duration-200 font-semibold"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Details</span>
        </button>
        <h1 className="text-4xl font-noto font-bold text-black-900 ml-8">Payment</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Method Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-noto font-medium text-black mb-6">Choose Payment Method</h2>
          
          <div className="grid grid-cols-1 gap-4 mb-6">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 ${
                  paymentMethod === method.id
                    ? 'border-red-600 bg-red-600 text-white'
                    : 'border-red-300 bg-white text-gray-700 hover:border-red-400'
                }`}
              >
                <span className="text-2xl">💳</span>
                <span className="font-medium">{method.name}</span>
              </button>
            ))}
          </div>

          {/* Payment Details with QR Code */}
          {selectedPaymentMethod && (
            <div className="bg-red-50 rounded-lg p-6 mb-6">
              <h3 className="font-medium text-black mb-4">Payment Details</h3>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{selectedPaymentMethod.name}</p>
                  <p className="font-mono text-black font-medium">{selectedPaymentMethod.account_number}</p>
                  <p className="text-sm text-gray-600 mb-3">Account Name: {selectedPaymentMethod.account_name}</p>
                  <p className="text-xl font-semibold text-black">Amount: ₱{totalPrice}</p>
                </div>
                <div className="flex-shrink-0">
                  <img 
                    src={selectedPaymentMethod.qr_code_url} 
                    alt={`${selectedPaymentMethod.name} QR Code`}
                    className="w-32 h-32 rounded-lg border-2 border-red-300 shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
                    }}
                  />
                  <p className="text-xs text-gray-500 text-center mt-2">Scan to pay</p>
                </div>
              </div>
            </div>
          )}

          {/* Reference Number */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-black mb-2">📸 Payment Proof Required</h4>
            <p className="text-sm text-gray-700">
              After making your payment, please take a screenshot of your payment receipt and attach it when you send your order via Messenger. This helps us verify and process your order quickly.
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-noto font-medium text-black mb-6">Final Order Summary</h2>
          
          <div className="space-y-4 mb-6">
            <div className="bg-pink-50 rounded-lg p-4">
              <h4 className="font-medium text-black mb-2">Customer Details</h4>
              <p className="text-sm text-gray-600">Name: {customerName}</p>
              <p className="text-sm text-gray-600">Contact: {contactNumber}</p>
              <p className="text-sm text-gray-600">Shipping: {shippingMethod.replace('lbc-', '').toUpperCase()}</p>
              <div className="mt-2">
                <p className="text-sm text-gray-600 font-medium">Shipping Address:</p>
                <p className="text-sm text-gray-600">{shippingAddress.street}</p>
                <p className="text-sm text-gray-600">{shippingAddress.city}, {shippingAddress.province} {shippingAddress.postalCode}</p>
                <p className="text-sm text-gray-600">{shippingAddress.country}</p>
              </div>
            </div>

            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-red-100">
                <div>
                  <h4 className="font-medium text-black">{item.name}</h4>
                  {item.selectedVariation && (
                    <p className="text-sm text-gray-600">Size: {item.selectedVariation.name}</p>
                  )}
                  {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                    <p className="text-sm text-gray-600">
                      Add-ons: {item.selectedAddOns.map(addOn => 
                        addOn.quantity && addOn.quantity > 1 
                          ? `${addOn.name} x${addOn.quantity}`
                          : addOn.name
                      ).join(', ')}
                    </p>
                  )}
                  <div className="text-sm text-gray-600">
                    {item.discountedPrice ? (
                      <div className="flex items-center gap-2">
                        <span className="line-through text-gray-400">₱{item.basePrice}</span>
                        <span className="text-green-600 font-semibold">₱{item.discountedPrice}</span>
                        <span className="text-xs text-green-500">(Save ₱{item.basePrice - item.discountedPrice})</span>
                      </div>
                    ) : (
                      <span>₱{item.basePrice}</span>
                    )}
                    <span className="block text-xs text-gray-500">per item x {item.quantity}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-black">₱{item.totalPrice}</span>
                  {item.discountedPrice && (
                    <div className="text-xs text-green-500">
                      Saved: ₱{(item.basePrice - item.discountedPrice) * item.quantity}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-pink-200 pt-4 mb-6 space-y-2">
            {(() => {
              const totalSavings = cartItems.reduce((total, item) => {
                if (item.discountedPrice) {
                  return total + ((item.basePrice - item.discountedPrice) * item.quantity);
                }
                return total;
              }, 0);
              
              const originalTotal = cartItems.reduce((total, item) => {
                return total + (item.basePrice * item.quantity);
              }, 0);
              
              return totalSavings > 0 ? (
                <>
                  <div className="flex items-center justify-between text-lg">
                    <span>Original Total:</span>
                    <span className="line-through text-gray-400">₱{originalTotal}</span>
                  </div>
                  <div className="flex items-center justify-between text-lg text-green-600">
                    <span>You Saved:</span>
                    <span className="font-semibold">₱{totalSavings}</span>
                  </div>
                </>
              ) : null;
            })()}
            <div className="flex items-center justify-between text-lg">
              <span>Subtotal:</span>
              <span>₱{totalPrice}</span>
            </div>
            <div className="flex items-center justify-between text-lg">
              <span>Shipping:</span>
              <span>₱{shippingFee}</span>
            </div>
            <div className="flex items-center justify-between text-2xl font-noto font-semibold text-black border-t border-pink-200 pt-2">
              <span>Total:</span>
              <span>₱{totalPrice + shippingFee}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full py-4 rounded-xl font-medium text-lg transition-all duration-200 transform bg-red-600 text-white hover:bg-red-700 hover:scale-[1.02]"
          >
            Place Order via Messenger
          </button>
          
          <p className="text-xs text-gray-500 text-center mt-3">
            You'll be redirected to Facebook Messenger to confirm your order. Don't forget to attach your payment screenshot!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;