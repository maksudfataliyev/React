import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { orderService } from "../orderService";
import { getProductImageUrl } from "../getImageUrl"
import "@/Checkout.css";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  discount?: number;
}

interface CheckoutSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
}

interface PaymentMethod {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  nameOnCard: string;
}

interface CheckoutProps {
  cartItems: any[];
  onClose: () => void;
  onComplete: () => void;
}

export default function Checkout({ cartItems, onClose, onComplete }: CheckoutProps) {
  const { t } = useTranslation();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [theme, setTheme] = useState<string>("light");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    country: "US",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    nameOnCard: "",
  });

  const [selectedPaymentType, setSelectedPaymentType] = useState<string>("card");
  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [appliedPromo, setAppliedPromo] = useState<string>("");
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);

  const shippingMethods = [
    { id: "standard", name: t("checkout.standardShipping"), price: 9.99, time: t("checkout.standardTime") },
    { id: "express", name: t("checkout.expressShipping"), price: 19.99, time: t("checkout.expressTime") },
    { id: "overnight", name: t("checkout.overnightShipping"), price: 39.99, time: t("checkout.overnightTime") },
  ];

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);
  }, []);

  useEffect(() => {
    const loadCheckout = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      const convertedItems: OrderItem[] = cartItems.map((item, index) => ({
        id: String(index + 1),
        name: item.title || item.name,
        price: item.discount ? item.price - (item.price * item.discount) / 100 : item.price,
        originalPrice: item.discount ? item.price : undefined,

        image: getProductImageUrl(item.image), // ✅ UPDATED HERE

        quantity: 1,
        discount: item.discount,
      }));

      setOrderItems(convertedItems);
      setIsLoading(false);
    };

    loadCheckout();
  }, [cartItems]);

  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    const limited = cleaned.slice(0, 16);
    const formatted = limited.match(/.{1,4}/g)?.join(" ") || limited;
    return formatted;
  };

  const formatPhoneNumber = (value: string): string => value.replace(/\D/g, "").slice(0, 15);
  const formatZipCode = (value: string): string => value.replace(/\D/g, "").slice(0, 10);
  const formatCVV = (value: string): string => value.replace(/\D/g, "").slice(0, 4);

  const formatName = (value: string): string => value.replace(/[^a-zA-Z\s-']/g, "");

  const handleCardNumberChange = (value: string) =>
    setPaymentMethod({ ...paymentMethod, cardNumber: formatCardNumber(value) });

  const handlePhoneChange = (value: string) =>
    setShippingAddress({ ...shippingAddress, phone: formatPhoneNumber(value) });

  const handleZipCodeChange = (value: string) =>
    setShippingAddress({ ...shippingAddress, zipCode: formatZipCode(value) });

  const handleCVVChange = (value: string) =>
    setPaymentMethod({ ...paymentMethod, cvv: formatCVV(value) });

  const handleNameChange = (field: "firstName" | "lastName", value: string) =>
    setShippingAddress({ ...shippingAddress, [field]: formatName(value) });

  const handleCardNameChange = (value: string) =>
    setPaymentMethod({ ...paymentMethod, nameOnCard: formatName(value) });

  const calculateSummary = (): CheckoutSummary => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = 0;
    const shipping =
      selectedShipping === "standard" ? 9.99 : selectedShipping === "express" ? 19.99 : 39.99;
    const tax = (subtotal - discount) * 0.08;
    const total = subtotal - discount + shipping + tax;

    return { subtotal, discount, shipping, tax, total };
  };

  const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          shippingAddress.firstName &&
          shippingAddress.lastName &&
          shippingAddress.email &&
          validateEmail(shippingAddress.email) &&
          shippingAddress.address &&
          shippingAddress.city &&
          shippingAddress.zipCode
        );
      case 2:
        if (selectedPaymentType === "card") {
          const num = paymentMethod.cardNumber.replace(/\s/g, "");
          return !!(
            num.length >= 13 &&
            num.length <= 16 &&
            paymentMethod.expiryMonth &&
            paymentMethod.expiryYear &&
            paymentMethod.cvv.length >= 3 &&
            paymentMethod.nameOnCard
          );
        }
        return !!selectedPaymentType;
      case 3:
        return agreeToTerms;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // In your checkout-components.tsx, update handleComplete function:

