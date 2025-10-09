import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { phones, earbuds, watches, cases, headphones, cables } from '../data/products';

const ImageStrip: React.FC = () => {
	const scrollContainerRef = useRef<HTMLDivElement | null>(null);
	const navigate = useNavigate();
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(true);

	const allProducts = [...phones, ...earbuds, ...watches, ...cases, ...headphones, ...cables];

	const updateScrollButtons = () => {
		const el = scrollContainerRef.current;
		if (!el) return;
		setCanScrollLeft(el.scrollLeft > 0);
		setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
	};

	useEffect(() => {
		updateScrollButtons();
		const el = scrollContainerRef.current;
		if (!el) return;
		const onScroll = () => updateScrollButtons();
		window.addEventListener('resize', updateScrollButtons);
		el.addEventListener('scroll', onScroll);
		return () => {
			window.removeEventListener('resize', updateScrollButtons);
			el.removeEventListener('scroll', onScroll);
		};
	}, []);

	const scroll = (direction: 'left' | 'right') => {
		const el = scrollContainerRef.current;
		if (!el) return;
		const cardWidth = el.querySelector('img')?.clientWidth ?? 300;
		const gap = 20;
		const scrollAmount = Math.round(cardWidth + gap);
		const target = direction === 'left' ? el.scrollLeft - scrollAmount : el.scrollLeft + scrollAmount;
		el.scrollTo({ left: target, behavior: 'smooth' });
	};

	return (
		<div style={{ position: 'relative', width: '100%', overflow: 'hidden', padding: '20px 10px', height: "400px" }}>
			<style>{`
				.image-strip { display:flex; gap:20px; overflow-x:auto; scroll-behavior:smooth; padding:12px 8px; align-items:center; }
				.image-strip::-webkit-scrollbar { height:8px; }
				.image-strip::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius:4px; }
				.image-strip::-webkit-scrollbar-track { background: transparent; }
			`}</style>

			<div
				ref={scrollContainerRef}
				className="image-strip"
				role="group"
				aria-label="Products carousel"
				style={{
					overflowX: 'auto',
					whiteSpace: 'nowrap',
					paddingBottom: 8,
				}}
			>
				{allProducts.map((product) => (
					<div
						key={product.id}
						style={{
							minWidth: 280,
							flex: '0 0 auto',
							borderRadius: 10,
							overflow: 'hidden',
							boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
							background: '#fff',
							cursor: 'pointer',
						}}
						onClick={() => navigate(`/products/${product.id}`)}
					>
						<img
							src={product.image}
							alt={product.title}
							style={{ display: 'block', width: '100%', height: 300, objectFit: 'cover' }}
						/>
						<div style={{ padding: 10, fontSize: 14, color: '#333' }}>
							{product.title}
						</div>
					</div>
				))}
			</div>

			<button
				onClick={() => scroll('left')}
				aria-hidden={!canScrollLeft}
				disabled={!canScrollLeft}
				style={{
					position: 'absolute',
					left: 8,
					top: '50%',
					transform: 'translateY(-50%)',
					width: 48,
					height: 48,
					borderRadius: '50%',
					border: 'none',
					background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(240,240,240,0.9))',
					boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
					cursor: canScrollLeft ? 'pointer' : 'not-allowed',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: 20,
					color: '#222',
					opacity: canScrollLeft ? 1 : 0.45,
					transition: 'transform .12s ease, opacity .12s ease',
					zIndex: 5,
				}}
			>
				&lt;
			</button>

			<button
				onClick={() => scroll('right')}
				aria-hidden={!canScrollRight}
				disabled={!canScrollRight}
				style={{
					position: 'absolute',
					right: 8,
					top: '50%',
					transform: 'translateY(-50%)',
					width: 48,
					height: 48,
					borderRadius: '50%',
					border: 'none',
					background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(240,240,240,0.9))',
					boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
					cursor: canScrollRight ? 'pointer' : 'not-allowed',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: 20,
					color: '#222',
					opacity: canScrollRight ? 1 : 0.45,
					transition: 'transform .12s ease, opacity .12s ease',
					zIndex: 5,
				}}
			>
				&gt;
			</button>
		</div>
	);
};

export default ImageStrip;