import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
    localStorage.setItem('lang', e.target.value);
  };

  return (
  <div className="language-switcher">
    <select onChange={handleChange} value={i18n.language} className="language-dropdown">
      <option value="en">ENG</option>
      <option value="ru">RU</option>
      <option value="az">AZ</option>
    </select>
  </div>
);

}