const handleComplete = async () => {
  if (!validateStep(3)) {
    alert("Please agree to terms and conditions");
    return;
  }

  setIsProcessing(true);

  try {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to complete checkout');
      setIsProcessing(false);
      return;
    }

    // Call the backend API - NO username needed, JWT token has it
    const orderResponse = await orderService.checkoutDirect(cartItems);
    console.log('Order created successfully:', orderResponse);

    // Complete checkout and clear cart
    onComplete();

  } catch (err) {
    console.error('Checkout error:', err);
    alert(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
    setIsProcessing(false);
  }
};

  const summary = calculateSummary();

  if (isLoading) {
    return (
      <div className="checkout-modal" data-theme={theme}>
        <div className="checkout-overlay" onClick={onClose}></div>
        <div className="checkout-container">
          <div className="checkout-loading">{t("checkout.loading")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-modal" data-theme={theme}>
      <div className="checkout-overlay" onClick={onClose}></div>
      <div className="checkout-container">
        <div className="checkout-header">
          <div className="checkout-header-content">
            <button className="back-button" onClick={onClose}>
              {t("checkout.backToCart")}
            </button>
            <h1 className="checkout-title">{t("checkout.title")}</h1>
            <p className="checkout-subtitle">{t("checkout.subtitle")}</p>
          </div>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* --------------------------------------------------------
            PROGRESS STEPS
        -------------------------------------------------------- */}
        <div className="progress-steps">
          {[
            { step: 1, label: t("checkout.shipping") },
            { step: 2, label: t("checkout.payment") },
            { step: 3, label: t("checkout.review") },
          ].map(({ step, label }, index) => (
            <div key={step} className="progress-step-wrapper">
              <div className="progress-step-item">
                <div className={`progress-circle ${currentStep >= step ? "active" : ""}`}>
                  {currentStep > step ? "✓" : step}
                </div>
                <span className={`progress-label ${currentStep >= step ? "active" : ""}`}>{label}</span>
              </div>
              {index < 2 && <div className={`progress-line ${currentStep > step ? "active" : ""}`} />}
            </div>
          ))}
        </div>

        <div className="checkout-content">
          <div className="checkout-main">
            {/* STEP 1 — SHIPPING */}
            {currentStep === 1 && (
              <div className="checkout-card">
                <h2 className="section-title">{t("checkout.shippingInfo")}</h2>

                {/* FORM */}
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      {t("checkout.firstName")} {t("checkout.required")}
                    </label>
                    <input
                      type="text"
                      placeholder="John"
                      value={shippingAddress.firstName}
                      onChange={(e) => handleNameChange("firstName", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      {t("checkout.lastName")} {t("checkout.required")}
                    </label>
                    <input
                      type="text"
                      placeholder="Doe"
                      value={shippingAddress.lastName}
                      onChange={(e) => handleNameChange("lastName", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      {t("checkout.email")} {t("checkout.required")}
                    </label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={shippingAddress.email}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>{t("checkout.phone")}</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={shippingAddress.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>
                      {t("checkout.address")} {t("checkout.required")}
                    </label>
                    <input
                      type="text"
                      placeholder="123 Main Street"
                      value={shippingAddress.address}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, address: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      {t("checkout.city")} {t("checkout.required")}
                    </label>
                    <input
                      type="text"
                      placeholder="New York"
                      value={shippingAddress.city}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, city: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      {t("checkout.zipCode")} {t("checkout.required")}
                    </label>
                    <input
                      type="text"
                      placeholder="10001"
                      value={shippingAddress.zipCode}
                      onChange={(e) => handleZipCodeChange(e.target.value)}
                    />
                  </div>
                </div>

                {/* SHIPPING OPTIONS */}
                <div className="shipping-methods">
                  <h3>{t("checkout.shippingMethod")}</h3>
                  {shippingMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`shipping-option ${
                        selectedShipping === method.id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedShipping(method.id)}
                    >
                      <div className="shipping-radio">
                        <div
                          className={`radio-circle ${
                            selectedShipping === method.id ? "active" : ""
                          }`}
                        />
                      </div>
                      <div className="shipping-info">
                        <div className="shipping-name">{method.name}</div>
                        <div className="shipping-time">{method.time}</div>
                      </div>
                      <div className="shipping-price">${method.price}</div>
                    </div>
                  ))}
                </div>

                <div className="form-actions">
                  <button className="btn-primary" onClick={nextStep} disabled={!validateStep(1)}>
                    {t("checkout.continuePayment")}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 — PAYMENT */}
            {currentStep === 2 && (
              <div className="checkout-card">
                <h2 className="section-title">{t("checkout.paymentInfo")}</h2>

                <div className="payment-methods">
                  <h3>{t("checkout.choosePayment")}</h3>
                  <div className="payment-grid">
                    {[
                      {
                        id: "card",
                        name: t("checkout.creditCard"),
                        icon: "💳",
                        desc: t("checkout.creditCardDesc"),
                      },
                      {
                        id: "paypal",
                        name: t("checkout.paypal"),
                        icon: "💰",
                        desc: t("checkout.paypalDesc"),
                      },
                      {
                        id: "apple-pay",
                        name: t("checkout.applePay"),
                        icon: "📱",
                        desc: t("checkout.applePayDesc"),
                      },
                    ].map((method) => (
                      <button
                        key={method.id}
                        className={`payment-option ${
                          selectedPaymentType === method.id ? "selected" : ""
                        }`}
                        onClick={() => setSelectedPaymentType(method.id)}
                      >
                        <span className="payment-icon">{method.icon}</span>
                        <div className="payment-details">
                          <div className="payment-name">{method.name}</div>
                          <div className="payment-desc">{method.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CARD FORM */}
                {selectedPaymentType === "card" && (
                  <div className="card-form">
                    <div className="form-group full-width">
                      <label>
                        {t("checkout.nameOnCard")} {t("checkout.required")}
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={paymentMethod.nameOnCard}
                        onChange={(e) => handleCardNameChange(e.target.value)}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>
                        {t("checkout.cardNumber")} {t("checkout.required")}
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={paymentMethod.cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                      />
                    </div>

                    <div className="form-grid-3">
                      <div className="form-group">
                        <label>
                          {t("checkout.month")} {t("checkout.required")}
                        </label>
                        <select
                          value={paymentMethod.expiryMonth}
                          onChange={(e) =>
                            setPaymentMethod({ ...paymentMethod, expiryMonth: e.target.value })
                          }
                        >
                          <option value="">MM</option>
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                              {String(i + 1).padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>
                          {t("checkout.year")} {t("checkout.required")}
                        </label>
                        <select
                          value={paymentMethod.expiryYear}
                          onChange={(e) =>
                            setPaymentMethod({ ...paymentMethod, expiryYear: e.target.value })
                          }
                        >
                          <option value="">YYYY</option>
                          {Array.from({ length: 10 }, (_, i) => (
                            <option key={2024 + i} value={String(2024 + i)}>
                              {2024 + i}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>
                          {t("checkout.cvv")} {t("checkout.required")}
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          value={paymentMethod.cvv}
                          onChange={(e) => handleCVVChange(e.target.value)}
                          maxLength={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* NON-CARD PAYMENT MESSAGE */}
                {selectedPaymentType !== "card" && (
                  <div className="payment-info-box">
                    <p>{t("checkout.youllBeRedirected")}</p>
                  </div>
                )}

                <div className="form-actions">
                  <button className="btn-secondary" onClick={prevStep}>
                    {t("checkout.back")}
                  </button>
                  <button className="btn-primary" onClick={nextStep} disabled={!validateStep(2)}>
                    {t("checkout.reviewOrder")}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 — REVIEW */}
            {currentStep === 3 && (
              <div className="checkout-card">
                <h2 className="section-title">{t("checkout.reviewYourOrder")}</h2>

                <div className="review-section">
                  <h3>{t("checkout.shippingAddress")}</h3>
                  <div className="review-box">
                    <p>
                      {shippingAddress.firstName} {shippingAddress.lastName}
                    </p>
                    <p>{shippingAddress.address}</p>
                    <p>
                      {shippingAddress.city}, {shippingAddress.zipCode}
                    </p>
                    <p>{shippingAddress.email}</p>
                  </div>
                </div>

                <div className="review-section">
                  <h3>{t("checkout.paymentMethod")}</h3>
                  <div className="review-box">
                    {selectedPaymentType === "card" ? (
                      <>
                        <p>
                          **** **** ****{" "}
                          {paymentMethod.cardNumber.replace(/\s/g, "").slice(-4)}
                        </p>
                        <p>{paymentMethod.nameOnCard}</p>
                      </>
                    ) : (
                      <p>
                        {selectedPaymentType === "paypal"
                          ? t("checkout.paypal")
                          : t("checkout.applePay")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="terms-checkbox">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                  />
                  <label htmlFor="terms">{t("checkout.termsAgree")}</label>
                </div>

                <div className="form-actions">
                  <button
                    className="btn-secondary"
                    onClick={prevStep}
                    disabled={isProcessing}
                  >
                    {t("checkout.back")}
                  </button>
                  <button
                    className="btn-success"
                    onClick={handleComplete}
                    disabled={!validateStep(3) || isProcessing}
                  >
                    {isProcessing
                      ? "Processing..."
                      : `${t("checkout.completeOrder")} $${summary.total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR SUMMARY */}
          <div className="checkout-sidebar">
            <div className="summary-card">
              <h3 className="summary-title">{t("checkout.orderSummary")}</h3>

              <div className="order-items">
                {orderItems.map((item) => (
                  <div key={item.id} className="order-item">
                    <div className="item-image-wrapper">
                      <img src={item.image} alt={item.name} className="item-image" />

                      <span className="item-quantity">{item.quantity}</span>
                    </div>

                    <div className="item-details">
                      <p className="item-name">{item.name}</p>

                      <div className="item-price">
                        <span className="current-price">${item.price}</span>

                        {item.originalPrice && (
                          <span className="original-price">${item.originalPrice}</span>
                        )}
                      </div>
                    </div>

                    <div className="item-total">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {appliedPromo && (
                <div className="promo-applied">
                  <span>🎉 {appliedPromo}</span>
                  <button onClick={() => setAppliedPromo("")}>✕</button>
                </div>
              )}

              <div className="summary-breakdown">
                <div className="summary-row">
                  <span>{t("checkout.subtotal")}</span>
                  <span>${summary.subtotal.toFixed(2)}</span>
                </div>

                {summary.discount > 0 && (
                  <div className="summary-row discount">
                    <span>{t("checkout.discount")}</span>
                    <span>-${summary.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="summary-row">
                  <span>{t("shipping")}</span>
                  <span>${summary.shipping.toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span>{t("checkout.tax")}</span>
                  <span>${summary.tax.toFixed(2)}</span>
                </div>

                <div className="summary-total">
                  <span>{t("checkout.total")}</span>
                  <span>${summary.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="security-badge">
              <span className="shield-icon">🛡️</span>
              <div>
                <div className="security-title">{t("checkout.secureEncrypted")}</div>
                <div className="security-desc">{t("checkout.dataProtected")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
