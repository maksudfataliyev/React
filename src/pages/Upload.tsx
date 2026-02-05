import { useContext, useEffect, useState } from 'react';
import { Upload as UploadIcon, X, ImagePlus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useListings } from '@/contexts/ListingsContext';
import { toast } from '@/hooks/use-toast';
import { materials, colors } from '@/data/products';
import { AuthContext } from '@/features/auth/contexts/AuthProvider';
import { apiCallWithManualRefresh } from '@/shared/apiWithManualRefresh';
import { getCategories, getCategoryAttributesAndValues } from '@/features/services/Category/category.service';
import { addProduct, editProduct, getProductDetailsById } from '@/features/services/product/products.service';
import { uploadImage, getImage } from '@/shared/utils/imagePost';

const conditions = ['new', 'likeNew', 'good', 'fair', 'poor'] as const;

// Map UI condition keys to API numeric codes
const CONDITION_MAP: Record<string, number> = {
  new: 1,
  likeNew: 2,
  good: 3,
  fair: 4,
  poor: 5,
};

const getConditionLabel = (cond: string, t: ReturnType<typeof useLanguage>['t']) => {
  const conditionMap: Record<string, string> = {
    new: t.catalog.new,
    likeNew: t.catalog.likeNew,
    good: t.catalog.good,
    fair: t.catalog.fair,
    poor: t.catalog.poor,
  };
  return conditionMap[cond] || cond;
};

