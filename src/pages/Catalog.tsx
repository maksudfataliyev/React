import { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronDown, ChevronUp, Weight, Palette, Layers } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { weightRanges } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { usePagination } from '@/hooks/use-pagination';
import { apiCallWithManualRefresh } from '@/shared/apiWithManualRefresh';
import { getCategories, getCategoryAttributesAndValues } from '@/features/services/Category/category.service';
import { getFilteredProducts, searchProductsByTitle } from '@/features/services/product/products.service';
import { useLanguage } from '@/contexts/LanguageContext';

const conditions = ['new', 'likeNew', 'good', 'fair', 'poor'];
const ITEMS_PER_PAGE = 12;

const getCategoryLabel = (cat: string, t: ReturnType<typeof useLanguage>['t']) => {
  if (cat === 'all') return t.catalog.all;
  return t.catalog.categories[cat as keyof typeof t.catalog.categories] || cat;
};

const getConditionLabel = (cond: string, t: ReturnType<typeof useLanguage>['t']) => {
  if (cond === 'all') return t.catalog.all;
  const ct = t.catalog as any;
  const conditionMap: Record<string, string> = {
    new: ct.new ?? 'New',
    // backend calls 'Perfect' for what we call 'likeNew'
    likeNew: ct.perfect ?? ct.likeNew ?? 'Like New',
    good: ct.good ?? 'Good',
    fair: ct.fair ?? 'Fair',
    poor: ct.poor ?? 'Poor',
  };
  return conditionMap[cond] || cond;
};

const CONDITIONS_CODE_MAP: Record<string, number> = {
  new: 0,
  likeNew: 1, // Perfect
  good: 2,
  fair: 3,
  poor: 4,
};

const mapConditionCodeToKey = (code: any): string => {
  if (code === null || code === undefined) return '';
  const num = typeof code === 'number' ? code : parseInt(String(code)) || 0;
  switch (num) {
    case 0:
      return 'new';
    case 1:
      return 'likeNew';
    case 2:
      return 'good';
    case 3:
      return 'fair';
    case 4:
      return 'poor';
    default:
      return String(code) || '';
  }
};

