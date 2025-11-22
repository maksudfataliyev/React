import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getProductImageUrl } from '../components/productsService';
import type { Product } from '../components/productsService';
import Checkout from '../components/ui/checkout-components';
import '../Cart.css';

interface CartProps {
  cart: Product[];
  setCart: (items: Product[]) => void;
}

const getDiscountedPrice = (price: number, discount: number | null | undefined): number =>
  discount != null ? price - (price * discount) / 100 : price;

export default function Cart({ cart, setCart }: CartProps) {
  const { t } = useTranslation();
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    const username = localStorage.getItem('loggedInUser');
    if (username) {
      localStorage.setItem(`cart_${username}`, JSON.stringify(cart));
    }
  }, [cart]);

  const handleRemove = (index: number) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
  };

  const total = cart.reduce((sum, item) => {
    const finalPrice = getDiscountedPrice(item.price, item.discount);
    return sum + finalPrice;
  }, 0);

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleCheckoutClose = () => {
    setShowCheckout(false);
  };

  const handleCheckoutComplete = () => {
    setShowCheckout(false);
    setCart([]);
    // Clear cart from localStorage
    const username = localStorage.getItem('loggedInUser');
    if (username) {
      localStorage.removeItem(`cart_${username}`);
    }
  };

  return (
    <div className="cart-page">
      {cart.length === 0 ? (
        <p>{t('emptyCart')}.</p>
      ) : (
        <div>
          <ul>
            {cart.map((item, index) => {
              const finalPrice = getDiscountedPrice(item.price, item.discount);
              return (
                <li key={index}>
                  <img 
                    src={getProductImageUrl(item.image)} 
                    alt={item.title}
                    style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                  />
                  {item.title} –{' '}
                  {item.discount ? (
                    <>
                      <span style={{ textDecoration: 'line-through', color: '#777' }}>
                        ${item.price.toFixed(2)}
                      </span>{' '}
                      <span style={{ color: 'red', fontWeight: 'bold' }}>
                        ${finalPrice.toFixed(2)}
                      </span>{' '}
                      <span style={{ color: 'green', fontSize: '0.9rem' }}>
                        ({item.discount}% {t('off')})
                      </span>
                    </>
                  ) : (
                    `$${item.price.toFixed(2)}`
                  )}
                  <button onClick={() => handleRemove(index)}>{t('Remove')}</button>
                </li>
              );
            })}
          </ul>

          <p>{t('Total')}: ${total.toFixed(2)}</p>
          <button
            className="checkout-button"
            onClick={handleCheckout}
          >
            {t('proceedCheckout')}
          </button>
        </div>
      )}

      {showCheckout && (
        <Checkout
          cartItems={cart}
          onClose={handleCheckoutClose}
          onComplete={handleCheckoutComplete}
        />
      )}
    </div>
  );
}