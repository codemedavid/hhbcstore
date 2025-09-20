import React, { useState } from 'react';
import { ArrowLeft, Tag, X } from 'lucide-react';
import { CartItem, PaymentMethod, ShippingMethod } from '../types';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { useOrders } from '../hooks/useOrders';
import { supabase } from '../lib/supabase';

interface CheckoutProps {
  cartItems: CartItem[];
  totalPrice: number;
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, totalPrice, onBack }) => {
  const { paymentMethods } = usePaymentMethods();
  const { createOrder, loading: orderLoading } = useOrders();
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    barangay: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Philippines'
  });
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('cod-delivery');
  const [shippingFee, setShippingFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash');
  const [notes, setNotes] = useState('');
  
  // Voucher states
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherError, setVoucherError] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherSuccess, setVoucherSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Debug function to test Messenger URLs
  const testMessengerUrls = () => {
    const testUrls = [
      'https://m.me/hhbcshoppe',
      'https://www.messenger.com/t/hhbcshoppe',
      'https://facebook.com/messages/t/hhbcshoppe',
      'https://m.me/HHBCSHOPPE',
      'https://m.me/HHBC-SHOPPE',
      'https://www.messenger.com'
    ];
    
    console.log('Testing Messenger URLs:');
    testUrls.forEach((url, index) => {
      console.log(`${index + 1}. ${url}`);
      setTimeout(() => {
        console.log(`Opening: ${url}`);
        window.open(url, '_blank');
      }, index * 1000);
    });
  };

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

  // Voucher functions
  const applyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError('Please enter a voucher code');
      setVoucherSuccess('');
      return;
    }

    try {
      setVoucherError('');
      setVoucherSuccess('');
      
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', voucherCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        setVoucherError('❌ Invalid voucher code. Please check and try again.');
        setVoucherSuccess('');
        return;
      }

      // Debug voucher data
      console.log('Voucher data:', {
        code: data.code,
        max_uses: data.max_uses,
        used_count: data.used_count,
        is_active: data.is_active,
        expires_at: data.expires_at
      });

      // Check if voucher is expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setVoucherError('⏰ This voucher has expired. Please use a valid voucher.');
        setVoucherSuccess('');
        return;
      }

      // Check if voucher has reached max uses
      if (data.max_uses !== null && data.max_uses !== undefined && data.used_count >= data.max_uses) {
        setVoucherError(`🚫 Voucher has reached maximum uses (${data.used_count}/${data.max_uses}). This voucher is no longer available.`);
        setVoucherSuccess('');
        return;
      }

      // Double-check that voucher is still active (in case it was deactivated)
      if (!data.is_active) {
        setVoucherError('❌ This voucher is no longer active. Please use a different voucher.');
        setVoucherSuccess('');
        return;
      }

      // Check minimum order amount
      if (data.min_order_amount > totalPrice) {
        setVoucherError(`💰 Minimum order amount is ₱${data.min_order_amount}. Add more items to use this voucher.`);
        setVoucherSuccess('');
        return;
      }

      // Calculate discount
      let discount = 0;
      if (data.discount_type === 'percentage') {
        discount = (totalPrice * data.discount_value) / 100;
      } else {
        discount = Math.min(data.discount_value, totalPrice);
      }

      // Convert snake_case to camelCase for frontend
      const formattedVoucher = {
        id: data.id,
        code: data.code,
        discountType: data.discount_type,
        discountValue: data.discount_value,
        minOrderAmount: data.min_order_amount,
        maxUses: data.max_uses,
        usedCount: data.used_count,
        isActive: data.is_active,
        expiresAt: data.expires_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setAppliedVoucher(formattedVoucher);
      setVoucherDiscount(discount);
      setVoucherCode('');
      setVoucherSuccess(`✅ Voucher "${data.code}" applied successfully! You saved ₱${discount.toFixed(2)}.`);
      setVoucherError('');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setVoucherSuccess('');
      }, 5000);
    } catch (error) {
      console.error('Error applying voucher:', error);
      setVoucherError('❌ Failed to apply voucher. Please try again.');
      setVoucherSuccess('');
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherDiscount(0);
    setVoucherError('');
    setVoucherSuccess('');
  };

  const handlePlaceOrder = async () => {
    if (isProcessing) return; // Prevent multiple clicks
    
    setIsProcessing(true);
    const totalWithShipping = totalPrice + shippingFee - voucherDiscount;
    
    try {
      // Create order in database
      const orderData = {
        customer_name: customerName,
        contact_number: contactNumber,
        shipping_address: shippingAddress,
        shipping_method: shippingMethod,
        shipping_fee: shippingFee,
        subtotal: totalPrice,
        voucher_discount: voucherDiscount,
        total_amount: totalWithShipping,
        payment_method: selectedPaymentMethod?.name || paymentMethod,
        notes: notes || undefined,
        voucher_id: appliedVoucher?.id,
        voucher_code: appliedVoucher?.code
      };

      const order = await createOrder(orderData, cartItems);
    
      // Generate order details for Messenger
      const orderDetails = `
🛍️ H&hbc SHOPPE ORDER
📋 Order #: ${order.order_number}

👤 Customer: ${customerName}
📞 Contact: ${contactNumber}

🚚 SHIPPING ADDRESS:
${shippingAddress.street}
${shippingAddress.barangay}
${shippingAddress.city}, ${shippingAddress.province} ${shippingAddress.postalCode}
${shippingAddress.country}

📦 Shipping Method: ${shippingMethod.replace('lbc-', '').toUpperCase()}
${appliedVoucher ? `🏷️ Voucher: ${appliedVoucher.code} (-₱${voucherDiscount.toFixed(2)})` : ''}

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

✅ Order saved to database with ID: ${order.id}
Please confirm this order to proceed. Thank you for choosing H&hbc SHOPPE! 💄✨
      `.trim();

      const encodedMessage = encodeURIComponent(orderDetails);
      
      // Try multiple Messenger URL formats for better compatibility
      const messengerUrls = [
        `https://m.me/hhbcshoppe?text=${encodedMessage}`,
        `https://www.messenger.com/t/hhbcshoppe?text=${encodedMessage}`,
        `https://facebook.com/messages/t/hhbcshoppe?text=${encodedMessage}`,
        // Alternative formats that might work better
        `https://m.me/hhbcshoppe`,
        `https://www.messenger.com/t/hhbcshoppe`,
        `https://facebook.com/messages/t/hhbcshoppe`,
        // Fallback - just open Messenger without specific page
        `https://www.messenger.com`,
        `https://m.me`
      ];
      
      // Show success message with toast notification
      console.log(`Order #${order.order_number} created successfully! Redirecting to Messenger...`);
      console.log('Messenger URLs:', messengerUrls);
      console.log('Encoded message length:', encodedMessage.length);
      
      // Open Messenger immediately without alert
      try {
        // Try the first URL (m.me with text)
        console.log('Trying URL 1:', messengerUrls[0]);
        const opened = window.open(messengerUrls[0], '_blank');
        
        // Check if popup was blocked
        if (!opened || opened.closed || typeof opened.closed == 'undefined') {
          console.log('Popup blocked or failed, trying alternative URLs');
          
          // Try different approaches
          setTimeout(() => {
            console.log('Trying URL 4 (m.me without text):', messengerUrls[3]);
            window.open(messengerUrls[3], '_blank');
          }, 100);
          
          setTimeout(() => {
            console.log('Trying URL 7 (messenger.com):', messengerUrls[6]);
            window.open(messengerUrls[6], '_blank');
          }, 500);
        }
        
      } catch (error) {
        console.error('Error opening Messenger:', error);
        // Fallback to direct Facebook Messenger
        console.log('Trying fallback URL 7 (messenger.com):', messengerUrls[6]);
        window.open(messengerUrls[6], '_blank');
      }
      
      // Show success notification with copy-to-clipboard functionality
      const successNotification = document.createElement('div');
      successNotification.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #10B981; color: white; padding: 20px 24px; border-radius: 12px; z-index: 10000; box-shadow: 0 8px 32px rgba(0,0,0,0.15); font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 400px;">
          <div style="font-weight: 600; margin-bottom: 8px; font-size: 16px;">✅ Order Created Successfully!</div>
          <div style="font-size: 14px; opacity: 0.9; margin-bottom: 12px;">Order #${order.order_number}</div>
          <div style="font-size: 13px; opacity: 0.8; margin-bottom: 12px;">
            If Messenger didn't open automatically:<br/>
            1. Click "Copy Order Details" to copy your order<br/>
            2. Click "Open Messenger" to open Facebook Messenger<br/>
            3. Paste the order details in your message
          </div>
          <button onclick="navigator.clipboard.writeText('${orderDetails.replace(/'/g, "\\'")}').then(() => alert('Order details copied to clipboard!'))" 
                  style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px 16px; border-radius: 6px; font-size: 12px; cursor: pointer; margin-right: 8px;">
            📋 Copy Order Details
          </button>
          <button onclick="window.open('https://m.me/hhbcshoppe', '_blank')" 
                  style="background: #1877F2; border: none; color: white; padding: 8px 16px; border-radius: 6px; font-size: 12px; cursor: pointer; margin-right: 8px;">
            💬 Open Messenger
          </button>
          <button onclick="window.open('https://www.messenger.com', '_blank')" 
                  style="background: #1877F2; border: none; color: white; padding: 8px 16px; border-radius: 6px; font-size: 12px; cursor: pointer;">
            📱 Messenger Web
          </button>
        </div>
      `;
      document.body.appendChild(successNotification);
      
      // Remove notification after 10 seconds
      setTimeout(() => {
        if (successNotification.parentNode) {
          successNotification.parentNode.removeChild(successNotification);
        }
      }, 10000);
      
    } catch (error) {
      console.error('Error creating order:', error);
      
      // Show error notification instead of alert
      const errorNotification = document.createElement('div');
      errorNotification.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #EF4444; color: white; padding: 16px 24px; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 400px;">
          <div style="font-weight: 600; margin-bottom: 4px;">❌ Order Failed</div>
          <div style="font-size: 14px; opacity: 0.9;">${error instanceof Error ? error.message : 'Please try again.'}</div>
        </div>
      `;
      document.body.appendChild(errorNotification);
      
      // Remove notification after 5 seconds
      setTimeout(() => {
        if (errorNotification.parentNode) {
          errorNotification.parentNode.removeChild(errorNotification);
        }
      }, 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  const isDetailsValid = customerName && contactNumber && 
    shippingAddress.street && shippingAddress.barangay && shippingAddress.city && shippingAddress.province && shippingAddress.postalCode;

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
              {voucherDiscount > 0 && (
                <div className="flex items-center justify-between text-lg text-green-600">
                  <span>Voucher Discount ({appliedVoucher?.code}):</span>
                  <span>-₱{voucherDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-lg">
                <span>Shipping:</span>
                <span>₱{shippingFee}</span>
              </div>
              <div className="flex items-center justify-between text-2xl font-noto font-semibold text-black border-t border-pink-200 pt-2">
                <span>Total:</span>
                <span>₱{(totalPrice + shippingFee - voucherDiscount).toFixed(2)}</span>
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

              {/* Voucher Code */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Voucher Code</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => {
                      setVoucherCode(e.target.value.toUpperCase());
                      // Clear messages when user starts typing
                      if (voucherError || voucherSuccess) {
                        setVoucherError('');
                        setVoucherSuccess('');
                      }
                    }}
                    className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ${
                      voucherError 
                        ? 'border-red-300 bg-red-50' 
                        : voucherSuccess 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Enter voucher code"
                    disabled={!!appliedVoucher}
                  />
                  {!appliedVoucher ? (
                    <button
                      type="button"
                      onClick={applyVoucher}
                      className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <Tag className="h-4 w-4" />
                      <span>Apply</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={removeVoucher}
                      className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                {voucherError && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 font-medium">{voucherError}</p>
                  </div>
                )}
                {voucherSuccess && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">{voucherSuccess}</p>
                  </div>
                )}
                {appliedVoucher && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">
                      🎉 Voucher "{appliedVoucher.code}" is active!
                    </p>
                    <p className="text-sm text-blue-600">
                      You're saving ₱{voucherDiscount.toFixed(2)} on this order
                    </p>
                    {appliedVoucher.maxUses && (
                      <p className="text-xs text-blue-500 mt-1">
                        Usage: {appliedVoucher.usedCount}/{appliedVoucher.maxUses}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Shipping Method */}
              <div>
                <label className="block text-sm font-medium text-black mb-3">Shipping Method *</label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { value: 'cod-delivery', label: 'COD (Delivery)', icon: '🚚', fee: 0 },
                    { value: 'cop-lbc-branch', label: 'COP LBC Branch (Pick Up)', icon: '🏢', fee: 0 },
                    { value: 'other-courier', label: 'Other Available Courier', icon: '📦', fee: 0 }
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
                  placeholder="House number, street name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Barangay *</label>
                <input
                  type="text"
                  value={shippingAddress.barangay}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, barangay: e.target.value }))}
                  className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your barangay"
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
                <p className="text-sm text-gray-600">{shippingAddress.barangay}</p>
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
            {voucherDiscount > 0 && (
              <div className="flex items-center justify-between text-lg text-green-600">
                <span>Voucher Discount ({appliedVoucher?.code}):</span>
                <span>-₱{voucherDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-lg">
              <span>Shipping:</span>
              <span>₱{shippingFee}</span>
            </div>
            <div className="flex items-center justify-between text-2xl font-noto font-semibold text-black border-t border-pink-200 pt-2">
              <span>Total:</span>
              <span>₱{(totalPrice + shippingFee - voucherDiscount).toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={orderLoading || isProcessing}
            className={`w-full py-4 rounded-xl font-medium text-lg transition-all duration-200 transform ${
              (orderLoading || isProcessing)
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:scale-[1.02] shadow-lg hover:shadow-red-500/25'
            }`}
          >
            {(orderLoading || isProcessing) ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {isProcessing ? 'Processing...' : 'Creating Order...'}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>💬</span>
                Complete Order & Open Messenger
              </div>
            )}
          </button>
          
          {/* Temporary debug button - remove this later */}
          <button
            onClick={testMessengerUrls}
            className="w-full mt-2 py-2 px-4 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
          >
            🔧 Test Messenger URLs (Debug)
          </button>
          
          <div className="text-center mt-3">
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">✨ One-Click Order Process:</span>
            </p>
            <p className="text-xs text-gray-500">
              Order will be saved automatically • Messenger will open instantly • Send your payment screenshot there
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;