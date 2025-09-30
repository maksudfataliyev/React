import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { phones, earbuds, watches, cases, headphones, cables } from '../data/products';
import type { Phone, Earbuds, Watch, Case, Headphone, Cable } from '../data/products';
import '../ProductDetail.css';

type Product = Phone | Earbuds | Watch | Case | Headphone | Cable;

interface ProductDetailProps {
  addToCart: (product: Product) => void;
}

const getDiscountedPrice = (price: number, discount: number | null): number => {
  return discount ? price - (price * discount) / 100 : price;
};

export default function ProductDetail({ addToCart }: ProductDetailProps) {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const allProducts: Product[] = [
    ...phones,
    ...earbuds,
    ...watches,
    ...cases,
    ...headphones,
    ...cables,
  ];

  const product = allProducts.find(p => p.id === id);

  if (!product) {
    return <p>{t('productNotFound')}</p>;
  }

  const finalPrice = getDiscountedPrice(product.price, product.discount ?? null);

  return (
    <div className="product-detail">
      <img src={product.image} alt={t(`productss.${product.id}`)} className="product-image" />
      <div className="product-info">
        <h2>{t(`productss.${product.id}`)}</h2>

        {product.discount ? (
          <p className="price">
            <span style={{ textDecoration: 'line-through', color: '#777' }}>
              ${product.price.toFixed(2)}
            </span>{' '}
            <span style={{ color: 'red', fontWeight: 'bold' }}>
              ${finalPrice.toFixed(2)}
            </span>{' '}
            <span style={{ color: 'green', fontSize: '0.9rem' }}>
              ({product.discount}% {t('off')})
            </span>
          </p>
        ) : (
          <p className="price">${product.price.toFixed(2)}</p>
        )}

        <p>{t('designer')}: {product.designer}</p>
        {'ram' in product && <p>{t('ram')}: {product.ram} GB</p>}
        {'storage' in product && <p>{t('storage')}: {product.storage} GB</p>}
        {'year' in product && <p>{t('year')}: {product.year}</p>}
        {'processor' in product && <p>{t('processor')}: {product.processor}</p>}
        {'camera' in product && <p>{t('camera')}: {product.camera}</p>}
        {'operating_system' in product && <p>{t('os')}: {product.operating_system}</p>}
        {'designed_for' in product && <p>{t('designedFor')}: {product.designed_for}</p>}
        {'type' in product && <p>{t('type')}: {product.type}</p>}
        {'color' in product && <p>{t('color')}: {t(`colors.${product.color}`)}</p>}

        <button className="add-to-cart" onClick={() => addToCart(product)}>
          {t('addToCart')}
        </button>
        <br />
        <Link to="/products" className="back-button">
          ← {t('backToProducts')}
        </Link>
      </div>
    </div>
  );
}
