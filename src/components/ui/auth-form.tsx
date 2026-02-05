import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/i18n";
import { register as registerApi, ForgotPassword as forgotPasswordApi, SendConfirmEmail } from "@/features/account/services/register.service";
import { login as loginApi } from "@/features/auth/services/auth.service";
import { decodeUserFromToken } from "@/shared/utils/decodeToken";
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { tokenStorage } from '@/shared/tokenStorage';
import { jwtDecode } from "jwt-decode";
import { toast } from "@/components/ui/use-toast";

enum AuthView {
  SIGN_IN = "sign-in",
  SIGN_UP = "sign-up",
  FORGOT_PASSWORD = "forgot-password",
  RESET_SUCCESS = "reset-success",
}

interface AuthState {
  view: AuthView;
}

interface FormState {
  isLoading: boolean;
  error: string | null;
  showPassword: boolean;
}


function Auth({ className, ...props }: React.ComponentProps<"div">) {
  const [state, setState] = React.useState<AuthState>({ view: AuthView.SIGN_IN });

  const setView = React.useCallback((view: AuthView) => {
    setState((prev) => ({ ...prev, view }));
  }, []);

  // If we are redirected from external auth with signup query params, open signup view.
  // Listen to location.search so this also works when already on /auth and query params change.
  const location = useLocation();
  const navigate = useNavigate();
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      if (params.get('signupFirstName') || params.get('signupEmail') || params.get('signupLastName')) {
        setView(AuthView.SIGN_UP);
      }
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  return (
    <div
      data-slot="auth"
      className={cn("mx-auto w-full max-w-md", className)}
      {...props}
    >
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/80 shadow-xl backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-sage/5" />
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {state.view === AuthView.SIGN_IN && (
              <AuthSignIn
                key="sign-in"
                onForgotPassword={() => setView(AuthView.FORGOT_PASSWORD)}
                onSignUp={() => setView(AuthView.SIGN_UP)}
              />
            )}
            {state.view === AuthView.SIGN_UP && (
              <AuthSignUp
                key="sign-up"
                onSignIn={() => setView(AuthView.SIGN_IN)}
              />
            )}
            {state.view === AuthView.FORGOT_PASSWORD && (
              <AuthForgotPassword
                key="forgot-password"
                onSignIn={() => setView(AuthView.SIGN_IN)}
                onSuccess={() => setView(AuthView.RESET_SUCCESS)}
              />
            )}
            {state.view === AuthView.RESET_SUCCESS && (
              <AuthResetSuccess
                key="reset-success"
                onSignIn={() => setView(AuthView.SIGN_IN)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}



interface AuthFormProps {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  children: React.ReactNode;
  className?: string;
}

function AuthForm({ onSubmit, children, className }: AuthFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      data-slot="auth-form"
      className={cn("space-y-6", className)}
    >
      {children}
    </form>
  );
}

interface AuthErrorProps {
  message: string | null;
}

function AuthError({ message }: AuthErrorProps) {
  if (!message) return null;
  return (
    <div
      data-slot="auth-error"
      className="mb-6 animate-in rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
    >
      {message}
    </div>
  );
}

interface AuthSocialButtonsProps {
  isLoading: boolean;
}

const buildSignupQs = (p: any) => {
  const profile = p ?? {};
  const f = encodeURIComponent(profile?.given_name || profile?.givenName || profile?.name || '');
  const l = encodeURIComponent(profile?.family_name || profile?.familyName || '');
  const e = encodeURIComponent(profile?.email || '');
  return `?signupFirstName=${f}&signupLastName=${l}&signupEmail=${e}`;
};

function AuthSocialButtons({ isLoading }: AuthSocialButtonsProps) {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) {
      console.error('No id token from Google');
      return;
    }

    // decode token locally to extract profile fields to prefill registration if needed
    const decoded = (() => {
      try {
        return jwtDecode(idToken);
      } catch {
        return null;
      }
    })();

    console.log('Google ID Token:', decoded);

    try {
      const backend = import.meta.env.VITE_AUTH_API || 'http://localhost:5139';
      const redirectUri = window.location.origin + '/auth/google/callback';

      // helper to try posting with consistent options
      const tryPost = async (body: any) => {
        return axios.post(`${backend}/api/Client/GoogleAuth/google`, body, { withCredentials: true });
      };

      let resp: any = null;
      let data: any = null;
      let succeeded = false;

          // Always send only { email, googleId } as required by backend
          const body = { email: (decoded as any)?.email ?? undefined, googleId: (decoded as any)?.sub ?? undefined };
          try {
            resp = await tryPost(body);
          data = resp?.data;
          // consider success when backend returns isSuccess true and tokens
          if (resp?.status === 200 && data?.isSuccess) {
            const access = data.data?.accessToken ?? data.data?.access_token ?? data.data?.token;
            const refresh = data.data?.refreshToken ?? data.data?.refresh_token ?? null;
            const profileCompleted = data.data?.isProfileCompleted ?? data.data?.is_profile_completed ?? data.data?.is_profileCompleted ?? true;
            if (access) {
              tokenStorage.set({ accessToken: access, refreshToken: refresh } as any);
              if (profileCompleted) {
                navigate('/dashboard');
              } else {
                // profile incomplete -> redirect to signup with prefilled query params
                const p: any = data.data ?? decoded ?? {};
                const first = encodeURIComponent((p as any)?.given_name || (p as any)?.givenName || (p as any)?.name || '');
                const last = encodeURIComponent((p as any)?.family_name || (p as any)?.givenName || (p as any)?.name || '');
                const email = encodeURIComponent((p as any)?.email || '');
                const qs = `?signupFirstName=${first}&signupLastName=${last}&signupEmail=${email}`;
                navigate(`/auth${qs}`);
              }
              succeeded = true;
            }
          }
          // stop retrying if backend accepted request but signaled need_more_info
          if (data?.reason === 'need_more_info' || data?.needMoreInfo || (data?.isSuccess === false && data?.data)) {
            const payload = data?.data ?? decoded ?? {};
            // Redirect into the register/signup flow and prefill fields via query params
            const p: any = payload as any;
            const first = encodeURIComponent((p as any)?.given_name || (p as any)?.givenName || (p as any)?.name || '');
            const last = encodeURIComponent((p as any)?.family_name || (p as any)?.givenName || (p as any)?.name || '');
            const email = encodeURIComponent((p as any)?.email || '');
            const qs = `?signupFirstName=${first}&signupLastName=${last}&signupEmail=${email}`;
            navigate(`/auth${qs}`);
            succeeded = true;
            // removed unreachable break
          }
          } catch (innerErr: any) {
            // Check for ban info and show toast, then redirect
            const serverData = innerErr?.response?.data;
            const banData = serverData?.data;
            if (banData && banData.reason) {
              const reason = banData.reason;
              const expiresAt = banData.expiresAt;
              let expiresText = '';
              if (expiresAt) {
                const date = new Date(expiresAt);
                expiresText = ` until ${date.toLocaleString()}`;
              }
              toast({
                title: 'Login Error',
                description: `Your account is banned for reason: ${reason}${expiresText}.`,
                variant: 'destructive',
              });
              navigate('/auth');
              return;
            }
          }
      if (succeeded) return;

      // If backend explicitly says a code is required (server expects authorization code),
      if (data?.message && String(data.message).toLowerCase().includes('code is required')) {
        const qs = buildSignupQs(decoded ?? {});
        navigate(`/auth${qs}`);
        return;
      }

      // Fallback: if we have decoded token, send user to registration page pre-filled
      if (decoded) {
        const qs = buildSignupQs(decoded as any);
        navigate(`/auth${qs}`);
        return;
      }

      console.error('Unhandled auth response', data);
    } catch (err: any) {
      console.error('Google auth exchange failed', err?.response?.data || err.message || err);
      if (decoded) {
        const qs = buildSignupQs(decoded as any);
        navigate(`/auth${qs}`);
      }
    }
  };

  return (
    <div data-slot="auth-social-buttons" className="w-full mt-6">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => console.log("Login Failed")}
      />

    </div>
  );
}

