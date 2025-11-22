import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProductById, getProductImageUrl } from '../components/productsService';
import type { Product } from '../components/productsService';
import '../ProductDetail.css';

interface ProductDetailProps {
  addToCart: (product: Product) => void;
}

const getDiscountedPrice = (price: number, discount: number | null): number => {
  return discount ? price - (price * discount) / 100 : price;
};

export default function ProductDetail({ addToCart }: ProductDetailProps) {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      setIsLoading(true);
      const fetchedProduct = await getProductById(id);
      setProduct(fetchedProduct);
      setIsLoading(false);
    };
    loadProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="product-detail">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          Loading product...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail">
        <p>{t('productNotFound')}</p>
        <Link to="/products" className="back-button">
          ← {t('backToProducts')}
        </Link>
      </div>
    );
  }

  const finalPrice = getDiscountedPrice(product.price, product.discount ?? null);

  return (
    <div className="product-detail">
      <img 
        src={getProductImageUrl(product.image)} 
        alt={product.title} 
        className="product-image" 
      />
      <div className="product-info">
        <h2>{product.title}</h2>

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

        <p><strong>{t('designer')}:</strong> {product.designer}</p>
        {product.color && <p><strong>{t('color')}:</strong> {t(`colors.${product.color}`)}</p>}
        {product.ram && <p><strong>{t('ram')}:</strong> {product.ram} GB</p>}
        {product.storage && <p><strong>{t('storage')}:</strong> {product.storage} GB</p>}
        {product.year && <p><strong>{t('year')}:</strong> {product.year}</p>}
        {product.processor && <p><strong>{t('processor')}:</strong> {product.processor}</p>}
        {product.camera && <p><strong>{t('camera')}:</strong> {product.camera}</p>}
        {product.operatingSystem && <p><strong>{t('os')}:</strong> {product.operatingSystem}</p>}
        {product.designedFor && <p><strong>{t('designedFor')}:</strong> {product.designedFor}</p>}
        {product.type && <p><strong>{t('type')}:</strong> {product.type}</p>}

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