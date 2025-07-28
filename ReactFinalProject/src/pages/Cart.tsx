import { useEffect } from 'react';
import type { Phone, Earbuds, Watch, Case, Headphone, Cable } from '../data/products';
import { useTranslation } from 'react-i18next';

type CartProduct = Phone | Earbuds | Watch | Case | Headphone | Cable;

interface CartProps {
  cart: CartProduct[];
  setCart: (items: CartProduct[]) => void;
}

export default function Cart({ cart, setCart }: CartProps) {
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const handleRemove = (index: number) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);

  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const { t } = useTranslation();

  return (
    <div className="cart-page">
      <h1>{t('yourCart')}</h1>

      {cart.length === 0 ? (
        <p>{t('emptyCart')}.</p>
      ) : (
        <div>
          <ul>
            {cart.map((item, index) => (
              <li key={index}>
                {item.title} – ${item.price.toFixed(2)}
                <button onClick={() => handleRemove(index)}>{t('Remove')}</button>
              </li>
            ))}
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
