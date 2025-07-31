import { useTranslation } from 'react-i18next';

export default function Contact() {
  const { t } = useTranslation();
  return (
    <div className="contact-page">
      <h1>{t('contactTitle')}</h1>
      <p>{t('contactSubtitle')}</p>
      <p>{t('contactEmail')}: <a href="mailto:support@myphonestore.com">support@icases_az.com</a></p>
      <p>{t('contactPhone')}</p>
    </div>
  )
}
