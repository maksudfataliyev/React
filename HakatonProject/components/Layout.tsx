import React, { ReactNode, useEffect, useState } from 'react';
import { ViewState } from '../types';
import { Leaf, MapPin, Calendar, Info, Menu, X, Moon, Sun, ChevronDown, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LayoutProps {
  children: ReactNode;
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme') as 'light' | 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const NavItem = ({ view, label, icon: Icon }: { view: ViewState; label: string; icon: any }) => (
    <button
      onClick={() => {
        setView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
        currentView === view
          ? 'bg-teal-600 text-white shadow-lg shadow-teal-200 dark:shadow-teal-900/40'
          : 'text-slate-600 dark:text-slate-400 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-700 dark:hover:text-teal-400'
      }`}
    >
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </button>
  );

  // Conditional Footer Styling
  const isHome = currentView === ViewState.HOME;
  
  const footerBgClass = isHome 
    ? 'bg-slate-900 border-slate-800' // Always dark on Home to match bottom section
    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800'; // Light/Dark adaptive on others

  const footerTextClass = isHome
    ? 'text-slate-400'
    : 'text-slate-600 dark:text-slate-400';

  const brandTextClass = isHome
    ? 'text-slate-200'
    : 'text-slate-900 dark:text-slate-200';

  const languages = [
    { code: 'en', label: 'ENG' },
    { code: 'az', label: 'AZE' },
    { code: 'ru', label: 'RUS' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div 
              className="flex items-center space-x-2 cursor-pointer group" 
              onClick={() => setView(ViewState.HOME)}
            >
              <div className="bg-teal-600 p-2 rounded-lg group-hover:scale-105 transition-transform">
                <Leaf className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-700 to-emerald-600 dark:from-teal-400 dark:to-emerald-400">
                EcoRoute
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-2">
              <NavItem view={ViewState.HOME} label={t.nav.home} icon={Leaf} />
              <NavItem view={ViewState.FINDER} label={t.nav.map} icon={MapPin} />
              <NavItem view={ViewState.EVENTS} label={t.nav.events} icon={Calendar} />
              <NavItem view={ViewState.ABOUT} label={t.nav.about} icon={Info} />
              
              {/* Profile/My Events Button */}
              <button
                onClick={() => setView(ViewState.PROFILE)}
                className={`ml-2 flex items-center justify-center p-2 rounded-lg transition-colors border ${
                  currentView === ViewState.PROFILE
                    ? 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
                }`}
                title={t.nav.profile}
              >
                <User size={20} />
              </button>

              {/* Language Dropdown Desktop */}
              <div className="relative ml-2">
                <button
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <span className="uppercase">{languages.find(l => l.code === language)?.label || language}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isLangMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsLangMenuOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code as any);
                            setIsLangMenuOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm font-medium flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                            language === lang.code 
                              ? 'text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-900/10' 
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span>{lang.label}</span>
                          {language === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Theme Toggle Desktop */}
              <button 
                onClick={toggleTheme}
                className="ml-2 p-2 rounded-full text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-300 transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                aria-label="Toggle Dark Mode"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </div>

            {/* Mobile Controls */}
            <div className="md:hidden flex items-center space-x-2">
               {/* Mobile Language Toggle (Simple Cycle) */}
               <button
                onClick={() => {
                   const next = language === 'en' ? 'az' : language === 'az' ? 'ru' : 'en';
                   setLanguage(next);
                }}
                className="px-3 py-1.5 rounded-md text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 uppercase"
              >
                {languages.find(l => l.code === language)?.label || language}
              </button>
              
               <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-300 transition-colors bg-slate-100 dark:bg-slate-800"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-800"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 pt-2 pb-4 space-y-2 shadow-lg">
            <NavItem view={ViewState.HOME} label={t.nav.home} icon={Leaf} />
            <NavItem view={ViewState.FINDER} label={t.nav.map} icon={MapPin} />
            <NavItem view={ViewState.EVENTS} label={t.nav.events} icon={Calendar} />
            <NavItem view={ViewState.PROFILE} label={t.nav.profile} icon={User} />
            <NavItem view={ViewState.ABOUT} label={t.nav.about} icon={Info} />
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className={`${footerBgClass} ${footerTextClass} py-8 border-t transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Leaf size={20} className="text-teal-600 dark:text-teal-500" />
            <span className={`font-semibold ${brandTextClass}`}>EcoRoute</span>
          </div>
          <p className="text-sm">
            {t.footer.tagline} <br/>
            {t.footer.sub_tagline}
          </p>
          <p className={`mt-8 text-xs ${isHome ? 'text-slate-500' : 'text-slate-500 dark:text-slate-600'}`}>
            &copy; {new Date().getFullYear()} EcoRoute. {t.footer.rights}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;