const Catalog = () => {
  const { t, language } = useLanguage() as any;
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  type CategoryNode = { id: string; categoryName: string; children?: CategoryNode[] };
  const [fetchedCategories, setFetchedCategories] = useState<CategoryNode[]>([]);
  const [fetchedAttributes, setFetchedAttributes] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedWeightRanges, setSelectedWeightRanges] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 9999]);
  const [currentPage, setCurrentPage] = useState(1);
  const isInitialLoad = useRef(true);
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [conditionOpen, setConditionOpen] = useState(true);
  const [materialOpen, setMaterialOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [weightOpen, setWeightOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [pendingCategories, setPendingCategories] = useState<string[]>([]);
  const [pendingConditions, setPendingConditions] = useState<string[]>([]);
  const [pendingMaterials, setPendingMaterials] = useState<string[]>([]);
  const [pendingColors, setPendingColors] = useState<string[]>([]);
  const [pendingWeightRanges, setPendingWeightRanges] = useState<string[]>([]);
  const [pendingPriceMin, setPendingPriceMin] = useState('0');
  const [pendingPriceMax, setPendingPriceMax] = useState('9999');
  const [pendingBarter, setPendingBarter] = useState(false);

  // price inputs will be uncontrolled to avoid caret/focus loss while typing
  const pendingMinRef = useRef<HTMLInputElement | null>(null);
  const pendingMaxRef = useRef<HTMLInputElement | null>(null);

  const [selectedBarter, setSelectedBarter] = useState<boolean>(false);

  const togglePendingCategory = (cat: string) => {
    // find all descendant ids (including the node itself) and toggle them as a group
    const collectDescendantIds = (id: string, nodes: CategoryNode[]): string[] => {
      const res: string[] = [];
      const stack: CategoryNode[] = [...nodes];
      while (stack.length) {
        const node = stack.shift()!;
        if (node.id === id) {
          const collect = (n: CategoryNode) => {
            res.push(n.id);
            if (Array.isArray(n.children)) n.children.forEach(c => collect(c));
          };
          collect(node);
          break;
        }
        if (Array.isArray(node.children) && node.children.length > 0) {
          stack.push(...node.children);
        }
      }
      return res;
    };

    const descendantIds = collectDescendantIds(cat, fetchedCategories);
    setPendingCategories(prev => {
      const allSelected = descendantIds.every(id => prev.includes(id));
      if (allSelected) {
        // remove them
        return prev.filter(id => !descendantIds.includes(id));
      } else {
        // add them
        const next = new Set(prev);
        descendantIds.forEach(id => next.add(id));
        return Array.from(next);
      }
    });
  };

  const togglePendingCondition = (cond: string) => {
    setPendingConditions(prev =>
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
  };

  const togglePendingMaterial = (mat: string) => {
    setPendingMaterials(prev =>
      prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]
    );
  };

  const togglePendingColor = (col: string) => {
    setPendingColors(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const togglePendingWeightRange = (range: string) => {
    setPendingWeightRanges(prev =>
      prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]
    );
  };

  const applyFilters = () => {
    setSelectedCategories(pendingCategories);
    setSelectedConditions(pendingConditions);
    setSelectedMaterials(pendingMaterials);
    setSelectedColors(pendingColors);
    setSelectedWeightRanges(pendingWeightRanges);
    setSelectedBarter(pendingBarter);
    const minPrice = Math.max(0, parseInt(pendingPriceMin) || 0);
    const maxPrice = Math.min(9999, parseInt(pendingPriceMax) || 9999);
    setPriceRange([minPrice, maxPrice]);
    setCurrentPage(1);
    setShowMobileFilters(false);

    // Build payload from pending values (not from state, since state updates are async)
    try {
      const payload = buildFilterPayload({
        categories: pendingCategories,
        materials: pendingMaterials,
        colors: pendingColors,
        conditions: pendingConditions,
        page: 1,
        priceRange: [minPrice, maxPrice],
        barter: pendingBarter,
      });
      console.log('[Catalog] Apply Filters -> payload', payload);
    } catch (e) {
      console.error('[Catalog] failed to build filter payload', e);
    }
  };

  const toggleCategory = (cat: string) => {
    // mirror the pending behavior for the currently selected categories
    const collectDescendantIds = (id: string, nodes: CategoryNode[]): string[] => {
      const res: string[] = [];
      const stack: CategoryNode[] = [...nodes];
      while (stack.length) {
        const node = stack.shift()!;
        if (node.id === id) {
          const collect = (n: CategoryNode) => {
            res.push(n.id);
            if (Array.isArray(n.children)) n.children.forEach(c => collect(c));
          };
          collect(node);
          break;
        }
        if (Array.isArray(node.children) && node.children.length > 0) {
          stack.push(...node.children);
        }
      }
      return res;
    };

    setSelectedCategories(prev => {
      const descendantIds = collectDescendantIds(cat, fetchedCategories);
      const allSelected = descendantIds.every(id => prev.includes(id));
      let newVal: string[];
      if (allSelected) {
        newVal = prev.filter(id => !descendantIds.includes(id));
      } else {
        const s = new Set(prev);
        descendantIds.forEach(id => s.add(id));
        newVal = Array.from(s);
      }
      setPendingCategories(newVal);
      return newVal;
    });
  };

  const toggleCondition = (cond: string) => {
    setSelectedConditions(prev => {
      const newVal = prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond];
      setPendingConditions(newVal);
      return newVal;
    });
  };

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials(prev => {
      const newVal = prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat];
      setPendingMaterials(newVal);
      return newVal;
    });
  };

  const toggleColor = (col: string) => {
    setSelectedColors(prev => {
      const newVal = prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col];
      setPendingColors(newVal);
      return newVal;
    });
  };

  const toggleWeightRange = (range: string) => {
    setSelectedWeightRanges(prev => {
      const newVal = prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range];
      setPendingWeightRanges(newVal);
      return newVal;
    });
  };

  const filteredProducts = products.filter((product) => {
    const matchesBarter = !selectedBarter || product.acceptsBarter === true;
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const productCategoryId = product.categoryId ?? (product.category && typeof product.category === 'object' ? product.category.id : String(product.category ?? ''));
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(String(productCategoryId));
    const matchesCondition = selectedConditions.length === 0 || selectedConditions.includes(product.condition);
    const matchesMaterial = selectedMaterials.length === 0 || (product.material && selectedMaterials.includes(product.material));
    const matchesColor = selectedColors.length === 0 || (product.color && selectedColors.includes(product.color));
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

    let matchesWeight = true;
    if (selectedWeightRanges.length > 0 && product.weight) {
      matchesWeight = selectedWeightRanges.some(rangeLabel => {
        const range = weightRanges.find(r => r.label === rangeLabel);
        return range && product.weight! >= range.min && product.weight! <= range.max;
      });
    } else if (selectedWeightRanges.length > 0 && !product.weight) {
      matchesWeight = false;
    }

    return matchesSearch && matchesCategory && matchesCondition && matchesMaterial && matchesColor && matchesPrice && matchesWeight && matchesBarter;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategories, selectedConditions, selectedMaterials, selectedColors, selectedWeightRanges, priceRange]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage,
    totalPages,
    paginationItemsToDisplay: 5,
  });

  const clearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedConditions([]);
    setSelectedMaterials([]);
    setSelectedColors([]);
    setSelectedWeightRanges([]);
    setSelectedBarter(false);
    setPriceRange([0, 9999]);
    setPendingCategories([]);
    setPendingConditions([]);
    setPendingMaterials([]);
    setPendingColors([]);
    setPendingWeightRanges([]);
    setPendingPriceMin('0');
    setPendingPriceMax('9999');
    setPendingBarter(false);
    setCurrentPage(1);
  };

  const hasActiveFilters = search || selectedCategories.length > 0 || selectedConditions.length > 0 ||
    selectedMaterials.length > 0 || selectedColors.length > 0 || selectedWeightRanges.length > 0 ||
    priceRange[0] > 0 || priceRange[1] < 9999 || selectedBarter === true;

  const FiltersSidebar = () => (
    <div className="space-y-6">
      <div className="space-y-4 pb-2 mb-4">
        <p className="font-semibold text-foreground">{t.catalog.price || 'Price'} (₼)</p>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            defaultValue={pendingPriceMin}
            ref={pendingMinRef}
            onInput={(e) => {
              const el = e.target as HTMLInputElement;
              const raw = String(el.value || '');
              // remove non-digits and leading zeros immediately while typing
              const digits = raw.replace(/\D+/g, '').slice(0, 4);
              const normalized = digits.replace(/^0+/, '');
              if (el.value !== normalized) el.value = normalized;
            }}
            onBlur={() => {
              const raw = pendingMinRef.current ? String(pendingMinRef.current.value ?? '') : String(pendingPriceMin || '');
              const digits = raw.replace(/\D+/g, '').slice(0, 4);
              let v = digits === '' ? 0 : (parseInt(digits, 10) || 0);
              if (v < 0) v = 0;
              if (v > 9999) v = 9999;
              setPendingPriceMin(String(v));
              if (pendingMinRef.current) pendingMinRef.current.value = String(v);
            }}
            className="w-full"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            defaultValue={pendingPriceMax}
            ref={pendingMaxRef}
            onInput={(e) => {
              const el = e.target as HTMLInputElement;
              const raw = String(el.value || '');
              const digits = raw.replace(/\D+/g, '').slice(0, 4);
              const normalized = digits.replace(/^0+/, '');
              if (el.value !== normalized) el.value = normalized;
            }}
            onBlur={() => {
              const raw = pendingMaxRef.current ? String(pendingMaxRef.current.value ?? '') : String(pendingPriceMax || '');
              const digits = raw.replace(/\D+/g, '').slice(0, 4);
              let v = digits === '' ? 0 : (parseInt(digits, 10) || 0);
              if (v < 0) v = 0;
              if (v > 9999) v = 9999;
              setPendingPriceMax(String(v));
              if (pendingMaxRef.current) pendingMaxRef.current.value = String(v);
            }}
            className="w-full"
          />
        </div>
      </div>

      <Collapsible open={categoryOpen} onOpenChange={setCategoryOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold text-foreground hover:text-primary transition-colors border-t pt-4">
          {t.catalog.category}
          {categoryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-3">
          {Array.isArray(fetchedCategories) && fetchedCategories.length > 0 ? (
            <div className="space-y-2">
              {fetchedCategories.map((cat) => renderCategoryNode(cat, 0))}
            </div>
          )
            : (
              // fallback: empty list
              <div className="text-sm text-muted-foreground">{t.catalog.noCategories || 'No categories'}</div>
            )}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={conditionOpen} onOpenChange={setConditionOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold text-foreground hover:text-primary transition-colors border-t pt-4">
          {t.catalog.condition}
          {conditionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-3">
          {conditions.map((cond) => (
            <div key={cond} className="flex items-center space-x-3">
              <Checkbox
                id={`cond-${cond}`}
                checked={pendingConditions.includes(cond)}
                onCheckedChange={() => togglePendingCondition(cond)}
              />
              <Label
                htmlFor={`cond-${cond}`}
                className="text-sm font-normal cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
              >
                {getConditionLabel(cond, t)}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={materialOpen} onOpenChange={setMaterialOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold text-foreground hover:text-primary transition-colors border-t pt-4">
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            {t.catalog.material}
          </span>
          {materialOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-3">
          {/** If the backend provided a Material attribute, render its values; otherwise fall back to static list. */}
          {(() => {
            const materialAttr = fetchedAttributes.find(a => String(a.nameBase || a.name || '').toLowerCase().includes('material'));
            if (materialAttr && Array.isArray(materialAttr.values) && materialAttr.values.length > 0) {
              return materialAttr.values.map((val: any) => (
                <div key={val.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`mat-attr-${val.id}`}
                    checked={pendingMaterials.includes(String(val.value))}
                    onCheckedChange={() => togglePendingMaterial(String(val.value))}
                  />
                  <Label
                    htmlFor={`mat-attr-${val.id}`}
                    className="text-sm font-normal cursor-pointer text-muted-foreground hover:text-foreground transition-colors capitalize"
                  >
                    {String(val.value)}
                  </Label>
                </div>
              ));
            }
          })()}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={colorOpen} onOpenChange={setColorOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold text-foreground hover:text-primary transition-colors border-t pt-4">
          <span className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            {t.catalog.color || 'Color'}
          </span>
          {colorOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-3">
          {/** Render color attribute values from backend when available, otherwise fallback to static colors. Values are compared by string. */}
          {(() => {
            const colorAttr = fetchedAttributes.find(a => String(a.nameBase).toLowerCase().includes('color'));
            if (colorAttr && Array.isArray(colorAttr.values) && colorAttr.values.length > 0) {
              return colorAttr.values.map((val: any) => (
                <div key={val.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`col-attr-${val.id}`}
                    checked={pendingColors.includes(String(val.value))}
                    onCheckedChange={() => togglePendingColor(String(val.value))}
                  />
                  <Label
                    htmlFor={`col-attr-${val.id}`}
                    className="text-sm font-normal cursor-pointer text-muted-foreground hover:text-foreground transition-colors capitalize flex items-center gap-2"
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: String(val.valueBase).toLowerCase() }}
                    />
                    {String(val.value)}
                  </Label>
                </div>
              ));
            }
          })()}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={weightOpen} onOpenChange={setWeightOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold text-foreground hover:text-primary transition-colors border-t pt-4">
          <span className="flex items-center gap-2">
            <Weight className="w-4 h-4" />
            {t.catalog.weight}
          </span>
          {weightOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-3">
          {weightRanges.map((range) => (
            <div key={range.label} className="flex items-center space-x-3">
              <Checkbox
                id={`weight-${range.label}`}
                checked={pendingWeightRanges.includes(range.label)}
                onCheckedChange={() => togglePendingWeightRange(range.label)}
              />
              <Label
                htmlFor={`weight-${range.label}`}
                className="text-sm font-normal cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
              >
                {range.label}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">{t.catalog.acceptsBarter ?? 'Accept barter'}</p>
          </div>
          <div>
            <Checkbox
              id="filter-barter"
              checked={pendingBarter}
              onCheckedChange={(val: boolean) => {
                const v = Boolean(val);
                setPendingBarter(v);
                setSelectedBarter(v);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <Button variant="hero" onClick={applyFilters} className="w-full mt-4">
        {t.catalog.toFilter || 'Apply Filters'}
      </Button>

      <Button variant="outline" onClick={() => void handleShowAll()} className="w-full mt-2">
        {t.catalog.all || 'Show All'}
      </Button>

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full gap-2">
          <X className="w-4 h-4" />
          {t.catalog.clear || 'Clear Filters'}
        </Button>
      )}
    </div>
  );

  // helper to render nested category nodes recursively
  const renderCategoryNode = (node: CategoryNode, depth = 0): JSX.Element => (
    <div key={node.id} className={`flex flex-col ${depth > 0 ? 'pl-4' : ''}`}>
      <div className="flex items-center space-x-3">
        <Checkbox
          id={`cat-${node.id}`}
          checked={pendingCategories.includes(String(node.id))}
          onCheckedChange={() => togglePendingCategory(String(node.id))}
        />
        <Label
          htmlFor={`cat-${node.id}`}
          className="text-sm font-normal cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
        >
          {String(node.categoryName)}
        </Label>
      </div>
      {Array.isArray(node.children) && node.children.length > 0 && (
        <div className="mt-2 space-y-2">
          {node.children.map((child) => renderCategoryNode(child, depth + 1))}
        </div>
      )}
    </div>
  );

  // helper to find a category node by id in the nested fetchedCategories tree
  const findCategoryById = (id?: string | null, nodes: CategoryNode[] = fetchedCategories): CategoryNode | null => {
    if (!id) return null;
    const stack: CategoryNode[] = [...nodes];
    while (stack.length) {
      const node = stack.shift()!;
      if (String(node.id) === String(id)) return node;
      if (Array.isArray(node.children) && node.children.length > 0) stack.push(...node.children);
    }
    return null;
  }

  useEffect(() => {
    const loadMeta = async () => {
      setIsLoading(true);
      try {
        const [catsRes, attrsRes] = await Promise.all([
          apiCallWithManualRefresh(() => getCategories(language)),
          apiCallWithManualRefresh(() => getCategoryAttributesAndValues(language)),
        ]);
        console.log('Fetched catalog meta:', { catsRes, attrsRes });
        const catsPayload = catsRes?.data?.data ?? catsRes?.data ?? catsRes ?? [];

        // parse nested categories recursively
        const buildNodes = (nodes: any[]): CategoryNode[] => Array.isArray(nodes) ? nodes.map((n: any) => ({
          id: String(n.id),
          categoryName: n.categoryName ?? n.name ?? '',
          children: Array.isArray(n.children) && n.children.length > 0 ? buildNodes(n.children) : [],
        })) : [];

        const cats = buildNodes(catsPayload);
        setFetchedCategories(cats);

        const attrsPayload = attrsRes?.data?.data ?? attrsRes?.data ?? attrsRes ?? [];
        const attrs = Array.isArray(attrsPayload) ? attrsPayload.map((a: any) => ({
          id: String(a.id),
          name: a.name ?? a.nameBase ?? a.attributeName ?? 'Attribute',
          nameBase: a.nameBase ?? a.name ?? '',
          values: Array.isArray(a.values) ? a.values.map((v: any) => ({ id: String(v.id), value: v.value ?? '', valueBase: v.valueBase ?? '' })) : [],
        })) : [];
        setFetchedAttributes(attrs);
        console.log('Fetched attributes:', attrs);
      } catch (err) {
        console.error('Failed to load catalog meta', err);
      } finally {
        setIsLoading(false);
      }
    };
    void loadMeta();
  }, [language]);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        let productsRes: any;

        if (isInitialLoad.current) {
          console.log('[Catalog] initial load - fetching all products with minimal payload');
          const initPayload: any = { page: 1, pageSize: ITEMS_PER_PAGE };
          initPayload.lang = language;
          initPayload.isBarterAvailable = true;
          productsRes = await apiCallWithManualRefresh(() => getFilteredProducts(initPayload));
          isInitialLoad.current = false;
        } else {
          const payload = buildFilterPayload();
          // include language if backend expects it
          (payload as any).lang = language;
          console.log('[Catalog] fetching products with payload', payload);

          productsRes = await apiCallWithManualRefresh(() => getFilteredProducts(payload));
        }

        console.log('[Catalog] products response', productsRes);

        const items = productsRes?.data?.items ?? productsRes?.items ?? productsRes?.data ?? [];
        console.debug('[Catalog] resolved items length', Array.isArray(items) ? items.length : typeof items);
        const attrs = fetchedAttributes || [];

        // build lookups from current fetchedAttributes
        const lookupById: Record<string, { attributeNameBase: string; value: string; valueBase: string }> = {};
        const lookupByBase: Record<string, { attributeNameBase: string; value: string; valueBase: string }> = {};
        attrs.forEach((a: any) => {
          const attrNameBase = String(a.nameBase || a.name || '').trim();
          (a.values || []).forEach((v: any) => {
            const idKey = String(v.id || '').toLowerCase();
            const baseKey = String(v.valueBase || v.value || '').trim().toLowerCase();
            const localized = String(v.value || '');
            const base = String(v.valueBase || '');
            if (idKey) lookupById[idKey] = { attributeNameBase: attrNameBase, value: localized, valueBase: base };
            if (baseKey) lookupByBase[baseKey] = { attributeNameBase: attrNameBase, value: localized, valueBase: base };
          });
        });

        const mapped = Array.isArray(items) ? items.map((it: any, idx: number) => {
          let resolvedMaterial: string | undefined = it.material ?? undefined;
          let resolvedColor: string | undefined = it.color ?? undefined;

          const attrVals = it.attributeValues ?? it.attributeValueList ?? it.attributes ?? [];
          if (Array.isArray(attrVals) && attrVals.length > 0) {
            attrVals.forEach((av: any) => {
              const rawId = String(av.valueId ?? av.value_id ?? av.id ?? '').trim();
              let found: any = null;

              if (rawId) found = lookupById[rawId.toLowerCase()];

              if (!found) {
                const rawBase = String(av.valueBase ?? av.base ?? av.value ?? av.label ?? '').trim();
                if (rawBase) found = lookupByBase[rawBase.toLowerCase()];
              }

              if (!found) {
                const rawVal = String(av.value ?? av.label ?? av.display ?? '').trim();
                if (rawVal) {
                  const rawLower = rawVal.toLowerCase();
                  for (const a of attrs) {
                    const f = (a.values || []).find((v: any) => {
                      const vv = String(v.value || '').trim().toLowerCase();
                      const vb = String(v.valueBase || '').trim().toLowerCase();
                      return vv === rawLower || vb === rawLower;
                    });
                    if (f) {
                      found = { attributeNameBase: String(a.nameBase || a.name || ''), value: String(f.value || ''), valueBase: String(f.valueBase || '') };
                      break;
                    }
                  }
                }
              }

              if (found) {
                const nameBaseLower = String(found.attributeNameBase || '').toLowerCase();
                if (nameBaseLower.includes('color')) resolvedColor = found.value;
                if (nameBaseLower.includes('material')) resolvedMaterial = found.value;
              }
            });
          }

          return ({
            id: it.id ?? String(Math.random()),
            name: it.productTitle ?? it.title ?? it.name ?? '',
            description: it.description ?? '',
            image: it.mainImage ?? it.image ?? (it.images && it.images[0]) ?? '/placeholder.svg',
            images: Array.isArray(it.images) ? it.images : [],
            price: it.price ?? 0,
            discountPrice: (typeof it.discountPrice === 'number') ? it.discountPrice : (it.discountedPrice ?? 0),
            condition: mapConditionCodeToKey(it.condition),
            dimensions: {
              width: it.width ?? it.dimensions?.width ?? 0,
              height: it.height ?? it.dimensions?.height ?? 0,
              depth: it.depth ?? it.dimensions?.depth ?? 0,
            },
            acceptsBarter: it.isBarterAvailable ?? false,
            seller: it.seller ?? it.storeName ?? it.sellerName ?? '',
            category: (it.category && typeof it.category === 'object') ? String(it.category.categoryName ?? it.category.name ?? '') : (findCategoryById(String(it.category))?.categoryName ?? String(it.category ?? '')),
            categoryId: (it.category && typeof it.category === 'object') ? String(it.category.id ?? '') : String(it.category ?? ''),
            categoryName: (it.category && typeof it.category === 'object') ? String(it.category.categoryName ?? it.category.name ?? '') : (findCategoryById(String(it.category))?.categoryName ?? String(it.category ?? '')),
            isInCart: it.isInCart ?? false,
            isInComparison: it.isInComparison ?? false,
            weight: it.weight ?? undefined,
            material: resolvedMaterial,
            color: resolvedColor,
          });
        }) : [];

        console.log('[Catalog] mapped products:', mapped);
        setProducts(mapped);
        try { console.log('[Catalog] mapped products sample (first 10):', mapped.slice(0, 10).map((p: any) => ({ id: p.id, name: p.name, color: p.color, material: p.material }))); console.debug('[Catalog] mapped products count', mapped.length); } catch (e) { /* ignore */ }
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setIsLoading(false);
      }
    };

    // execute
    void loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, selectedCategories, selectedConditions, selectedMaterials, selectedColors, selectedWeightRanges, priceRange, selectedBarter, currentPage, fetchedAttributes]);

  function buildFilterPayload(overrides?: {
    categories?: string[];
    materials?: string[];
    colors?: string[];
    conditions?: string[];
    page?: number;
    priceRange?: [number, number];
    barter?: boolean;
  }) {
    const valueIdSet = new Set<string>();
    const unmatched: string[] = [];

    const materials = overrides?.materials ?? selectedMaterials;
    const colors = overrides?.colors ?? selectedColors;
    const categories = overrides?.categories ?? selectedCategories;
    const conditions = overrides?.conditions ?? selectedConditions;
    const page = overrides?.page ?? currentPage;
    const pr = overrides?.priceRange ?? priceRange;
    const barter = overrides?.barter ?? selectedBarter;

    const addSelectedValues = (selected: string[], label: string) => {
      for (const sel of selected || []) {
        if (!sel) continue;
        let foundAny = false;
        for (const a of fetchedAttributes || []) {
          const match = (a.values || []).find((v: any) =>
            String(v.value ?? '').trim().toLowerCase() === String(sel).trim().toLowerCase() ||
            String(v.valueBase ?? '').trim().toLowerCase() === String(sel).trim().toLowerCase()
          );
          if (match && match.id) {
            valueIdSet.add(String(match.id));
            foundAny = true;
            console.debug('[Catalog] matched selected', { label, selected: sel, matchId: match.id, matchValue: match.value, matchBase: match.valueBase });
            break;
          }
        }
        if (!foundAny) {
          unmatched.push(sel);
          console.debug('[Catalog] unmatched selected value', { label, selected: sel });
        }
      }
    };

    addSelectedValues(materials, 'material');
    addSelectedValues(colors, 'color');

    if (unmatched.length > 0) console.debug('[Catalog] unmatched selected values (no id found)', unmatched.slice(0, 10));

    // determine condition code expected by backend (single number or null)
    const conditionCode = (conditions && conditions.length === 1) ? (CONDITIONS_CODE_MAP[conditions[0]] ?? null) : null;

    const payload = {
      categoryId: categories && categories.length === 1 ? categories[0] : null,
      page,
      pageSize: ITEMS_PER_PAGE,
      minPrice: pr ? pr[0] || null : null,
      maxPrice: pr ? pr[1] || null : null,
      isBarterAvailable: Boolean
        (barter),
      condition: conditionCode,
      valueIds: Array.from(valueIdSet).filter(Boolean),
      clientId: null,
    };

    return payload;
  }

  // helper to map API items to frontend products (uses current fetchedAttributes)
  function mapApiItemsToProducts(items: any[]) {
    const attrs = fetchedAttributes || [];
    const lookupById: Record<string, { attributeNameBase: string; value: string; valueBase: string }> = {};
    const lookupByBase: Record<string, { attributeNameBase: string; value: string; valueBase: string }> = {};
    attrs.forEach((a: any) => {
      const attrNameBase = String(a.nameBase || a.name || '').trim();
      (a.values || []).forEach((v: any) => {
        const idKey = String(v.id || '').toLowerCase();
        const baseKey = String(v.valueBase || v.value || '').trim().toLowerCase();
        const localized = String(v.value || '');
        const base = String(v.valueBase || '');
        if (idKey) lookupById[idKey] = { attributeNameBase: attrNameBase, value: localized, valueBase: base };
        if (baseKey) lookupByBase[baseKey] = { attributeNameBase: attrNameBase, value: localized, valueBase: base };
      });
    });

    return Array.isArray(items) ? items.map((it: any, idx: number) => {
      let resolvedMaterial: string | undefined = it.material ?? undefined;
      let resolvedColor: string | undefined = it.color ?? undefined;

      const attrVals = it.attributeValues ?? it.attributeValueList ?? it.attributes ?? [];
      if (Array.isArray(attrVals) && attrVals.length > 0) {
        attrVals.forEach((av: any) => {
          const rawId = String(av.valueId ?? av.value_id ?? av.id ?? '').trim();
          let found: any = null;

          if (rawId) found = lookupById[rawId.toLowerCase()];

          if (!found) {
            const rawBase = String(av.valueBase ?? av.base ?? av.value ?? av.label ?? '').trim();
            if (rawBase) found = lookupByBase[rawBase.toLowerCase()];
          }

          if (!found) {
            const rawVal = String(av.value ?? av.label ?? av.display ?? '').trim();
            if (rawVal) {
              const rawLower = rawVal.toLowerCase();
              for (const a of attrs) {
                const f = (a.values || []).find((v: any) => {
                  const vv = String(v.value || '').trim().toLowerCase();
                  const vb = String(v.valueBase || '').trim().toLowerCase();
                  return vv === rawLower || vb === rawLower;
                });
                if (f) {
                  found = { attributeNameBase: String(a.nameBase || a.name || ''), value: String(f.value || ''), valueBase: String(f.valueBase || '') };
                  break;
                }
              }
            }
          }

          if (found) {
            const nameBaseLower = String(found.attributeNameBase || '').toLowerCase();
            if (nameBaseLower.includes('color')) resolvedColor = found.value;
            if (nameBaseLower.includes('material')) resolvedMaterial = found.value;
          }
        });
      }

      return ({
        id: it.id ?? String(Math.random()),
        name: it.productTitle ?? it.title ?? it.name ?? '',
        description: it.description ?? '',
        image: it.mainImage ?? it.image ?? (it.images && it.images[0]) ?? '/placeholder.svg',
        images: Array.isArray(it.images) ? it.images : [],
        price: it.price ?? 0,
        discountPrice: (typeof it.discountPrice === 'number') ? it.discountPrice : (it.discountedPrice ?? 0),
        condition: mapConditionCodeToKey(it.condition),
        dimensions: {
          width: it.width ?? it.dimensions?.width ?? 0,
          height: it.height ?? it.dimensions?.height ?? 0,
          depth: it.depth ?? it.dimensions?.depth ?? 0,
        },
        acceptsBarter: it.isBarterAvailable ?? false,
        seller: it.seller ?? it.storeName ?? it.sellerName ?? '',
        category: (it.category && typeof it.category === 'object') ? String(it.category.categoryName ?? it.category.name ?? '') : (findCategoryById(String(it.category))?.categoryName ?? String(it.category ?? '')),
        categoryId: (it.category && typeof it.category === 'object') ? String(it.category.id ?? '') : String(it.category ?? ''),
        categoryName: (it.category && typeof it.category === 'object') ? String(it.category.categoryName ?? it.category.name ?? '') : (findCategoryById(String(it.category))?.categoryName ?? String(it.category ?? '')),
        isInCart: it.isInCart ?? false,
        isInComparison: it.isInComparison ?? false,
        weight: it.weight ?? undefined,
        material: resolvedMaterial,
        color: resolvedColor,
      });
    }) : [];
  };

  // call backend searchProductsByTitle service and map results
  const handleSearchByTitle = async (page = 1) => {
    setCurrentPage(page);
    setIsLoading(true);
    try {
      const res = await apiCallWithManualRefresh(() => searchProductsByTitle({ title: search, page, pageSize: ITEMS_PER_PAGE, lang: language }));
      const items = res?.data?.items ?? res?.items ?? res?.data ?? [];
      const mapped = mapApiItemsToProducts(items);
      setProducts(mapped);
      console.log('[Catalog] handleSearchByTitle returned', mapped.length, 'items');
    } catch (err) {
      console.error('[Catalog] handleSearchByTitle failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  async function handleShowAll() {
    setShowMobileFilters(false);
    setIsLoading(true);
    try {
      // clear UI filter state
      setPendingCategories([]);
      setPendingConditions([]);
      setPendingMaterials([]);
      setPendingColors([]);
      setPendingWeightRanges([]);
      setPendingPriceMin('0');
      setPendingPriceMax('2000');
      setPendingBarter(false);

      setSelectedCategories([]);
      setSelectedConditions([]);
      setSelectedMaterials([]);
      setSelectedColors([]);
      setSelectedWeightRanges([]);
      setSelectedBarter(false);
      setPriceRange([0, 2000]);
      setSearch('');
      setCurrentPage(1);

      const payload: any = { page: 1, pageSize: ITEMS_PER_PAGE, lang: language };
      const res = await apiCallWithManualRefresh(() => getFilteredProducts(payload));
      const items = res?.data?.items ?? res?.items ?? res?.data ?? [];
      const mapped = mapApiItemsToProducts(items);
      setProducts(mapped);
      console.log('[Catalog] showAll fetched', mapped.length);
    } catch (err) {
      console.error('[Catalog] handleShowAll failed', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Layout>
      <div className="container-custom py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            {t.catalog.title}
          </h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} {t.catalog.itemsFound || 'items found'}
          </p>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card border border-border rounded-xl p-6">
              <h2 className="font-display font-semibold text-lg text-foreground mb-4">
                {t.catalog.filter}
              </h2>
              <FiltersSidebar />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={t.catalog.search}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') void handleSearchByTitle(1); }}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden gap-2"
              >
                {t.catalog.filter}
              </Button>
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategories.map((cat) => {
                  const catObj = findCategoryById(String(cat));
                  const label = catObj ? String(catObj.categoryName) : String(cat);
                  return (
                    <Badge
                      key={cat}
                      variant="secondary"
                      className="cursor-pointer gap-1"
                      onClick={() => toggleCategory(cat)}
                    >
                      {label}
                      <X className="w-3 h-3" />
                    </Badge>
                  );
                })}
                {selectedConditions.map((cond) => (
                  <Badge
                    key={cond}
                    variant="secondary"
                    className="cursor-pointer gap-1"
                    onClick={() => toggleCondition(cond)}
                  >
                    {getConditionLabel(cond, t)}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
                {selectedMaterials.map((mat) => (
                  <Badge
                    key={mat}
                    variant="secondary"
                    className="cursor-pointer gap-1 capitalize"
                    onClick={() => toggleMaterial(mat)}
                  >
                    {mat}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
                {selectedColors.map((col) => (
                  <Badge
                    key={col}
                    variant="secondary"
                    className="cursor-pointer gap-1 capitalize"
                    onClick={() => toggleColor(col)}
                  >
                    {col}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
                {selectedWeightRanges.map((range) => (
                  <Badge
                    key={range}
                    variant="secondary"
                    className="cursor-pointer gap-1"
                    onClick={() => toggleWeightRange(range)}
                  >
                    {range}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
                {(priceRange[0] > 0 || priceRange[1] < 2000) && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer gap-1"
                    onClick={() => setPriceRange([0, 2000])}
                  >
                    ₼{priceRange[0]} - ₼{priceRange[1]}
                    <X className="w-3 h-3" />
                  </Badge>
                )}
              </div>
            )}

            {showMobileFilters && (
              <div className="lg:hidden bg-card border border-border rounded-xl p-6 mb-6 animate-slide-up">
                <FiltersSidebar />
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">{t.catalog.loading || 'Loading...'}</p>
              </div>
            ) : (
              <>
                {paginatedProducts.length > 0 ? (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className="animate-slide-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">{t.catalog.noProducts || 'No products found'}</p>
                    <Button variant="outline" onClick={clearFilters} className="mt-4">
                      {t.catalog.clearFilters || 'Clear Filters'}
                    </Button>
                  </div>
                )}

                {/* Always show pagination controls when there are multiple pages */}
                {totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="h-9 w-9"
                          >
                            ←
                          </Button>
                        </PaginationItem>

                        {showLeftEllipsis && (
                          <>
                            <PaginationItem>
                              <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          </>
                        )}

                        {pages.map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                        {showRightEllipsis && (
                          <>
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                                {totalPages}
                              </PaginationLink>
                            </PaginationItem>
                          </>
                        )}

                        <PaginationItem>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="h-9 w-9"
                          >
                            →
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Catalog;