import React from 'react';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { staticEvents } from '../data/eventsData';
import { Calendar, MapPin, Trash2, ArrowRight } from 'lucide-react';
import { ViewState } from '../types';

interface ProfileProps {
  setView: (view: ViewState) => void;
}

const Profile: React.FC<ProfileProps> = ({ setView }) => {
  const { t, language } = useLanguage();
  const { joinedEvents, toggleEvent } = useUser();

  // Filter events based on joined IDs for the current language
  const currentEvents = staticEvents[language] || staticEvents.en;
  const myEvents = currentEvents.filter(event => joinedEvents.includes(event.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t.profile.title}</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2">{t.profile.subtitle}</p>
      </div>

      {myEvents.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {myEvents.map((event) => (
             <div key={event.id} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg dark:hover:shadow-slate-800/50 transition-all duration-300 flex flex-col h-full">
              <div className="bg-teal-50 dark:bg-slate-800/50 p-6 border-b border-teal-100/50 dark:border-slate-800">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-3 ${
                  event.type === 'cleanup' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  event.type === 'workshop' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  event.type === 'market' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                }`}>
                  {event.type}
                </span>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-snug">
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
                  className="w-full mt-6 py-2 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex justify-center items-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  {t.events.leave_btn}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
           <Calendar className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
           <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">{t.profile.no_events}</p>
           <button 
              onClick={() => setView(ViewState.EVENTS)}
              className="inline-flex items-center bg-teal-600 text-white px-6 py-3 rounded-full font-medium hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/30"
            >
              {t.profile.browse_btn}
              <ArrowRight size={18} className="ml-2" />
            </button>
        </div>
      )}
    </div>
  );
};

export default Profile;