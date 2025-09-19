import React from 'react';
import OrdersPage from '../components/OrdersPage';

const TestOrdersPage: React.FC = () => {
  const handleBack = () => {
    window.location.href = '/admin';
  };

  return (
    <div>
      <OrdersPage onBack={handleBack} />
    </div>
  );
};

export default TestOrdersPage;
