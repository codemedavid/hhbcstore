import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useCart } from './hooks/useCart';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCatalog from './components/ProductCatalog';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import FloatingCartButton from './components/FloatingCartButton';
import AdminDashboard from './components/AdminDashboard';
import TestOrdersPage from './pages/TestOrdersPage';
import Toast from './components/Toast';
import { useProducts } from './hooks/useProducts';

function MainApp() {
  const cart = useCart();
  const { products } = useProducts();
  const [currentView, setCurrentView] = React.useState<'catalog' | 'cart' | 'checkout'>('catalog');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [toast, setToast] = React.useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const handleViewChange = (view: 'catalog' | 'cart' | 'checkout') => {
    setCurrentView(view);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleAddToCart = (item: any) => {
    const success = cart.addToCart(item, 1);
    if (success) {
      showToast(`${item.name} added to cart!`, 'success');
    }
    return success;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-pink-light via-pastel-white-warm to-pastel-blue-light font-inter">
      <Header 
        cartItemsCount={cart.getTotalItems()}
        onCartClick={() => handleViewChange('cart')}
        onCatalogClick={() => handleViewChange('catalog')}
        onCategoryClick={handleCategoryClick}
      />
      
      {currentView === 'catalog' && (
        <>
          <Hero />
          <ProductCatalog 
            products={products}
            addToCart={handleAddToCart}
            cartItems={cart.cartItems}
            updateQuantity={cart.updateQuantity}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryClick}
          />
        </>
      )}
      
      {currentView === 'cart' && (
        <Cart 
          cartItems={cart.cartItems}
          updateQuantity={cart.updateQuantity}
          removeFromCart={cart.removeFromCart}
          clearCart={cart.clearCart}
          getTotalPrice={cart.getTotalPrice}
          onContinueShopping={() => handleViewChange('catalog')}
          onCheckout={() => handleViewChange('checkout')}
        />
      )}
      
      {currentView === 'checkout' && (
        <Checkout 
          cartItems={cart.cartItems}
          totalPrice={cart.getTotalPrice()}
          onBack={() => handleViewChange('cart')}
        />
      )}
      
      {currentView === 'catalog' && (
        <FloatingCartButton 
          itemCount={cart.getTotalItems()}
          onCartClick={() => handleViewChange('cart')}
        />
      )}
      
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/test-orders" element={<TestOrdersPage />} />
      </Routes>
    </Router>
  );
}

export default App;