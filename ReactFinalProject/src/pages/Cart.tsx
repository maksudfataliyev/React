import { useEffect } from 'react';
import type { Phone, Earbuds, Watch, Case, Headphone, Cable } from '../data/products';

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

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          <ul>
            {cart.map((item, index) => (
              <li key={index}>
                {item.title} – ${item.price.toFixed(2)}
                <button onClick={() => handleRemove(index)}>Remove</button>
              </li>
            ))}
          </ul>

          <p>Total: ${total.toFixed(2)}</p>
          <button
            className="checkout-button"
            onClick={() => alert('Checkout coming soon!')}
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}
