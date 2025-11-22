import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useScroll, useTransform, motion } from "framer-motion";
import { motion as motionNew } from "motion/react";
import { useTranslation } from "react-i18next";
import storeShowcase from  "../assets/images/store-showcase.jpg";
import React from "react";
import "../Home.css";

type Testimonial = {
  text: string;
  image: string;
  name: string;
  role: string;
};

// Testimonials Column Component
const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motionNew.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-background"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <div className="testimonial-card p-10 rounded-3xl border shadow-lg max-w-xs w-full" key={i}>
                  <div className="testimonial-text">{text}</div>
                  <div className="flex items-center gap-2 mt-5">
                    <img
                      width={40}
                      height={40}
                      src={image}
                      alt={name}
                      className="h-10 w-10 rounded-full"
                    />
                    <div className="flex flex-col">
                      <div className="font-medium tracking-tight leading-5 testimonial-name">{name}</div>
                      <div className="leading-5 opacity-60 tracking-tight testimonial-role">{role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motionNew.div>
    </div>
  );
};

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [queryInput, setQueryInput] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1]);
  const translateY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const handleSearch = () => {
    setQuery(queryInput);
    if (queryInput.trim()) {
      navigate(`/products?search=${encodeURIComponent(queryInput)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCategoryClick = (categoryKey: string) => {
    const filters = {
      selectedCategory: [categoryKey],
      selectedColor: ['all'],
      selectedDesigner: ['all'],
      selectedDiscount: ['all'],
      selectedOS: ['all'],
      selectedRam: ['all'],
      selectedStorage: ['all'],
      selectedYear: ['all'],
    };

    Object.entries(filters).forEach(([key, value]) => {
      sessionStorage.setItem(key, JSON.stringify(value));
    });

    navigate(`/products?category=${categoryKey}`);
  };

  const categories = [
    { icon: '📱', name: t('phones'), key: 'phones', count: 150 },
    { icon: '🎧', name: t('earbuds'), key: 'earbuds', count: 85 },
    { icon: '⌚', name: t('watches'), key: 'watches', count: 120 },
    { icon: '🛡️', name: t('cases'), key: 'cases', count: 200 },
    { icon: '🎧', name: t('headphones'), key: 'headphones', count: 95 },
    { icon: '🔌', name: t('cables'), key: 'cables', count: 180 },
  ];

  const features = [
    { 
      icon: '🛡️', 
      title: t('features.items.quality.title'), 
      desc: t('features.items.quality.description') 
    },
    { 
      icon: '🚚', 
      title: t('features.items.delivery.title'), 
      desc: t('features.items.delivery.description') 
    },
    { 
      icon: '💳', 
      title: t('features.items.payment.title'), 
      desc: t('features.items.payment.description') 
    },
    { 
      icon: '🏆', 
      title: t('features.items.prices.title'), 
      desc: t('features.items.prices.description') 
    },
  ];

  const stats = [
    { value: '10K+', label: t('happyCustomers') },
    { value: '500+', label: t('products') },
    { value: '50+', label: t('brands') },
    { value: '4.8★', label: t('avgrating') },
  ];

  // Move testimonials inside the component to use translations
  const testimonials = [
    {
      text: t('testimonials.items.1.text'),
      image: "https://randomuser.me/api/portraits/women/1.jpg",
      name: t('testimonials.items.1.name'),
      role: t('testimonials.items.1.role'),
    },
    {
      text: t('testimonials.items.2.text'),
      image: "https://randomuser.me/api/portraits/men/2.jpg",
      name: t('testimonials.items.2.name'),
      role: t('testimonials.items.2.role'),
    },
    {
      text: t('testimonials.items.3.text'),
      image: "https://randomuser.me/api/portraits/women/3.jpg",
      name: t('testimonials.items.3.name'),
      role: t('testimonials.items.3.role'),
    },
    {
      text: t('testimonials.items.4.text'),
      image: "https://randomuser.me/api/portraits/men/4.jpg",
      name: t('testimonials.items.4.name'),
      role: t('testimonials.items.4.role'),
    },
    {
      text: t('testimonials.items.5.text'),
      image: "https://randomuser.me/api/portraits/women/5.jpg",
      name: t('testimonials.items.5.name'),
      role: t('testimonials.items.5.role'),
    },
    {
      text: t('testimonials.items.6.text'),
      image: "https://randomuser.me/api/portraits/women/6.jpg",
      name: t('testimonials.items.6.name'),
      role: t('testimonials.items.6.role'),
    },
    {
      text: t('testimonials.items.7.text'),
      image: "https://randomuser.me/api/portraits/men/7.jpg",
      name: t('testimonials.items.7.name'),
      role: t('testimonials.items.7.role'),
    },
    {
      text: t('testimonials.items.8.text'),
      image: "https://randomuser.me/api/portraits/women/8.jpg",
      name: t('testimonials.items.8.name'),
      role: t('testimonials.items.8.role'),
    },
    {
      text: t('testimonials.items.9.text'),
      image: "https://randomuser.me/api/portraits/men/9.jpg",
      name: t('testimonials.items.9.name'),
      role: t('testimonials.items.9.role'),
    },
  ];

  const firstColumn = testimonials.slice(0, 3);
  const secondColumn = testimonials.slice(3, 6);
  const thirdColumn = testimonials.slice(6, 9);

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yLTEuOC00LTQtNHMtNCAxLjgtNCA0IDEuOCA0IDQgNCA0LTEuOCA0LTR6bTQgNGMyLjIgMCA0LTEuOCA0LTRzLTEuOC00LTQtNC00IDEuOC00IDQgMS44IDQgNCA0em0tNCAxNmMyLjIgMCA0LTEuOCA0LTRzLTEuOC00LTQtNC00IDEuOC00IDQgMS44IDQgNCA0em0tNCAwYzAtMi4yLTEuOC00LTQtNHMtNCAxLjgtNCA0IDEuOCA0IDQgNCA0LTEuOCA0LTR6bS00LTE2YzIuMiAwIDQtMS44IDQtNHMtMS44LTQtNC00LTQgMS44LTQgNCAxLjggNCA0IDR6bTIwIDRjMC0yLjItMS44LTQtNC00cy00IDEuOC00IDQgMS44IDQgNCA0IDQtMS44IDQtNHptLTIwIDBjMC0yLjItMS44LTQtNC00cy00IDEuOC00IDQgMS44IDQgNCA0IDQtMS44IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10" />
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mb-6 inline-block rounded-full border border-white/30 bg-white/20 px-4 py-2 backdrop-blur-md">
            <span className="text-sm font-semibold text-white">{t('hero.badge')}</span>
          </div>
          
          <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-7xl">
            {t('hero.welcome')} <span className="text-white/95">iCases.az</span>
          </h1>
          
          <p className="mx-auto mb-8 max-w-2xl text-xl text-white/90 md:text-2xl">
            {t('hero.subtitle')}
          </p>
          
          <div className="mx-auto mb-8 max-w-2xl">
            <div className="flex gap-2 rounded-2xl bg-white p-2 shadow-2xl">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 rounded-xl border-0 px-6 py-4 text-lg outline-none hero-search-input"
              />
              <button 
                onClick={handleSearch}
                className="rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg"
              >
                {t('search')}
              </button>
            </div>
          </div>

          <button 
            onClick={() => navigate('/products')}
            className="rounded-xl bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-2xl transition-all hover:bg-white/90 hover:shadow-xl"
          >
            {t('hero.browseAll')}
          </button>
        </div>
      </section>

      <section 
        ref={containerRef}
        className="relative flex h-[60rem] items-center justify-center bg-background p-2 md:h-[80rem] md:p-20"
      >
        <div className="relative w-full py-10 md:py-40" style={{ perspective: "1000px" }}>
          <motion.div
            style={{ translateY }}
            className="mx-auto mb-8 max-w-5xl text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-foreground md:text-6xl">
              {t('findYourPerfectDevice')}
            </h2>
            <p className="text-xl text-muted-foreground md:text-2xl">
              {t('discoverLatestTechWithBestDeals')}
            </p>
          </motion.div>

          <motion.div
            style={{
              rotateX: rotate,
              scale,
              boxShadow: "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
            }}
            className="-mt-12 mx-auto h-[30rem] w-full max-w-5xl rounded-[30px] border-4 border-[#6C6C6C] bg-[#222222] p-2 shadow-2xl md:h-[40rem] md:p-6"
          >
            <div className="h-full w-full overflow-hidden rounded-2xl bg-gray-100 p-2 dark:bg-zinc-900 md:rounded-2xl md:p-4">
              <img
                src={storeShowcase}
                alt="Store showcase"
                className="h-full w-full rounded-2xl object-cover object-left-top"
                draggable={false}
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-border bg-card py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-foreground">
              {t('categories.title')}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t('categories.subtitle')}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.key}
                onClick={() => handleCategoryClick(category.key)}
                className="cursor-pointer rounded-2xl border-2 border-border bg-card p-8 text-center transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
              >
                <div className="mb-4 text-5xl">{category.icon}</div>
                <h3 className="mb-2 text-xl font-semibold">{category.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {category.count}+ {t('categories.items')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-foreground">
              {t('features.title')}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border-2 border-border bg-card p-8 text-center transition-all hover:shadow-lg"
              >
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-background my-20 relative">
        <div className="container z-10 mx-auto">
          <motionNew.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
          >
            <div className="flex justify-center">
              <div className="testimonials-badge border py-1 px-4 rounded-lg">{t('testimonials.badge')}</div>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-foreground">
              {t('testimonials.title')}
            </h2>
            <p className="text-center mt-5 opacity-75 text-muted-foreground">
              {t('testimonials.subtitle')}
            </p>
          </motionNew.div>

          <div className="flex justify-center gap-6 mt-10 testimonials-mask max-h-[740px] overflow-hidden">
            <TestimonialsColumn testimonials={firstColumn} duration={15} />
            <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
            <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
