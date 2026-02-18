import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Check, Search } from 'lucide-react';
import { EcoEvent } from '../types';
import { staticEvents } from '../data/eventsData';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';

const Events: React.FC = () => {
  const { t, language } = useLanguage();
  const { isJoined, toggleEvent } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get events for current language
  const currentEvents = staticEvents[language] || staticEvents.en;
  
  const [events, setEvents] = useState<EcoEvent[]>(currentEvents);

  // Re-run filter when language changes or search term changes
  useEffect(() => {
    // Get fresh data
    const freshData = staticEvents[language] || staticEvents.en;

    if (!searchTerm.trim()) {
      setEvents(freshData);
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      const filtered = freshData.filter(evt => 
        evt.title.toLowerCase().includes(lowerTerm) || 
        evt.location.toLowerCase().includes(lowerTerm) ||
        evt.type.toLowerCase().includes(lowerTerm)
      );
      setEvents(filtered);
    }
  }, [searchTerm, language]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t.events.title}</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          {t.events.subtitle}
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto group">
           <div className="absolute -inset-1 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl opacity-25 group-hover:opacity-50 blur transition duration-200"></div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            </div>
            <input
              type="text"
              placeholder={t.events.search_placeholder}
              className="block w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.length > 0 ? (
          events.map((event) => {
            const joined = isJoined(event.id);
            return (
              <div key={event.id} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg dark:hover:shadow-slate-800/50 transition-all duration-300 group flex flex-col h-full hover:-translate-y-1">
                <div className="bg-teal-50 dark:bg-slate-800/50 p-6 border-b border-teal-100/50 dark:border-slate-800">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-3 ${
                    event.type === 'cleanup' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    event.type === 'workshop' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    event.type === 'market' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                  }`}>
                    {event.type}
                  </span>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                    {event.title}
                  </h3>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4 flex-grow">
                    {event.description}
                  </p>
                  
                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                    <div className="flex items-center text-slate-500 dark:text-slate-500 text-sm">
                      <Calendar size={16} className="mr-3 text-teal-500 dark:text-teal-500/80" />
                      {event.date}
                    </div>
                    <div className="flex items-center text-slate-500 dark:text-slate-500 text-sm">
                      <MapPin size={16} className="mr-3 text-teal-500 dark:text-teal-500/80" />
                      {event.location}
                    </div>
                  </div>

                  <button 
                    onClick={() => toggleEvent(event.id)}
                    className={`w-full mt-6 py-2 border rounded-lg font-medium transition-colors flex justify-center items-center ${
                      joined 
                        ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {joined ? <Check size={16} className="mr-2" /> : <Users size={16} className="mr-2" />}
                    {joined ? t.events.joined_btn : t.events.join_btn}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-500 dark:text-slate-400 text-lg">{t.events.no_events} "{searchTerm}".</p>
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-2 text-teal-600 dark:text-teal-400 font-medium hover:underline"
            >
              {t.events.view_all}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;