interface AuthSeparatorProps {
  text?: string;
}

function AuthSeparator({ text }: AuthSeparatorProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const displayText = text || t.auth.orContinueWith;

  return (
    <div data-slot="auth-separator" className="relative mt-6">
      <div className="absolute inset-0 flex items-center">
        <Separator />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">{displayText}</span>
      </div>
    </div>
  );
}


interface AuthSignInProps {
  onForgotPassword: () => void;
  onSignUp: () => void;
}

function AuthSignIn({ onForgotPassword, onSignUp }: AuthSignInProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const navigate = useNavigate();

  const signInSchema = z.object({
    email: z.string().email(t.auth.errors.invalidEmail),
    password: z.string().min(8, t.auth.errors.passwordMin),
  });

  type SignInFormValues = z.infer<typeof signInSchema>;

  const [formState, setFormState] = React.useState<FormState>({
    isLoading: false,
    error: null,
    showPassword: false,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignInFormValues) => {
    setFormState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await loginApi({ email: data.email, password: data.password });
      if (
        result &&
        result.isSuccess === false &&
        (result as any).statusCode === 403 &&
        /banned/i.test(result.message || '')
      ) {
        setFormState((prev) => ({ ...prev, error: result.message || 'Your account is banned.' }));
        navigate('/auth');
        return;
      }

      if (result.isSuccess && result.data) {
        const payload = (result as any).data;

        // try to decode access token first (most reliable)
        const decoded = payload?.accessToken ? decodeUserFromToken(payload.accessToken) : undefined;
        const tokenFlag = decoded?.is_email_verified;
        console.log("Decoded token:", decoded);

        // look for common email-verified flags in response / decoded token / user object
        const isEmailVerified =
          (typeof tokenFlag !== 'undefined' ? tokenFlag : undefined) ??
          payload.is_email_verified ??
          payload.user?.is_email_verified ??
          payload.tokenDecoded?.is_email_verified;

        // explicit false -> not verified
        if (isEmailVerified === false) {
          try { await SendConfirmEmail(data.email); } catch { /* ignore */ }
          navigate(`/email-sent?email=${encodeURIComponent(data.email)}`);
          return;
        }

        // otherwise proceed
        navigate("/dashboard");
        return;
      }

      const backendMessage = result.message || t.auth.errors.unexpectedError;
      const maybeEmail = data.email;
      const isUnconfirmedFallback =
        /confirm/i.test(String(backendMessage)) ||
        ((result as any).data && (result as any).data.emailConfirmed === false);

      if (isUnconfirmedFallback) {
        try { await SendConfirmEmail(maybeEmail); } catch { /* ignore */ }
        navigate(`/email-sent?email=${encodeURIComponent(maybeEmail)}`);
      } else {
        setFormState((prev) => ({ ...prev, error: backendMessage }));
      }
    } catch (err: any) {
      const banData = err?.response?.data?.data;
      if (banData && banData.reason) {
        const reason = banData.reason;
        const expiresAt = banData.expiresAt;
        let expiresText = '';
        if (expiresAt) {
          const date = new Date(expiresAt);
          expiresText = ` until ${date.toLocaleString()}`;
        }
        toast({
          title: 'Login Error',
          description: `Your account is banned for reason: ${reason}${expiresText}.`,
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }
      if (err instanceof Error && /banned/i.test(err.message)) {
        toast({
          title: 'Login Error',
          description: err.message,
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }
      setFormState((prev) => ({ ...prev, error: t.auth.errors.unexpectedError }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <motion.div
      data-slot="auth-sign-in"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="p-8"
    >
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-semibold text-foreground">{t.auth.welcomeBack}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.auth.signInToAccount}</p>
      </div>

      <AuthError message={formState.error} />

      <AuthForm onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="email">{t.auth.email}</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={formState.isLoading}
            className={cn(errors.email && "border-destructive")}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t.auth.password}</Label>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs"
              onClick={onForgotPassword}
              disabled={formState.isLoading}
            >
              {t.auth.forgotPassword}
            </Button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={formState.showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={formState.isLoading}
              className={cn(errors.password && "border-destructive")}
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() =>
                setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }))
              }
              disabled={formState.isLoading}
            >
              {formState.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={formState.isLoading}>
          {formState.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.auth.signingIn}
            </>
          ) : (
            t.auth.signIn
          )}
        </Button>
      </AuthForm>

      <AuthSeparator />
      <AuthSocialButtons isLoading={formState.isLoading} />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t.auth.noAccount}{" "}
        <Button
          variant="link"
          className="h-auto p-0 text-sm"
          onClick={onSignUp}
          disabled={formState.isLoading}
        >
          {t.auth.createOne}
        </Button>
      </p>
    </motion.div>
  );
}



interface AuthSignUpProps {
  onSignIn: () => void;
}

function AuthSignUp({ onSignIn }: AuthSignUpProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const navigate = useNavigate();

  const azPhoneRegex = /^\+994\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;

  const signUpSchema = z.object({
    firstName: z.string().min(2, t.auth.errors.firstNameMin),
    lastName: z.string().min(2, t.auth.errors.lastNameMin),
    email: z.string().email(t.auth.errors.invalidEmail),
    phone: z.string()
      .regex(azPhoneRegex, t.auth.errors.phoneInvalidFormat),
    // Make address fields required
    street: z.string().min(5, 'Street must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    addressDetails: z.string().optional(),
    zipCode: z.string().min(2, 'Zip code must be valid'),
    password: z.string().min(8, t.auth.errors.passwordMin),
    confirmPassword: z.string().min(8, t.auth.errors.passwordMin),
    terms: z.literal(true, { errorMap: () => ({ message: t.auth.errors.agreeTerms }) }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t.auth.errors.passwordsDoNotMatch,
    path: ["confirmPassword"],
  });


  type SignUpFormValues = z.infer<typeof signUpSchema>;

  const [formState, setFormState] = React.useState<FormState>({
    isLoading: false,
    error: null,
    showPassword: false,
  });
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const { register, handleSubmit, setValue, watch, setError, formState: { errors } } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "+994 ", street: "", city: "", addressDetails: "", zipCode: "", password: "", confirmPassword: "", terms: undefined as unknown as true },
  });

  // Prefill fields from query params if present (used when redirecting from external auth)
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const preFirst = params.get('signupFirstName');
      const preLast = params.get('signupLastName');
      const preEmail = params.get('signupEmail');
      if (preFirst) setValue('firstName', decodeURIComponent(preFirst));
      if (preLast) setValue('lastName', decodeURIComponent(preLast));
      if (preEmail) setValue('email', decodeURIComponent(preEmail));
      // remove the signup query params so they don't persist and re-open signup
      ['signupFirstName', 'signupLastName', 'signupEmail'].forEach(k => params.delete(k));
      const newSearch = params.toString();
      try { window.history.replaceState({}, '', window.location.pathname + (newSearch ? ('?' + newSearch) : '')); } catch { /* ignore */ }
    } catch (e) { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const terms = watch("terms");

  const formatPhoneNumber = (value: string) => {
    let cleaned = value.replace(/[^\d+]/g, '');

    if (!cleaned.startsWith('+994')) {
      if (cleaned.startsWith('994')) {
        cleaned = '+' + cleaned;
      } else if (cleaned.startsWith('+')) {
        cleaned = '+994' + cleaned.substring(1).replace(/\D/g, '');
      } else {
        cleaned = '+994' + cleaned.replace(/\D/g, '');
      }
    }

    const digits = cleaned.substring(4);
    let formatted = '+994';
    if (digits.length > 0) formatted += ' ' + digits.substring(0, 2);
    if (digits.length > 2) formatted += ' ' + digits.substring(2, 5);
    if (digits.length > 5) formatted += ' ' + digits.substring(5, 7);
    if (digits.length > 7) formatted += ' ' + digits.substring(7, 9);

    return formatted;
  };

  const onSubmit = async (data: SignUpFormValues) => {
    setFormState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const address = (data.street && data.city) ? {
        street: data.street,
        city: data.city,
        addressDetails: data.addressDetails,
        zipCode: data.zipCode,
      } : undefined;
      // Call register API directly
      const result = await registerApi({
        name: data.firstName,
        surname: data.lastName,
        email: data.email,
        phoneNumber: data.phone,
        password: data.password,
        confirmPassword: data.confirmPassword,
        street: data.street,
        addressDetails: data.addressDetails,
        city: data.city,
        zipCode: data.zipCode,
      });
      if (result.isSuccess) {
        navigate(`/email-sent?email=${encodeURIComponent(data.email)}`);
      } else {
        const validation = (result as any).data;
        const backendMessage = (result as any).message;
        const mapField: Record<string, keyof SignUpFormValues> = {
          Name: 'firstName',
          Surname: 'lastName',
          Email: 'email',
          PhoneNumber: 'phone',
          Password: 'password',
          ConfirmPassword: 'confirmPassword',
          Street: 'street',
          City: 'city',
          AddressDetails: 'addressDetails',
          ZipCode: 'zipCode',
        };

        if (validation && typeof validation === 'object') {
          Object.keys(validation).forEach((key) => {
            const messages = validation[key];
            const field = mapField[key] || (key.charAt(0).toLowerCase() + key.slice(1)) as keyof SignUpFormValues;
            const msg = Array.isArray(messages) ? messages.join(', ') : String(messages);
            try { setError(field, { type: 'server', message: msg }); } catch { /* ignore */ }
          });
          // also set a general form error
          setFormState((prev) => ({ ...prev, error: backendMessage || t.auth.errors.unexpectedError }));
        } else {
          setFormState((prev) => ({ ...prev, error: backendMessage || t.auth.errors.unexpectedError }));
        }
      }
    } catch {
      setFormState((prev) => ({ ...prev, error: t.auth.errors.unexpectedError }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <motion.div
      data-slot="auth-sign-up"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="p-8"
    >
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-semibold text-foreground">{t.auth.createAccount}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.auth.getStarted}</p>
      </div>

      <AuthError message={formState.error} />

      <AuthForm onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">{t.auth.firstName}</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              disabled={formState.isLoading}
              className={cn(errors.firstName && "border-destructive")}
              {...register("firstName")}
            />
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{t.auth.lastName}</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              disabled={formState.isLoading}
              className={cn(errors.lastName && "border-destructive")}
              {...register("lastName")}
            />
            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t.auth.email}</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={formState.isLoading}
            className={cn(errors.email && "border-destructive")}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-sm font-medium text-muted-foreground mb-4">{t.auth.street} ({t.auth.addressDetails || 'Optional'})</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">{t.checkout?.city || 'City'}</Label>
              <Input
                id="city"
                type="text"
                placeholder="Baku"
                disabled={formState.isLoading}
                className={cn(errors.city && "border-destructive")}
                {...register("city")}
              />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">{t.auth.zipCode || 'Zip Code'}</Label>
              <Input
                id="zipCode"
                type="text"
                placeholder="AZ1000"
                disabled={formState.isLoading}
                {...register("zipCode")}
              />
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <Label htmlFor="street">{t.auth.street || 'Street'}</Label>
            <Input
              id="street"
              type="text"
              placeholder="Street, house, apartment"
              disabled={formState.isLoading}
              className={cn(errors.street && "border-destructive")}
              {...register("street")}
            />
            {errors.street && <p className="text-xs text-destructive">{errors.street.message}</p>}
          </div>
          <div className="space-y-2 mt-4">
            <Label htmlFor="addressDetails">{t.auth.addressDetails || 'Address Details'}</Label>
            <Input
              id="addressDetails"
              type="text"
              placeholder="Additional details (floor, entrance, etc.)"
              disabled={formState.isLoading}
              {...register("addressDetails")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t.auth.phone}</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+994 XX XXX XX XX"
            disabled={formState.isLoading}
            className={cn(errors.phone && "border-destructive")}
            {...register("phone", {
              onChange: (e) => {
                e.target.value = formatPhoneNumber(e.target.value);
              }
            })}
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t.auth.password}</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              autoComplete="current-password"
              type={formState.showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={formState.isLoading}
              className={cn(errors.password && "border-destructive")}
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() =>
                setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }))
              }
              disabled={formState.isLoading}
            >
              {formState.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t.auth.confirmPasswordLabel}</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={formState.isLoading}
              {...register("confirmPassword")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={formState.isLoading}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={terms === true}
            onCheckedChange={(checked) => setValue("terms", checked === true ? true : undefined as unknown as true)}
            disabled={formState.isLoading}
          />
          <div className="space-y-1">
            <Label htmlFor="terms" className="text-sm leading-normal">
              {t.auth.agreeToTerms}
            </Label>
            <p className="text-xs text-muted-foreground">
              {t.auth.bySigningUp}{" "}
              <Button variant="link" className="h-auto p-0 text-xs">
                {t.auth.termsLink}
              </Button>{" "}
              &{" "}
              <Button variant="link" className="h-auto p-0 text-xs">
                {t.auth.privacyLink}
              </Button>
              .
            </p>
          </div>
        </div>
        {errors.terms && <p className="text-xs text-destructive">{errors.terms.message}</p>}

        <Button type="submit" className="w-full" disabled={formState.isLoading}>
          {formState.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.auth.creatingAccount}
            </>
          ) : (
            t.auth.createAccount
          )}
        </Button>
      </AuthForm>

      <AuthSeparator />
      <AuthSocialButtons isLoading={formState.isLoading} />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t.auth.haveAccount}{" "}
        <Button
          variant="link"
          className="h-auto p-0 text-sm"
          onClick={onSignIn}
          disabled={formState.isLoading}
        >
          {t.auth.signIn}
        </Button>
      </p>
    </motion.div>
  );
}

