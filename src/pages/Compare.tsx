import { Link } from 'react-router-dom';
import { X, ArrowRight, Scale, ShoppingBag, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCompare } from '@/contexts/CompareContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

const getConditionLabel = (condition: string, t: ReturnType<typeof useLanguage>['t']) => {
  const conditionMap: Record<string, string> = {
    new: t.catalog.new,
    likeNew: t.catalog.likeNew,
    good: t.catalog.good,
    fair: t.catalog.fair,
  };
  return conditionMap[condition] || condition;
};

const getConditionColor = (condition: string) => {
  switch (condition) {
    case 'new':
      return 'bg-sage text-sage-dark';
    case 'likeNew':
      return 'bg-primary/20 text-primary';
    case 'good':
      return 'bg-muted text-muted-foreground';
    case 'fair':
      return 'bg-destructive/20 text-destructive';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const Compare = () => {
  const { t } = useLanguage();
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  // ensure hooks are declared unconditionally to avoid hook order mismatch
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  if (compareList.length === 0) {
    return (
      <Layout>
        <div className="container-custom py-20 min-h-[60vh] flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-sage/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Scale className="w-12 h-12 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              {t.compare.title}
            </h1>
            <p className="text-muted-foreground mb-8">{t.compare.empty}</p>
            <Link to="/catalog">
              <Button variant="hero" size="lg">
                <ShoppingBag className="w-5 h-5 mr-2" />
                {t.compare.browseCatalog}
              </Button>
            </Link>
          </motion.div>
        </div>
      </Layout>
    );
  }

  const baseCompareFields = [
    { key: 'price', label: t.catalog.price, render: (p: any) => (
      <span className="font-display text-2xl font-bold text-primary">₼{p.price}</span>
    )},
    { key: 'condition', label: t.product.condition, render: (p: any) => (
      <Badge className={`${getConditionColor(p.condition)} px-3 py-1`}>{getConditionLabel(p.condition, t)}</Badge>
    )},
    { key: 'dimensions', label: t.product.dimensions, render: (p: any) => (
      <div className="text-foreground">
        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
          {p.dimensions.width} × {p.dimensions.height} × {p.dimensions.depth} cm
        </span>
      </div>
    )},
    { key: 'barter', label: t.compare.barter, render: (p: any) => (
      <Badge variant={p.acceptsBarter ? 'default' : 'secondary'} className={p.acceptsBarter ? 'bg-sage text-sage-dark px-3 py-1' : 'px-3 py-1'}>
        {p.acceptsBarter ? '✓ ' + t.compare.yes : t.compare.no}
      </Badge>
    )},
    { key: 'seller', label: t.product.seller, render: (p: any) => (
      <span className="text-muted-foreground font-medium">{p.seller}</span>
    )},
  ];

  const getCategoryName = (p: any) => {
    if (typeof p.category === 'string' && p.category) return p.category;
    if (typeof p.categoryName === 'string' && p.categoryName) return p.categoryName;
    if (p.category && typeof p.category === 'object') return p.category.categoryName ?? p.category.name ?? 'Uncategorized';
    return 'Uncategorized';
  };

  // Prepare category grouping for sidebar and anchors
  const groups: Record<string, typeof compareList> = {};
  for (const p of compareList) {
    // normalize product shape to expected compare product
    const normalizeProduct = (raw: any) => {
      // raw may be either product object or API item wrapper
      const id = raw.id ?? raw.productId ?? raw.product?.id ?? String(raw.productId ?? raw.id ?? raw.product?.id ?? '')
      const name = raw.name ?? raw.title ?? raw.product?.title ?? raw.product?.name ?? ''
      const image = raw.image ?? raw.mainImage ?? raw.product?.mainImage ?? raw.product?.image ?? ''
      const price = raw.price ?? raw.product?.price ?? raw.discountPrice ?? 0
      const width = raw.dimensions?.width ?? raw.width ?? raw.product?.width ?? 0
      const height = raw.dimensions?.height ?? raw.height ?? raw.product?.height ?? 0
      const depth = raw.dimensions?.depth ?? raw.depth ?? raw.product?.depth ?? 0
      const acceptsBarter = raw.acceptsBarter ?? raw.isBarterAvailable ?? raw.product?.acceptsBarter ?? false
      // map numeric condition to string keys used by getConditionLabel
      const conditionNum = raw.condition ?? raw.product?.condition ?? null
      const conditionMapNumeric: Record<number, string> = { 1: 'new', 2: 'likeNew', 3: 'good', 4: 'fair' }
      const condition = typeof conditionNum === 'number' ? (conditionMapNumeric[conditionNum] ?? 'good') : (raw.condition ?? raw.product?.condition ?? 'good')
      const categoryName = raw.categoryName ?? raw.product?.categoryName ?? getCategoryName(raw)
      const seller = raw.seller ?? raw.product?.seller ?? raw.ownerName ?? ''
      // extract material and color from attributes array if present
      const attrs = raw.attributes ?? raw.product?.attributes ?? raw._raw?.attributes ?? [];
      const getAttrValue = (arr: any[] | undefined, keywords: string[]): string | undefined => {
        if (!Array.isArray(arr)) return undefined;
        const lowKeys = keywords.map(k => k.toLowerCase());
        const found = arr.find((a: any) => {
          const an = String(a.attributeName ?? a.attributeNameEn ?? a.attributeNameRu ?? '').toLowerCase();
          return lowKeys.some(k => an.includes(k));
        });
        if (!found) return undefined;
        return found.value ?? found.valueEn ?? found.valueRu ?? undefined;
      };
      // prefer already normalized fields, then original raw._raw attrs, then attributes array
      const color = raw.color ?? raw._raw?.color ?? getAttrValue(attrs, ['color', 'цвет']);
      const material = raw.material ?? raw._raw?.material ?? getAttrValue(attrs, ['material', 'материал', 'wood', 'metal', 'дерев', 'древес']);
      return {
        id,
        name,
        image,
        price,
        dimensions: { width, height, depth },
        acceptsBarter,
        condition,
        categoryName,
        seller,
        material,
        color,
        // keep original raw for advanced use
        _raw: raw,
      }
    }

    const normalized = normalizeProduct(p as any);
    const cat = normalized.categoryName ?? 'Uncategorized';
    if (!groups[cat]) groups[cat] = [] as typeof compareList;
    groups[cat].push(normalized as any);
  }
  const categories = Object.keys(groups);

  // If a category is active, only show that group
  const filteredGroups = activeCategory ? { [activeCategory]: groups[activeCategory] ?? [] } : groups;

  // Flatten active products for property rows (either selected category or all)
  const activeProducts = activeCategory ? (groups[activeCategory] ?? []) : compareList;

  // flattened list of visible products (use for compare grid and actions)
  const visibleProducts = Object.values(filteredGroups).flat();

  // debug: check attributes on visible products
  const firstAttrs = (visibleProducts[0] as any)? ( (visibleProducts[0] as any)._raw?.attributes ?? (visibleProducts[0] as any).attributes ?? null) : null;
 
   // collect dynamic attribute keys from visibleProducts' raw attributes
   const dynamicAttrKeys: string[] = [];
   for (const vpAny of visibleProducts as any[]) {
     const attrs = vpAny._raw?.attributes ?? vpAny.attributes ?? [];
     if (!Array.isArray(attrs)) continue;
     for (const a of attrs) {
       const key = a.attributeName ?? a.attributeNameEn ?? a.attributeNameRu ?? a.attributeId ?? null;
       if (!key) continue;
       if (!dynamicAttrKeys.includes(key)) dynamicAttrKeys.push(key);
     }
   }

   // build final compareFields including dynamic attribute rows (labels come from attributeName)
   const compareFields = [
     ...baseCompareFields,
     ...dynamicAttrKeys.map(k => ({
       key: `attr:${k}`,
       label: k,
       render: (p: any) => {
         const attrs = p._raw?.attributes ?? p.attributes ?? [];
         if (!Array.isArray(attrs)) return '-';
         const found = attrs.find((a: any) => (a.attributeName ?? a.attributeNameEn ?? a.attributeNameRu) === k || (a.attributeId && a.attributeId === k));
         return <span className="text-foreground">{found ? (found.value ?? found.valueEn ?? found.valueRu ?? '-') : '-'}</span>;
       }
     }))
   ];

   return (
     <Layout>
       <div className="container-custom py-8">
         <motion.div 
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10"
         >
           <div className="flex items-center gap-4">
             <div>
               <h1 className="font-display text-3xl font-bold text-foreground">
                 {t.compare.title}
               </h1>
               <p className="text-muted-foreground flex items-center gap-2">
                 <Sparkles className="w-4 h-4" />
                 {compareList.length} {t.compare.itemsSelected}
               </p>
             </div>
           </div>
           <Button variant="outline" onClick={clearCompare} className="shrink-0 gap-2">
             <X className="w-4 h-4" />
             {t.compare.clear}
           </Button>
         </motion.div>

         {/* Two-column layout: sidebar (categories) + main (grouped products) */}
         <div className="flex gap-8 mb-10">
           <aside className="hidden lg:block w-56 shrink-0">
             <div className="sticky top-24">
               <h4 className="text-sm font-medium text-muted-foreground mb-3">{t.compare.categories}</h4>
               <div className="bg-card border border-border rounded-lg p-3 space-y-2">
                 {categories.map((cat) => (
                   <button
                     key={cat}
                     onClick={() => setActiveCategory(cat)}
                     className={`w-full text-left text-sm py-1 ${activeCategory === cat ? 'text-primary font-semibold' : 'text-foreground hover:text-primary'}`}
                   >
                     {cat} <span className="text-muted-foreground">({groups[cat].length})</span>
                   </button>
                 ))}
               </div>
             </div>
           </aside>

           <main className="flex-1">
             <div className="space-y-8">
               {Object.entries(filteredGroups).map(([cat, products]) => (
                 <div key={cat} id={`cat-${cat.replace(/\s+/g, '-').toLowerCase()}`}>
                   <h3 className="text-lg font-semibold mb-4">{cat}</h3>
                   {/* Always display products in a horizontal row with scroll */}
                   <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.1 }}
                     className="flex gap-6 overflow-x-auto py-4 scrollbar-thin scrollbar-thumb-muted/40"
                   >
                     {products.map((product, index) => (
                       <motion.div
                         key={product.id}
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: 0.1 + index * 0.05 }}
                         className="relative group min-w-[220px] flex-shrink-0"
                       >
                         <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                           <button
                             onClick={() => removeFromCompare(product.id)}
                             className="absolute top-3 right-3 z-10 w-8 h-8 bg-destructive/90 hover:bg-destructive text-destructive-foreground rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                           >
                             <X className="w-4 h-4" />
                           </button>
                           <Link to={`/product/${product.id}`} className="block">
                             <div className={`${activeCategory ? 'h-44 flex items-center justify-center' : 'aspect-square'} overflow-hidden bg-muted`}>
                               <img
                                 src={product.image}
                                 alt={product.name}
                                 className={`${activeCategory ? 'max-h-full w-auto object-contain' : 'w-full h-full object-cover'} group-hover:scale-105 transition-transform duration-500`}
                               />
                             </div>
                             <div className="p-5 text-center">
                               <h3 className="font-display font-semibold text-foreground line-clamp-2 text-lg mb-2">
                                 {product.name}
                               </h3>
                               <p className="text-2xl font-bold text-primary font-display">₼{product.price}</p>
                             </div>
                           </Link>
                         </div>
                       </motion.div>
                     ))}
                   </motion.div>
                 </div>
               ))}
             </div>
           </main>
         </div>

         <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.2 }}
           className="bg-card border border-border rounded-2xl overflow-x-auto scrollbar-thin scrollbar-thumb-muted/40 shadow-sm"
         >
           {compareFields.map((field, index) => (
             <div
               key={field.key}
               className={`grid gap-6 py-5 px-6 ${index % 2 === 0 ? 'bg-muted/30' : 'bg-card'} ${index !== compareFields.length - 1 ? 'border-b border-border/50' : ''}`}
               style={{ gridTemplateColumns: `180px repeat(${visibleProducts.length}, 1fr)` }}
             >
               <div className="flex items-center">
                 <span className="font-semibold text-foreground">
                   {field.label}
                 </span>
               </div>
               {visibleProducts.map((product: any) => (
                 <div key={product.id} className="flex items-center justify-center">
                   {field.render(product)}
                 </div>
               ))}
             </div>
           ))}
         </motion.div>

         <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="grid gap-6 mt-8 overflow-x-auto scrollbar-thin scrollbar-thumb-muted/40"
           style={{ gridTemplateColumns: `180px repeat(${visibleProducts.length}, 1fr)` }}
         >
           <div />
           {visibleProducts.map((product: any) => (
             <Link key={product.id} to={`/product/${product.id}`}>
               <Button variant="hero" className="w-full gap-2">
                 {t.compare.viewDetails}
                 <ArrowRight className="w-4 h-4" />
               </Button>
             </Link>
           ))}
         </motion.div>
       </div>
     </Layout>
   );
};

export default Compare;
