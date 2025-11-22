import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { orderService } from '../components/orderService';
import { getProductImageUrl } from '../components/productsService';
import type { PurchaseHistoryResponse } from '../components/orderService';
import '../OrderHistory.css';

export default function OrderHistory() {
  const { t } = useTranslation();
  const [history, setHistory] = useState<PurchaseHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    
    // Check if user is logged in (has JWT token)
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await orderService.getPurchaseHistory();
      setHistory(data);
    } catch (error) {
      console.error('Error loading purchase history:', error);
      if (error instanceof Error && error.message.includes('login')) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="order-history-page">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!history || history.orders.length === 0) {
    return (
      <div className="order-history-page">
        <h1 className="page-title">{t('orderHistory') || 'Order History'}</h1>
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p className="empty-text">{t('noOrders') || 'No orders yet'}</p>
          <p className="empty-subtext">{t('startShopping') || 'Start shopping to see your orders here'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-page">
      <h1 className="page-title">{t('orderHistory') || 'Order History'}</h1>
      
      <div className="stats-card">
        <div className="stat-item">
          <div className="stat-label">{t('totalOrders') || 'Total Orders'}</div>
          <div className="stat-value">{history.totalOrders}</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-label">{t('totalSpent') || 'Total Spent'}</div>
          <div className="stat-value">${history.totalSpent.toFixed(2)}</div>
        </div>
      </div>

      <div className="orders-container">
        {history.orders.map((order) => (
          <div key={order.orderId} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <h3 className="order-number">
                  {t('order') || 'Order'} #{order.orderId}
                </h3>
                <p className="order-date">
                  {new Date(order.purchaseDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="order-total">
                <span className="total-label">{t('total') || 'Total'}</span>
                <span className="total-amount">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="order-items">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <img 
                    src={getProductImageUrl(item.productImage)}
                    alt={item.productTitle}
                    className="item-image"
                  />
                  <div className="item-details">
                    <h4 className="item-title">{item.productTitle}</h4>
                    <div className="item-pricing">
                      {item.discount ? (
                        <>
                          <span className="original-price">${item.originalPrice.toFixed(2)}</span>
                          <span className="final-price">${item.finalPrice.toFixed(2)}</span>
                          <span className="discount-badge">-{item.discount}%</span>
                        </>
                      ) : (
                        <span className="final-price">${item.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  <div className="item-subtotal">
                    ${(item.finalPrice * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}