interface AuthForgotPasswordProps {
  onSignIn: () => void;
  onSuccess: () => void;
}

function AuthForgotPassword({ onSignIn, onSuccess }: AuthForgotPasswordProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const forgotPasswordSchema = z.object({
    email: z.string().email(t.auth.errors.invalidEmail),
  });

  type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

  const [formState, setFormState] = React.useState<FormState>({
    isLoading: false,
    error: null,
    showPassword: false,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setFormState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await forgotPasswordApi({ email: data.email });
      if (result.isSuccess) {
        onSuccess();
      } else {
        setFormState((prev) => ({ ...prev, error: result.message || t.auth.errors.unexpectedError }));
      }
    } catch {
      setFormState((prev) => ({ ...prev, error: t.auth.errors.unexpectedError }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <motion.div
      data-slot="auth-forgot-password"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="p-8"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-4"
        onClick={onSignIn}
        disabled={formState.isLoading}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Back</span>
      </Button>

      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-semibold text-foreground">{t.auth.resetPassword}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.auth.enterEmailForReset}
        </p>
      </div>

      <AuthError message={formState.error} />

      <AuthForm onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="email">{t.auth.email}</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={formState.isLoading}
            className={cn(errors.email && "border-destructive")}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={formState.isLoading}>
          {formState.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.auth.sending}
            </>
          ) : (
            t.auth.sendResetLink
          )}
        </Button>
      </AuthForm>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t.auth.rememberPassword}{" "}
        <Button
          variant="link"
          className="h-auto p-0 text-sm"
          onClick={onSignIn}
          disabled={formState.isLoading}
        >
          {t.auth.signIn}
        </Button>
      </p>
    </motion.div>
  );
}



interface AuthResetSuccessProps {
  onSignIn: () => void;
}

function AuthResetSuccess({ onSignIn }: AuthResetSuccessProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);

  return (
    <motion.div
      data-slot="auth-reset-success"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col items-center p-8 text-center"
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <MailCheck className="h-8 w-8 text-primary" />
      </div>

      <h1 className="font-display text-2xl font-semibold text-foreground">{t.auth.checkEmail}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t.auth.resetLinkSent}
      </p>

      <Button
        variant="outline"
        className="mt-6 w-full max-w-xs"
        onClick={onSignIn}
      >
        {t.auth.backToSignIn}
      </Button>

      <p className="mt-6 text-xs text-muted-foreground">
        {t.auth.noEmail}{" "}
        <Button variant="link" className="h-auto p-0 text-xs">
          {t.auth.tryAnotherEmail}
        </Button>
      </p>
    </motion.div>
  );
}


export {
  Auth,
  AuthSignIn,
  AuthSignUp,
  AuthForgotPassword,
  AuthResetSuccess,
  AuthForm,
  AuthError,
  AuthSocialButtons,
  AuthSeparator,
};