const Upload = () => {
  const { t, language } = useLanguage() as any;
  const { isAuthenticated, user } = useContext(AuthContext) as any;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [images, setImages] = useState<string[]>([]);
  // keep selected File objects to upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [acceptBarter, setAcceptBarter] = useState(true);
  const [name, setName] = useState('');
  // list of categories returned from API (objects with id + categoryName)
  const [fetchedCategories, setFetchedCategories] = useState<{ id: string; categoryName: string }[]>([]);
  // fetched attributes (each has id, name, values[])
  const [fetchedAttributes, setFetchedAttributes] = useState<any[]>([]);
  // selected values per attribute id
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  // currently selected category id
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [price, setPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [depth, setDepth] = useState('');
  const [weight, setWeight] = useState('');
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [status, setStatus] = useState('');
  const [description, setDescription] = useState('');
  const [inStock, setInStock] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // when edit query param present, fetch product details and prefill form
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (!editId) return;

    const loadForEdit = async () => {
      try {
        console.log('[Upload] edit mode detected, fetching product', editId, 'lang', language);
        const res = await apiCallWithManualRefresh(() => getProductDetailsById(String(editId), language));
        let item = res?.data?.data ?? res?.data ?? res;
        if (item && Array.isArray(item.items) && item.items.length > 0) item = item.items[0];
        if (Array.isArray(item)) item = item[0];
        if (!item) {
          console.warn('[Upload] no product data returned for edit id', editId);
          return;
        }

        // map basic fields
        setIsEditing(true);
        setEditingProductId(String(editId));
        setName(item.productTitle ?? item.title ?? item.name ?? '');
        const imgs = Array.isArray(item.images) && item.images.length > 0 ? item.images : (item.mainImage ? [item.mainImage] : []);
        // Resolve object names to actual URLs when possible
        const resolvedImgs: string[] = [];
        for (const imgSrc of imgs.slice(0, 5)) {
          try {
            const s = String(imgSrc ?? '');
            // if it looks like an objectName (no protocol), try to fetch URL via getImage
            if (s && !s.startsWith('http') && !s.startsWith('data:')) {
              try {
                const urlResp = await apiCallWithManualRefresh(() => getImage(s));
                // normalize possible response shapes; cast to any to access properties safely
                const anyResp: any = urlResp as any;
                const url = typeof urlResp === 'string' ? urlResp : (anyResp?.data ?? anyResp?.url ?? anyResp);
                resolvedImgs.push(String(url ?? s));
              } catch (e) {
                // fallback to original string
                resolvedImgs.push(s);
              }
            } else {
              resolvedImgs.push(s);
            }
          } catch (e) {
            // ignore and push raw
            resolvedImgs.push(String(imgSrc));
          }
        }
        setImages(resolvedImgs.slice(0, 5));
        setImageFiles([]);
        setCategory(item.category && typeof item.category === 'object' ? String(item.category.id ?? item.categoryId ?? '') : String(item.category ?? ''));

        // map condition (API numeric -> UI key)
        const apiCond = item.condition ?? item.product?.condition ?? null;
        const conditionKey = Object.keys(CONDITION_MAP).find(k => String(CONDITION_MAP[k]) === String(apiCond) || Number(apiCond) === CONDITION_MAP[k]) ?? '';
        setCondition(conditionKey);

        // map status (string or numeric) if provided — normalize to dropdown keys
        const rawStatus = item.status ?? item.state ?? item.product?.status ?? null;
        setStatus(mapToDropdownStatus(rawStatus));

        setPrice(item.price != null ? String(item.price) : (item.priceAmount ? String(item.priceAmount) : ''));
        setDiscountedPrice(item.discountPrice != null ? String(item.discountPrice) : (item.discountedPrice ? String(item.discountedPrice) : ''));
        setWidth(item.width != null ? String(item.width) : (item.dimensions?.width ? String(item.dimensions.width) : ''));
        setHeight(item.height != null ? String(item.height) : (item.dimensions?.height ? String(item.dimensions.height) : ''));
        setDepth(item.depth != null ? String(item.depth) : (item.dimensions?.depth ? String(item.dimensions.depth) : ''));
        setWeight(item.weight != null ? String(item.weight) : '');
        // prefill inStock using common backend keys
        const prefStock = item.inStock ?? item.in_stock ?? item.quantity ?? item.stock ?? item.inventory ?? item.inventoryCount ?? null;
        setInStock(prefStock != null ? String(prefStock) : '');
        setAcceptBarter(Boolean(item.isBarterAvailable ?? item.acceptsBarter ?? false));
        setDescription(item.description ?? item.product?.description ?? '');
        setInStock(item.inStock != null ? String(item.inStock) : '');

        // map attributes: try to resolve value ids into selectedAttributes by matching fetchedAttributes
        const attrVals = item.attributeValues ?? item.attributeValueList ?? item.attributes ?? [];
        if (Array.isArray(attrVals) && fetchedAttributes && fetchedAttributes.length > 0) {
          const sel: Record<string, string> = {};
          for (const a of fetchedAttributes) {
            // try to find a matching attrVal for this attribute by id or by name
            const found = attrVals.find((av: any) => {
              // av may contain attributeId, attribute_id, attributeName, attributeNameEn etc
              const aid = String(av.attributeId ?? av.attribute_id ?? av.attribute?.id ?? '');
              if (aid && String(a.id) === aid) return true;
              const an = String(av.attributeName ?? av.attributeNameEn ?? av.name ?? av.attribute?.name ?? '').toLowerCase();
              if (an && String(a.name).toLowerCase().includes(an)) return true;
              return false;
            });
            if (found) {
              const valId = String(found.valueId ?? found.value_id ?? found.id ?? found.valueId ?? '');
              // if valId is not present, try to match by value string
              if (valId) sel[a.id] = valId;
              else {
                const rawVal = String(found.value ?? found.label ?? found.display ?? '').trim().toLowerCase();
                if (rawVal) {
                  const matched = (a.values || []).find((v: any) => String(v.value || '').trim().toLowerCase() === rawVal || String(v.valueBase || '').trim().toLowerCase() === rawVal);
                  if (matched) sel[a.id] = String(matched.id);
                }
              }
            }
          }

          // apply selections if any
          if (Object.keys(sel).length > 0) setSelectedAttributes(prev => ({ ...prev, ...sel }));
        } else {
          // fallback: set material/color fields if available
          setMaterial(item.material ?? item.materialName ?? '');
          setColor(item.color ?? item.colorName ?? '');
        }

        console.log('[Upload] prefilled form for edit id', editId);
      } catch (err) {
        console.error('[Upload] failed to load product for edit', err);
      }
    };

    void loadForEdit();
  }, [searchParams, language, fetchedAttributes]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        var result = await apiCallWithManualRefresh(() => getCategories(language));
        const payload = result?.data?.data ?? result?.data ?? result ?? [];

        // build recursive nodes and collect leaf categories only
        const buildNodes = (nodes: any[]): any[] => Array.isArray(nodes) ? nodes.map((n: any) => ({
          id: String(n.id),
          categoryName: n.categoryName ?? n.name ?? '',
          children: Array.isArray(n.children) && n.children.length > 0 ? buildNodes(n.children) : [],
        })) : [];

        const collectLeaves = (nodes: any[], out: any[] = []) => {
          for (const n of nodes) {
            if (!Array.isArray(n.children) || n.children.length === 0) {
              out.push({ id: String(n.id), categoryName: n.categoryName });
            } else {
              collectLeaves(n.children, out);
            }
          }
          return out;
        };

        const nodes = buildNodes(Array.isArray(payload) ? payload : []);
        const leaves = collectLeaves(nodes);

        setFetchedCategories(leaves);
      } catch (error) {
      }
    };
    fetchCategories();

    const fetchAttributes = async () => {
      try {
        const res = await apiCallWithManualRefresh(() => getCategoryAttributesAndValues(language));
        const payload = res?.data?.data ?? res?.data ?? res ?? [];
        const attrs = Array.isArray(payload) ? payload : (payload.data ?? []);
        const normalizedAttrs = attrs.map((a: any) => ({
          id: String(a.id),
          name: a.name ?? a.attributeName ?? 'Attribute',
          values: Array.isArray(a.values) ? a.values.map((v: any) => ({ id: String(v.id), value: v.value })) : [],
        }));
        setFetchedAttributes(normalizedAttrs);
        console.log('Category attributes fetched:', normalizedAttrs);
      } catch (err) {
        console.error('Error fetching category attributes:', err);
      }
    };

    void fetchAttributes();
  }, [language]);


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files).slice(0, 5);
    const newPreviews = fileArray.map(file => URL.createObjectURL(file));

    setImages(prev => [...prev, ...newPreviews].slice(0, 5));
    setImageFiles(prev => [...prev, ...fileArray].slice(0, 5));
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // helper: extract storage object name from a given image src (URL or path)
  const extractObjectName = (src: string) => {
    if (!src) return '';
    try {
      const u = new URL(src);
      const parts = u.pathname.split('/').filter(Boolean);
      return parts.length > 0 ? parts[parts.length - 1] : src;
    } catch (e) {
      // not a full URL (could be already an objectName or a path)
      const parts = src.split('/').filter(Boolean);
      return parts.length > 0 ? parts[parts.length - 1] : src;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: 'Error',
        description: 'Please login to submit a listing',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (!name || !category || !condition || !price) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    // validate discounted price if provided
    if (discountedPrice) {
      const p = parseFloat(price) || 0;
      const d = parseFloat(discountedPrice) || 0;
      if (d > p) {
        toast({ title: 'Error', description: 'Discounted price cannot be greater than the original price', variant: 'destructive' });
        return;
      }
    }

    // if backend provides category attributes, ensure user selected values for all required attributes
    if (fetchedAttributes.length > 0) {
      const missing = fetchedAttributes.filter(attr => !selectedAttributes[attr.id]);
      if (missing.length > 0) {
        const names = missing.map(m => m.name).join(', ');
        toast({ title: 'Error', description: `Please select: ${names}`, variant: 'destructive' });
        return;
      }
    }

    // validate inStock (obligatory) and ensure non-negative integer
    if (inStock === '' || isNaN(Number(inStock)) || Number(inStock) < 0) {
      toast({ title: 'Error', description: 'Please provide a valid non-negative stock quantity', variant: 'destructive' });
      return;
    }

    const numericFields: { name: string; value: string }[] = [
      { name: 'Price', value: price },
      { name: 'Discounted price', value: discountedPrice },
      { name: 'Width', value: width },
      { name: 'Height', value: height },
      { name: 'Depth', value: depth },
      { name: 'Weight', value: weight },
      { name: 'In stock', value: inStock },
    ];

    for (const field of numericFields) {
      if (field.value !== '') {
        const num = Number(field.value);
        if (isNaN(num)) {
          toast({ title: 'Error', description: `${field.name} must be a valid number`, variant: 'destructive' });
          return;
        }
        if (num < 0) {
          toast({ title: 'Error', description: `${field.name} cannot be negative`, variant: 'destructive' });
          return;
        }
      }
    }

    const uploadedImageNames: string[] = [];
    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        try {
          const objectName: string = await apiCallWithManualRefresh(() => uploadImage(file));
          uploadedImageNames.push(objectName);
        } catch (err) {
          console.warn('Image upload failed for file', file.name, err);
          uploadedImageNames.push('');
        }
      }
    } else {
      // No new files selected — convert existing image URLs/paths into object names
      for (const fileSrc of images) {
        const objectName = extractObjectName(String(fileSrc));
        uploadedImageNames.push(objectName);
      }
    }

    let valueIds: string[] = [];
    if (fetchedAttributes && fetchedAttributes.length > 0) {
      valueIds = Object.values(selectedAttributes || {}).filter(Boolean).map(v => String(v));
    } else {
      // no fetched attributes available — unable to resolve static material/color to value ids
      valueIds = [];
    }

    const productPayload = {
      title: name,
      description,
      clientProfileId: user?.client_profile_id ?? user?.clientProfileId ?? null,
      categoryId: category ?? null,
      price: parseFloat(price) || 1,
      discountPrice: discountedPrice ? parseFloat(discountedPrice) : 0,
      inStock: parseInt(inStock, 10) || 0,
      weight: typeof weight === 'string' && weight ? parseFloat(weight) : 0,
      width: typeof width === 'string' && width ? parseFloat(width) : 0,
      height: typeof height === 'string' && height ? parseFloat(height) : 0,
      depth: typeof depth === 'string' && depth ? parseFloat(depth) : 0,
      isBarterAvailable: acceptBarter,
      images: uploadedImageNames,
      condition: CONDITION_MAP[condition] ?? null,
      valueIds,
      sourceLanguage: language ?? null,
    };

    setIsSubmitting(true);
    try {
      let resp: any;
      if (isEditing && editingProductId) {
        const editPayload: any = {
          title: name || null,
          description: description || null,
          categoryId: category || null,
          price: price ? parseFloat(price) : null,
          discountPrice: discountedPrice ? parseFloat(discountedPrice) : null,
          width: width ? parseFloat(width) : null,
          height: height ? parseFloat(height) : null,
          depth: depth ? parseFloat(depth) : null,
          weight: weight ? parseFloat(weight) : null,
          inStock: (inStock !== '' ? parseInt(inStock, 10) : null),
          images: uploadedImageNames.length > 0 ? uploadedImageNames : null,
          condition: CONDITION_MAP[condition] ?? null,
          isBarterAvailable: typeof acceptBarter === 'boolean' ? acceptBarter : null,
          valueIds: (valueIds && valueIds.length > 0) ? valueIds : null,
          status: status ? dropdownToStatusCode(status) : null,
          sourceLanguage: language ?? null,
        };

        resp = await apiCallWithManualRefresh(() => editProduct(String(editingProductId), editPayload));
      } else {
        resp = await apiCallWithManualRefresh(() => addProduct(productPayload as any));
      }
      console.log('addProduct response', resp);

      const ok = resp?.data?.isSuccess ?? (typeof resp?.status === 'number' && resp.status >= 200 && resp.status < 300);
      if (!ok) {
        const msg = resp?.data?.message ?? 'Failed to submit product';
        toast({ title: 'Error', description: msg, variant: 'destructive' });
        setIsSubmitting(false);
        return;
      }

      toast({ title: 'Success!', description: isEditing ? 'Your listing has been updated.' : 'Your listing has been submitted for review.' });
    } catch (err) {
      console.error('Failed to add product', err);
      toast({ title: 'Error', description: 'Failed to submit product', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);

    setName('');
    setCategory('');
    setCondition('');
    setPrice('');
    setDiscountedPrice('');
    setWidth('');
    setHeight('');
    setDepth('');
    setWeight('');
    setMaterial('');
    setColor('');
    setDescription('');
    setImages([]);
    setImageFiles([]);
    setAcceptBarter(true);
    setInStock('');

    navigate('/dashboard?tab=mylistings');
  };

  // helper to normalize backend status to dropdown values
  const mapToDropdownStatus = (raw: any) => {
    if (raw === null || typeof raw === 'undefined') return '';
    const s = String(raw).toLowerCase();
    // numeric codes
    if (s === '0' || s === '00') return 'active';
    if (s === '1') return 'sold';
    if (s === '2') return 'archived';
    // common backend keys -> map to our dropdown values
    if (['active', 'approved', 'available'].includes(s)) return 'active';
    if (['sold', 'soldout', 'sold_out'].includes(s)) return 'sold';
    if (['archived', 'deleted', 'inactive', 'archieve'].includes(s)) return 'archived';
    // pending review/under review default to active in dropdown (or leave empty)
    if (['pending', 'pending_review', 'under_review', 'pendingreview'].includes(s)) return 'active';
    // otherwise, if it already exactly matches one of our keys, return it
    if (['active', 'sold', 'archived'].includes(s)) return s;
    return '';
  };

  // helper: convert dropdown status key to backend numeric code
  const dropdownToStatusCode = (key: string | null | undefined): number | null => {
    if (!key) return null;
    switch (String(key)) {
      case 'active': return 0;
      case 'sold': return 1;
      case 'archived': return 2;
      default: return null;
    }
  };

  return (
    <Layout>
      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
              {t.upload.title}
            </h1>
            <p className="text-muted-foreground">
              {t.upload.subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <Label className="text-lg font-semibold mb-4 block">{t.upload.images}</Label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={img}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                    <ImagePlus className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground text-center px-2">
                      {t.upload.dragDrop}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              <div className="sm:col-span-3">
                <Label htmlFor="name">{t.upload.name}</Label>
                <Input
                  id="name"
                  placeholder={t.upload.namePlaceholder || "e.g., Vintage Oak Armchair"}
                  className="mt-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="category">{t.upload.category}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={t.upload.categoryPlaceholder || "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {fetchedCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="condition">{t.upload.condition}</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={t.upload.conditionPlaceholder || "Select condition"} />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map(cond => (
                      <SelectItem key={cond} value={cond}>
                        {getConditionLabel(cond, t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">{t.upload.status}</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={`${t.upload.statusPlaceholder} `} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t.listings?.status?.active || 'Active'}</SelectItem>
                    <SelectItem value="sold">{t.listings?.status?.sold || 'Sold'}</SelectItem>
                    <SelectItem value="archived">{t.listings?.status?.archived || 'Archived'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="price">{t.upload.price} (₼)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder={t.upload.pricePlaceholder || "0"}
                  className="mt-2"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="discountedPrice">{t.upload.discountedPrice} (₼)</Label>
                <Input
                  id="discountedPrice"
                  type="number"
                  placeholder={t.upload.discountedPricePlaceholder || "0"}
                  className="mt-2"
                  value={discountedPrice}
                  onChange={(e) => setDiscountedPrice(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="inStock">{t.upload.inStock}</Label>
                <Input
                  id="inStock"
                  type="number"
                  placeholder={t.upload.inStockPlaceholder || "0"}
                  className="mt-2"
                  value={inStock}
                  onChange={(e) => setInStock(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className="text-lg font-semibold mb-4 block">{t.upload.dimensions} (cm)</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="width" className="text-sm">{t.upload.width}</Label>
                  <Input
                    id="width"
                    type="number"
                    placeholder={t.upload.widthPlaceholder || "0"}
                    className="mt-1"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="text-sm">{t.upload.height}</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder={t.upload.heightPlaceholder || "0"}
                    className="mt-1"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="depth" className="text-sm">{t.upload.depth}</Label>
                  <Input
                    id="depth"
                    type="number"
                    placeholder={t.upload.depthPlaceholder || "0"}
                    className="mt-1"
                    value={depth}
                    onChange={(e) => setDepth(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="weight">{t.upload.weight} (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder={t.upload.weightPlaceholder || "0"}
                  className="mt-2"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>

              {/* Render dynamic category attributes if available, otherwise fallback to static material/color selects */}
              {fetchedAttributes.length > 0 ? (
                fetchedAttributes.map((attr) => (
                  <div key={attr.id}>
                    <Label className="capitalize">{attr.name || (t.upload.attr && t.upload.attr.name) || 'Attribute'}</Label>
                    <Select
                      value={selectedAttributes[attr.id] ?? ''}
                      onValueChange={(val) => setSelectedAttributes(prev => ({ ...prev, [attr.id]: val }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder={`${t.upload.attrPlaceholder} ${attr.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(attr.values) && attr.values.map((v: any) => (
                          <SelectItem key={v.id} value={v.id} className="capitalize">
                            {v.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))
              ) : (
                <>
                  <div>
                    <Label htmlFor="material">{t.upload.material}</Label>
                    <Select value={material} onValueChange={setMaterial}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder={t.upload.materialPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map(mat => (
                          <SelectItem key={mat} value={mat} className="capitalize">
                            {mat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="color">{t.upload.color}</Label>
                    <Select value={color} onValueChange={setColor}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder={t.upload.colorPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map(col => (
                          <SelectItem key={col} value={col} className="capitalize">
                            {col}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            <div>
              <Label htmlFor="description">{t.upload.description}</Label>
              <Textarea
                id="description"
                placeholder={t.upload.descriptionPlaceholder || "Describe your furniture..."}
                className="mt-2 min-h-[120px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div>
                <Label htmlFor="barter" className="font-semibold">{t.upload.acceptBarter}</Label>
                <p className="text-sm text-muted-foreground">
                  {t.upload.allowTrades}
                </p>
              </div>
              <Switch
                id="barter"
                checked={acceptBarter}
                onCheckedChange={setAcceptBarter}
              />
            </div>

            <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isSubmitting}>
              <UploadIcon className="w-5 h-5 mr-2" />
              {isSubmitting ? (t.upload.uploading || 'Uploading...') : (isEditing ? (t.upload.edit || 'Edit') : t.upload.submit)}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Upload;
