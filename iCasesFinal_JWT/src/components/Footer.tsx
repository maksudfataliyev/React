import '../Footer.css';
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Facebook, Instagram, Send } from 'lucide-react';
import{ Link } from 'react-router-dom';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer-container">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-newsletter">
            <h2 className="footer-title">{t('footer.stayConnected')}</h2>
            <p className="footer-description">
              {t('footer.newsletter')}
            </p>
            <form className="newsletter-form">
              <Input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                className="newsletter-input"
              />
              <Button type="submit" className="newsletter-button">
                <Send className="h-4 w-4" />
                <span className="sr-only">{t('footer.subscribe')}</span>
              </Button>
            </form>
            <div className="footer-glow" />
          </div>

          <div className="footer-section">
            <h3 className="footer-section-title">{t('footer.quickLinks')}</h3>
            <nav className="footer-nav">
              <Link to="/" className="footer-link">{t('home')}</Link>
              <Link to="/products" className="footer-link">{t('products')}</Link>
              <Link to="/cart" className="footer-link">{t('cart')}</Link>
              <Link to="/account" className="footer-link">{t('account.title')}</Link>
            </nav>
          </div>

          <div className="footer-section">
            <h3 className="footer-section-title">{t('footer.contactUs')}</h3>
            <address className="footer-address">
              <p>{t('footer.address')}</p>
              <p>{t('footer.city')}</p>
              <p>{t('footer.phone')}</p>
              <p>{t('footer.email')}</p>
            </address>
          </div>

          <div className="footer-social">
            <div className="social-buttons">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="social-icon"
                      onClick={() => window.open('https://www.facebook.com/people/Almastorebaku/61567921344813/', '_blank')}
                    >
                      <Facebook className="h-4 w-4" />
                      <span className="sr-only">{t('footer.facebook')}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('footer.facebook')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="social-icon"
                      onClick={() => window.open('https://www.instagram.com/almastorebakuaz/', '_blank')}
                    >
                      <Instagram className="h-4 w-4" />
                      <span className="sr-only">{t('footer.instagram')}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('footer.instagram')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="social-icon"
                      onClick={() => window.open('https://www.tiktok.com/@almastorebakuaz', '_blank')}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                      <span className="sr-only">{t('footer.tiktok')}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('footer.tiktok')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            {t('footer.copyright')}
          </p>
          <nav className="footer-bottom-nav">
            <a href="#" className="footer-bottom-link">{t('footer.privacyPolicy')}</a>
            <a href="#" className="footer-bottom-link">{t('footer.termsOfService')}</a>
            <a href="#" className="footer-bottom-link">{t('footer.cookieSettings')}</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;