
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, CheckCircle, List, Map as MapIcon } from 'lucide-react';
import { PlaceResult } from '../types';
import { localRecyclingPoints } from '../data/localPoints';
import { useLanguage } from '../contexts/LanguageContext';

// Declare Leaflet globally since we are loading it via script tag
declare const L: any;

const RecycleFinder: React.FC = () => {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
  
  // Get points for current language
  const currentPoints = localRecyclingPoints[language] || localRecyclingPoints.en;

  // Initialize with all local points
  const [results, setResults] = useState<PlaceResult[]>(currentPoints);
  
  // Multiple category selection
  const [activeCategories, setActiveCategories] = useState<string[]>([]);

  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Toggle function for filters
  const toggleCategory = (cat: string) => {
    setActiveCategories(prev => 
      prev.includes(cat) 
        ? prev.filter(c => c !== cat) 
        : [...prev, cat]
    );
  };

  // Helper to get translated category name safely
  const getTranslatedCategory = (catRaw?: string) => {
    if (!catRaw) return '';
    // @ts-ignore
    return t.finder.filters[catRaw] || catRaw;
  };

  // Update results when filters, query, or language changes
  useEffect(() => {
    const freshPoints = localRecyclingPoints[language] || localRecyclingPoints.en;
    
    const filtered = freshPoints.filter(p => {
      const lowerQ = query.toLowerCase();
      const textMatch = !lowerQ.trim() || 
        p.title.toLowerCase().includes(lowerQ) || 
        p.address.toLowerCase().includes(lowerQ);

      const placeCat = p.category || '';
      const catMatch = activeCategories.length === 0 || activeCategories.includes(placeCat);

      return textMatch && catMatch;
    });

    setResults(filtered);
  }, [query, activeCategories, language]);


  // Initialize Map
  useEffect(() => {
    if (!document.getElementById('map') || typeof L === 'undefined') return;

    if (!mapRef.current) {
      // Default to Baku
      mapRef.current = L.map('map').setView([40.4093, 49.8671], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    }
  }, []);

  // Update Markers when Results Change
  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const bounds = L.latLngBounds([]);
    let hasValidBounds = false;

    results.forEach((place) => {
      if (place.coordinates) {
        const displayCat = getTranslatedCategory(place.category);

        const marker = L.marker([place.coordinates.lat, place.coordinates.lng])
          .addTo(mapRef.current)
          .bindPopup(`
            <div class="p-1 min-w-[150px]">
              <h3 class="font-bold text-sm text-teal-700 dark:text-teal-400">${place.title}</h3>
              <p class="text-xs text-slate-600 dark:text-slate-300 mt-1">${place.address}</p>
              ${place.category ? `<span class="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300">${displayCat}</span>` : ''}
            </div>
          `);
        
        markersRef.current.push(marker);
        bounds.extend([place.coordinates.lat, place.coordinates.lng]);
        hasValidBounds = true;
      }
    });

    if (hasValidBounds) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [results, language]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const filterOptions = [
    { label: t.finder.filters.plastic, val: "plastic" },
    { label: t.finder.filters.glass, val: "glass" }, 
    { label: t.finder.filters.paper, val: "paper" },
    { label: t.finder.filters.battery, val: "battery" }, 
    { label: t.finder.filters.electronics, val: "electronics" }, 
    { label: t.finder.filters.clothing, val: "clothing" },
    { label: t.finder.filters.general, val: "general" }
  ];

  const handleResultClick = (place: PlaceResult) => {
    if (place.coordinates && mapRef.current) {
      if (window.innerWidth < 1024) {
        setMobileView('map');
      }
      setTimeout(() => {
        mapRef.current.flyTo([place.coordinates!.lat, place.coordinates!.lng], 15);
      }, 100);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden relative">
      {/* Search Header - Compact on Mobile */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 md:p-6 z-10 shadow-sm transition-colors">
        <div className="max-w-4xl mx-auto w-full">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-3 md:mb-4">{t.finder.title}</h2>
          
          <form onSubmit={handleSearch} className="relative flex items-center w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-20 md:pl-10 md:pr-24 py-3 md:py-4 border border-slate-300 dark:border-slate-700 rounded-xl leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm md:text-base placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500 transition-all shadow-sm"
              placeholder={t.finder.placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-1.5 md:pr-2">
              <button
                type="submit"
                className="bg-teal-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                {t.finder.btn_search}
              </button>
            </div>
          </form>

          <div className="mt-3 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
               <span className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">{t.finder.quick_filters}</span>
               {(activeCategories.length > 0 || query) && (
                  <button 
                    onClick={() => { setQuery(''); setActiveCategories([]); }}
                    className="text-xs md:text-sm text-teal-600 dark:text-teal-400 hover:underline"
                  >
                      {t.finder.reset}
                  </button>
               )}
            </div>
            <div className="flex flex-nowrap lg:flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
              {filterOptions.map((s) => (
                <button
                  key={s.val}
                  onClick={() => toggleCategory(s.val)}
                  className={`flex-shrink-0 text-xs md:text-sm px-3 py-1.5 rounded-full transition-all border font-medium ${
                      activeCategories.includes(s.val)
                      ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-500/20' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-teal-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row flex-grow overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors relative">
        
        {/* Results List */}
        <div className={`
          w-full lg:w-1/3 overflow-y-auto p-4 md:p-6 space-y-6 lg:border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 transition-all duration-300
          ${mobileView === 'list' ? 'flex' : 'hidden lg:flex'}
        `}>
          <div className="w-full space-y-4 animate-fadeIn">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-1 gap-2">
                <span>{t.finder.showing} {results.length} {t.finder.locations}</span>
             </div>

            {results.length > 0 ? (
              <div className="space-y-3">
                {results.map((place, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-teal-100 dark:hover:border-teal-900 transition-all cursor-pointer group"
                    onClick={() => handleResultClick(place)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors text-sm md:text-base">
                            {place.title}
                          </h4>
                          {place.type === 'verified' && (
                            <CheckCircle size={14} className="text-teal-500 dark:text-teal-400" />
                          )}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] md:text-xs mt-1">{place.address}</p>
                        {place.category && (
                            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {getTranslatedCategory(place.category)}
                            </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 border-dashed">
                <MapPin className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                   {t.finder.no_results}
                </p>
                <button 
                  onClick={() => { setQuery(''); setActiveCategories([]); }}
                  className="mt-2 text-teal-600 dark:text-teal-400 text-sm font-medium hover:underline"
                >
                    {t.finder.show_all}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Leaflet Map Container */}
        <div className={`
          w-full lg:w-2/3 bg-slate-100 dark:bg-slate-900 relative h-full transition-all duration-300
          ${mobileView === 'map' ? 'flex' : 'hidden lg:flex'}
        `}>
           <div id="map" className="absolute inset-0 z-0 bg-slate-200 dark:bg-slate-900"></div>
           
           {/* Legend overlay - Hidden on small mobile to save space */}
           <div className="hidden sm:block absolute bottom-20 lg:bottom-6 right-4 lg:right-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur p-3 rounded-lg shadow-lg border border-white dark:border-slate-700 z-[1000] text-[10px] md:text-xs">
              <div className="font-bold mb-2 text-slate-700 dark:text-slate-300">{t.finder.legend}</div>
              <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border border-teal-600 bg-teal-600/20"></div>
                  <span className="text-slate-600 dark:text-slate-400">{t.finder.legend_verified}</span>
              </div>
           </div>
        </div>

        {/* Mobile View Toggle Button */}
        <div className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-[2000] flex justify-center w-full px-4">
          <button
            onClick={() => setMobileView(mobileView === 'map' ? 'list' : 'map')}
            className="flex items-center space-x-2 bg-slate-900/90 dark:bg-teal-600/90 text-white backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-white/20 font-semibold text-sm active:scale-95 transition-transform"
          >
            {mobileView === 'map' ? (
              <>
                <List size={18} />
                <span>Show List</span>
              </>
            ) : (
              <>
                <MapIcon size={18} />
                <span>Show Map</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecycleFinder;
