import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, CheckCircle } from 'lucide-react';
import { PlaceResult } from '../types';
import { localRecyclingPoints } from '../data/localPoints';
import { useLanguage } from '../contexts/LanguageContext';

// Declare Leaflet globally since we are loading it via script tag
declare const L: any;

const RecycleFinder: React.FC = () => {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  
  // Get points for current language
  const currentPoints = localRecyclingPoints[language] || localRecyclingPoints.en;

  // Initialize with all local points
  const [results, setResults] = useState<PlaceResult[]>(currentPoints);
  
  // Change activeCategory to an array to support multiple selection
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
    
    // Filtering Logic
    const filtered = freshPoints.filter(p => {
      const lowerQ = query.toLowerCase();
      // Text Match
      const textMatch = !lowerQ.trim() || 
        p.title.toLowerCase().includes(lowerQ) || 
        p.address.toLowerCase().includes(lowerQ);

      // Category Match (OR logic: if matches ANY selected category)
      // If no categories selected, show all
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

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    const bounds = L.latLngBounds([]);
    let hasValidBounds = false;

    results.forEach((place) => {
      if (place.coordinates) {
        // Use translated category for popup
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

    // Fit bounds if we have points, otherwise stay on default
    if (hasValidBounds) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

  }, [results, language]); // Re-render markers if language changes (for popups)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic handled in useEffect
  };

  // List of all available filters
  const filterOptions = [
    { label: t.finder.filters.plastic, val: "plastic" },
    { label: t.finder.filters.glass, val: "glass" }, 
    { label: t.finder.filters.paper, val: "paper" },
    { label: t.finder.filters.battery, val: "battery" }, 
    { label: t.finder.filters.electronics, val: "electronics" }, 
    { label: t.finder.filters.clothing, val: "clothing" },
    { label: t.finder.filters.general, val: "general" }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Search Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 z-10 shadow-sm transition-colors">
        <div className="max-w-4xl mx-auto w-full">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">{t.finder.title}</h2>
          
          <form onSubmit={handleSearch} className="relative flex items-center w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-24 py-4 border border-slate-300 dark:border-slate-700 rounded-xl leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-sm"
              placeholder={t.finder.placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <button
                type="submit"
                className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                {t.finder.btn_search}
              </button>
            </div>
          </form>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
               <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t.finder.quick_filters}</span>
               {(activeCategories.length > 0 || query) && (
                  <button 
                    onClick={() => { setQuery(''); setActiveCategories([]); }}
                    className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                  >
                      {t.finder.reset}
                  </button>
               )}
            </div>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((s) => (
                <button
                  key={s.val}
                  onClick={() => toggleCategory(s.val)}
                  className={`text-sm px-3 py-1.5 rounded-full transition-all border font-medium ${
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

      {/* Main Content Area: Split View */}
      <div className="flex flex-col lg:flex-row flex-grow overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
        
        {/* Left: Results List */}
        <div className="w-full lg:w-1/3 overflow-y-auto p-6 space-y-6 order-2 lg:order-1 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 transition-colors">
          
            <div className="space-y-6 animate-fadeIn">
               {/* Summary Stats */}
               <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-2 gap-2">
                  <span>{t.finder.showing} {results.length} {t.finder.locations}</span>
                  {activeCategories.length > 0 && (
                    <span className="font-medium text-teal-600 dark:text-teal-400 text-xs bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded">
                      {t.finder.filter_label}: {activeCategories.map(c => getTranslatedCategory(c)).join(', ')}
                    </span>
                  )}
               </div>

              {/* Found Places */}
              {results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((place, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-teal-100 dark:hover:border-teal-900 transition-all cursor-pointer group"
                      onClick={() => {
                        if (place.coordinates && mapRef.current) {
                           mapRef.current.flyTo([place.coordinates.lat, place.coordinates.lng], 15);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                              {place.title}
                            </h4>
                            {place.type === 'verified' && (
                              <CheckCircle size={14} className="text-teal-500 dark:text-teal-400" />
                            )}
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{place.address}</p>
                          {place.category && (
                              <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
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

        {/* Right: Leaflet Map */}
        <div className="w-full lg:w-2/3 bg-slate-100 dark:bg-slate-900 relative order-1 lg:order-2 h-[400px] lg:h-auto border-b lg:border-b-0 border-slate-200 dark:border-slate-800">
           {/* Map Container */}
           <div id="map" className="absolute inset-0 z-0 bg-slate-200 dark:bg-slate-900"></div>
           
           {/* Legend overlay */}
           <div className="absolute bottom-6 right-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur p-3 rounded-lg shadow-lg border border-white dark:border-slate-700 z-[1000] text-xs">
              <div className="font-bold mb-2 text-slate-700 dark:text-slate-300">{t.finder.legend}</div>
              <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full border border-teal-600 bg-teal-600/20"></div>
                  <span className="text-slate-600 dark:text-slate-400">{t.finder.legend_verified}</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RecycleFinder;
