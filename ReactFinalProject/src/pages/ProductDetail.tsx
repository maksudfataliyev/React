import { useParams, Link } from 'react-router-dom';
import { phones, earbuds, watches, cases, headphones, cables } from '../data/products';
import type { Phone, Earbuds, Watch, Case, Headphone, Cable } from '../data/products';

type Product = Phone | Earbuds | Watch | Case | Headphone | Cable;

interface ProductDetailProps {
  addToCart: (product: Product) => void;
}

export default function ProductDetail({ addToCart }: ProductDetailProps) {
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
    return <p>Error, product not found.</p>;
  }

  return (
    <div className="product-detail">
      <img src={product.image} alt={product.title} className="product-image" />
      <div className="product-info">
        <h2>{product.title}</h2>
        <p className="price">${product.price.toFixed(2)}</p>
        <p>Designer: {product.designer}</p>

        {'ram' in product && <p>RAM: {product.ram} GB</p>}
        {'storage' in product && <p>Storage: {product.storage} GB</p>}
        {'year' in product && <p>Year: {product.year}</p>}
        {'processor' in product && <p>Processor: {product.processor}</p>}
        {'camera' in product && <p>Camera: {product.camera}</p>}
        {'operating_system' in product && <p>OS: {product.operating_system}</p>}
        {'designed_for' in product && <p>Designed for: {product.designed_for}</p>}
        {'type' in product && <p>Type: {product.type}</p>}
        {'color' in product && <p>Color: {product.color}</p>}

        <button className="add-to-cart" onClick={() => addToCart(product)}>
          Add to Cart
        </button>
        <br />
        <Link to="/products" className="back-button">← Back to Products</Link>
      </div>
    </div>
  );
}
