import { useEffect } from 'react';
import type { Phone, Earbuds, Watch, Case, Headphone, Cable } from '../data/products';
import { useTranslation } from 'react-i18next';

type CartProduct = Phone | Earbuds | Watch | Case | Headphone | Cable;

interface CartProps {
  cart: CartProduct[];
  setCart: (items: CartProduct[]) => void;
}

const getDiscountedPrice = (price: number, discount: number | null | undefined): number =>
  discount != null ? price - (price * discount) / 100 : price;

export default function Cart({ cart, setCart }: CartProps) {
  const { t } = useTranslation();

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

  return (
    <div className="cart-page">
      <h1>{t('yourCart')}</h1>

      {cart.length === 0 ? (
        <p>{t('emptyCart')}.</p>
      ) : (
        <div>
          <ul>
            {cart.map((item, index) => {
              const finalPrice = getDiscountedPrice(item.price, item.discount);
              return (
                <li key={index}>
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
            onClick={() => alert(t('checkoutDone'))}
          >
            {t('proceedCheckout')}
          </button>
        </div>
      )}
    </div>
  );
}
