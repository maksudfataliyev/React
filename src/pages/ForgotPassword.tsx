import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword as resetPasswordApi, ForgotPassword as forgotPasswordApi } from '@/features/account/services/register.service';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';


const ForgotPassword = () => {
  const { t } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const userIdFromUrl = searchParams.get('userId');

  const schema = z.object({
    email: z.string().email(t.auth?.errors?.invalidEmail || 'Invalid email address'),
  });

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const result = await forgotPasswordApi({ email: data.email });
      if (result.isSuccess) {
        setIsSubmitted(true);
        toast({ title: t.auth?.resetLinkSent || 'We sent a password reset link to your email.' });
      } else {
        toast({ title: result.message || t.auth?.errors?.unexpectedError || 'Failed to send reset link' });
      }
    } catch (e) {
      const msg = t.auth?.errors?.unexpectedError || 'Failed to send reset link';
      toast({ title: msg });
    } finally {
      setIsLoading(false);
    }
  };

  // If token present - render reset password form
  if (tokenFromUrl) {
    const resetSchema = z.object({
      newPassword: z.string().min(8, t.auth?.errors?.passwordMin || 'Password must be at least 8 characters'),
      confirmNewPassword: z.string().min(8, t.auth?.errors?.passwordMin || 'Password must be at least 8 characters'),
    }).refine((data) => data.newPassword === data.confirmNewPassword, {
      message: t.auth?.errors?.passwordsDoNotMatch || 'Passwords do not match',
      path: ['confirmNewPassword'],
    });

    type ResetFormValues = z.infer<typeof resetSchema>;

    const { register: registerReset, handleSubmit: handleResetSubmit, formState: { errors: resetErrors }, watch: resetWatch, setError: setResetError } = useForm<ResetFormValues>({
      resolver: zodResolver(resetSchema),
      defaultValues: { newPassword: '', confirmNewPassword: '' },
    });

    const onReset = async (data: ResetFormValues) => {
      setIsLoading(true);
      try {
        const payload: any = {
          token: tokenFromUrl,
          newPassword: data.newPassword,
          confirmNewPassword: data.confirmNewPassword,
        };
        if (userIdFromUrl) payload.userId = userIdFromUrl;

        const result = await resetPasswordApi(payload);

        if (result.isSuccess) {
          toast({ title: 'Password has been reset successfully' });
          navigate('/auth');
          return;
        }

        // backend returned validation errors
        const validation = (result as any).data;
        const mapField: Record<string, keyof ResetFormValues> = {
          NewPassword: 'newPassword',
          ConfirmNewPassword: 'confirmNewPassword',
        };

        if (validation && typeof validation === 'object') {
          const toastMessages: string[] = [];

          Object.keys(validation).forEach((key) => {
            const messages = validation[key];
            const field = mapField[key] || (key.charAt(0).toLowerCase() + key.slice(1)) as keyof ResetFormValues;
            const msg = Array.isArray(messages) ? messages.join(' ') : String(messages);
            toastMessages.push(msg);
            try {
              setResetError(field, { type: 'server', message: msg });
            } catch { /* ignore if setError fails */ }
          });

          // show combined validation summary toast
          toast({
            title: result.message || 'Validation failed',
            description: toastMessages.join(' — '),
          });
        } else {
          // generic error fallback
          toast({
            title: 'Error',
            description: result.message || t.auth?.errors?.unexpectedError || 'Failed to reset password',
          });
        }

        // keep user on form so they can fix errors
        setIsSubmitted(false);
      } catch (e) {
        toast({ title: 'Error', description: t.auth?.errors?.unexpectedError || 'Failed to reset password' });
      } finally {
        setIsLoading(false);
      }
    };

    const newPwd = resetWatch('newPassword');
    const confirmPwd = resetWatch('confirmNewPassword');
    const pwdMatch = newPwd && confirmPwd ? newPwd === confirmPwd : null;

    return (
      <Layout>
        <div className="w-full flex justify-center items-center min-h-[calc(100vh-200px)] py-12 px-4">
          <div className="mx-auto w-full max-w-md">
            <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/80 shadow-xl backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-sage/5" />
              <div className="relative z-10 p-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="font-display text-2xl font-semibold text-foreground">
                      {t.auth?.resetPassword || 'Reset Password'}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {'Enter your new password'}
                    </p>
                  </div>

                  <form onSubmit={handleResetSubmit(onReset)} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">{t.auth?.password || 'New Password'}</Label>
                      <div className="relative">
                        <Input id="newPassword" type={showNewPassword ? 'text' : 'password'} placeholder="Enter new password" disabled={isLoading} {...registerReset('newPassword')} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {resetErrors.newPassword && <p className="text-xs text-destructive">{resetErrors.newPassword.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmNewPassword">{t.auth?.confirmPasswordLabel || 'Confirm Password'}</Label>
                      <div className="relative">
                        <Input id="confirmNewPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Repeat new password" disabled={isLoading} {...registerReset('confirmNewPassword')} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {resetErrors.confirmNewPassword && <p className="text-xs text-destructive">{resetErrors.confirmNewPassword.message}</p>}
                      {pwdMatch !== null && (
                        <p className={`text-xs mt-1 ${pwdMatch ? 'text-sage-dark' : 'text-destructive'}`}>
                          {pwdMatch ? 'Passwords match' : 'Passwords do not match'}
                        </p>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading || (pwdMatch === false)}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {'Saving...'}
                        </>
                      ) : (
                        t.auth?.resetPassword || 'Save'
                      )}
                    </Button>
                  </form>

                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full flex justify-center items-center min-h-[calc(100vh-200px)] py-12 px-4">
        <div className="mx-auto w-full max-w-md">
          <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/80 shadow-xl backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-sage/5" />
            <div className="relative z-10 p-8">
              {!isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link to="/auth">
                    <Button variant="ghost" size="sm" className="mb-6 -ml-2 gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      {t.auth?.backToLogin || 'Back to Login'}
                    </Button>
                  </Link>

                  <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="font-display text-2xl font-semibold text-foreground">
                      {t.auth?.forgotPassword || 'Forgot Password'}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t.auth?.forgotPasswordDesc || 'Enter your email and we\'ll send you a reset link'}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t.auth?.email || 'Email'}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        disabled={isLoading}
                        className={cn(errors.email && "border-destructive")}
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email.message}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t.auth?.sending || 'Sending...'}
                        </>
                      ) : (
                        t.auth?.sendResetLink || 'Send Reset Link'
                      )}
                    </Button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-4"
                >
                  <div className="mx-auto mb-6 w-20 h-20 bg-sage/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-sage-dark" />
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                    {t.auth?.checkEmail || 'Check Your Email'}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {t.auth?.resetLinkSent || 'We\'ve sent a password reset link to your email address.'}
                  </p>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {t.auth?.didntReceive || 'Didn\'t receive the email?'}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setIsSubmitted(false)}
                      className="w-full"
                    >
                      {t.auth?.tryAgain || 'Try Again'}
                    </Button>
                    <Link to="/auth" className="block">
                      <Button variant="ghost" className="w-full gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        {t.auth?.backToLogin || 'Back to Login'}
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
