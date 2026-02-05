import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const EmailConfirmed = () => {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const status = searchParams.get('status');
  const isSuccess = status === 'success';
  const isFailed = status === 'failed';

  const title = isSuccess
    ? (t.auth?.emailConfirmedTitleSuccess as string) ?? 'Email confirmed'
    : isFailed
    ? (t.auth?.emailConfirmedTitleFailed as string) ?? 'Confirmation failed'
    : (t.auth?.emailConfirmationTitle as string) ?? 'Email confirmation';

  const message = isSuccess
    ? (t.auth?.emailConfirmedMessageSuccess as string) ?? 'Your email address has been successfully confirmed. You can now sign in.'
    : isFailed
    ? (t.auth?.emailConfirmedMessageFailed as string) ?? 'We could not confirm your email. Please try again or request a new confirmation email.'
    : (t.auth?.emailConfirmedMessageUnknown as string) ?? 'Your email confirmation status is unknown.';

  return (
    <Layout>
      <div className="w-full flex justify-center items-center min-h-[calc(100vh-200px)] py-12 px-4">
        <div className="mx-auto w-full max-w-md">
          <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/80 shadow-xl backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-sage/5" />
            <div className="relative z-10 p-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-4 w-16 h-16 bg-sage/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-sage-dark" />
                  </div>
                  <h1 className="font-display text-2xl font-semibold text-foreground">{title}</h1>
                  <p className="mt-2 text-sm text-muted-foreground">{message}</p>
                </div>

                <div className="space-y-3">
                  <Link to="/auth">
                    <Button className="w-full">{(t.auth?.goToLogin as string) ?? 'Go to login'}</Button>
                  </Link>
                </div>

              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmailConfirmed;