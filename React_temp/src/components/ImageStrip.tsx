import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
  import img1 from '../assets/images/img1.png';
  import img2 from '../assets/images/img2.png';
  import img3 from '../assets/images/img3.png';
  import img4 from '../assets/images/img4.png';
  import img5 from '../assets/images/img5.png';
  import img6 from '../assets/images/img6.png';
  import img7 from '../assets/images/img7.png';
  import img8 from '../assets/images/img8.png';
  import img9 from '../assets/images/img9.png';
  import img10 from '../assets/images/img10.png';
  import img11 from '../assets/images/img11.png';
  import img12 from '../assets/images/img12.png';


const ImageStrip: React.FC = () => {
	const scrollContainerRef = useRef<HTMLDivElement | null>(null);
	const navigate = useNavigate();
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(true);

	const images = [
		{ src: img1, id: 1 },
		{ src: img2, id: 2 },
		{ src: img3, id: 3 },
		{ src: img4, id: 4 },
		{ src: img5, id: 5 },
		{ src: img6, id: 6 },
		{ src: img7, id: 7 },
		{ src: img8, id: 8 },
		{ src: img9, id: 9 },
		{ src: img10, id: 10 },
		{ src: img11, id: 11 },
		{ src: img12, id: 12 },
	];

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
				{images.map((image) => (
					<div
						key={image.id}
						style={{
							minWidth: 280,
							flex: '0 0 auto',
							borderRadius: 10,
							overflow: 'hidden',
							boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
							background: '#fff',
							cursor: 'pointer',
						}}
						onClick={() => navigate(`/products/${image.id}`)}
					>
						<img
							src={image.src}
							alt={`Product ${image.id}`}
							style={{ display: 'block', width: '100%', height: 300, objectFit: 'cover' }}
						/>
						<div style={{ padding: 10, fontSize: 14, color: '#333' }}>
							Product {image.id}
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
