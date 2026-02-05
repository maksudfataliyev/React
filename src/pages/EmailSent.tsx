import React from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { SendConfirmEmail as SendConfirmEmail } from '@/features/account/services/register.service';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const EmailSent = () => {
  const { t } = useLanguage();
  const [secondsLeft, setSecondsLeft] = React.useState(180); // 3 minutes
  const [isChecking, setIsChecking] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const email = params.get('email') || undefined;

  React.useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // If navigated here with an email in state, trigger sending confirmation immediately
   React.useEffect(() => {
     let mounted = true;
     const sendOnEntry = async () => {
      if (!email) return;
      setIsResending(true);
      try {
        const result = await SendConfirmEmail(email);
         if (mounted) {
          if (result && (result.success === true || (result as any).isSuccess === true)) {
            toast({ title: (t.auth as any)?.confirmationSentTitle ?? 'Confirmation sent', description: ((t.auth as any)?.confirmationSentDescription ?? 'Confirmation email sent to {email}').replace('{email}', String(email)) });
             setSecondsLeft(180);
           } else {
            toast({ title: (t.auth as any)?.confirmationFailedTitle ?? 'Failed to send', description: (result as any).error || (result as any).message || ((t.auth as any)?.confirmationFailedDescription ?? 'Could not send confirmation') });
           }
         }
       } catch (e) {
         if (mounted) toast({ title: (t.auth as any)?.error || 'Error', description: (t.auth as any)?.confirmationFailedDescription ?? 'Failed to send confirmation' });
       } finally {
         if (mounted) setIsResending(false);
       }
     };
     sendOnEntry();
     return () => { mounted = false; };
   }, [email, t]);

   // resend confirmation email
   const onResend = async () => {
     setIsResending(true);
     try {
      const result = await SendConfirmEmail(email);
       if (result && (result.success === true || (result as any).isSuccess === true)) {
         toast({ title: (t.auth as any)?.confirmationSentTitle ?? 'Confirmation sent', description: (t.auth as any)?.confirmationSentDescription ? ((t.auth as any)?.confirmationSentDescription as string).replace('{email}', String(email)) : 'We sent the confirmation email again' });
         // reset countdown
         setSecondsLeft(180);
       } else {
         toast({ title: (t.auth as any)?.confirmationFailedTitle ?? 'Failed to resend', description: (result as any).error || (result as any).message || ((t.auth as any)?.confirmationFailedDescription ?? 'Could not resend confirmation') });
       }
     } catch (e) {
       toast({ title: (t.auth as any)?.error ?? 'Error', description: (t.auth as any)?.confirmationFailedDescription ?? 'Failed to resend confirmation' });
     } finally {
       setIsResending(false);
     }
   };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const onCheck = async () => {
    setIsChecking(true);
    try {
      const result = await SendConfirmEmail(email);
      if (result.success) {
        toast({ title: (t.auth as any)?.emailConfirmedTitleSuccess ?? 'Email confirmed', description: (t.auth as any)?.emailConfirmedMessageSuccess ?? 'Thank you — redirecting to dashboard' });
        navigate('/dashboard');
      } else {
        toast({ title: (t.auth as any)?.emailNotConfirmedTitle ?? 'Not confirmed', description: result.error || ((t.auth as any)?.emailNotConfirmedMessage ?? 'Email not confirmed yet') });
      }
    } catch (e) {
      toast({ title: (t.auth as any)?.error ?? 'Error', description: (t.auth as any)?.emailSentCheckFailed ?? 'Failed to check confirmation' });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Layout>
      <div className="w-full flex justify-center items-center min-h-[calc(100vh-200px)] py-12 px-4">
        <div className="mx-auto w-full max-w-md">
          <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/80 shadow-xl backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-sage/5" />
            <div className="relative z-10 p-8 text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="mb-8">
                  <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="font-display text-2xl font-semibold text-foreground">{(t.auth as any)?.emailSentTitle ?? 'Check your email'}</h1>
                  <p className="mt-2 text-sm text-muted-foreground">{email ? (((t.auth as any)?.emailSentMessageWithEmail as string)?.replace('{email}', String(email)) ?? `We sent a confirmation link to ${email}`) : ((t.auth as any)?.emailSentMessage ?? 'We sent a confirmation link to your email. Click the link to confirm your account.')}</p>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-muted-foreground">{(t.auth as any)?.emailSentTryAfter ?? 'You can try checking confirmation after'}</p>
                  <div className="mt-2 font-mono text-lg">{formatTime(secondsLeft)}</div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full" onClick={onResend} disabled={isResending || !email || secondsLeft > 0}>
                    {isResending ? ((t.auth as any)?.emailSentResending ?? 'Resending...') : (secondsLeft > 0 ? (((t.auth as any)?.emailSentSendAgainWithTime as string)?.replace('{time}', formatTime(secondsLeft)) ?? `Send again (${formatTime(secondsLeft)})`) : ((t.auth as any)?.emailSentSendAgain ?? 'Send again'))}
                  </Button>

                  <Button variant="ghost" className="w-full" onClick={() => navigate('/auth')}>{t.auth?.backToSignIn ?? 'Back to Sign In'}</Button>
                </div>

              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmailSent;
