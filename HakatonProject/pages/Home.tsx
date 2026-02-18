import React, { useMemo } from 'react';
import { ViewState } from '../types';
import { ArrowRight, MapPin, Recycle, Users, BarChart3, AlertCircle, Trophy, Leaf, TrendingUp } from 'lucide-react';
import { surveyData } from '../data/surveyData';
import { useLanguage } from '../contexts/LanguageContext';

interface HomeProps {
  setView: (view: ViewState) => void;
}

const Home: React.FC<HomeProps> = ({ setView }) => {
  const { t } = useLanguage();
  
  // Calculate stats from real data
  const stats = useMemo(() => {
    const total = surveyData.length;
    if (total === 0) return null;

    const sorters = surveyData.filter(d => d.sortsWaste).length;
    const aware = surveyData.filter(d => d.knowsRecyclingPoints).length;
    
    // 1. Top Barrier (Excluding "Not answered")
    const barrierCounts: Record<string, number> = {};
    surveyData
      .filter(d => d.mainBarrier && d.mainBarrier.toLowerCase() !== 'not answered')
      .forEach(d => {
        const b = d.mainBarrier;
        barrierCounts[b] = (barrierCounts[b] || 0) + 1;
      });
    
    const sortedBarriers = Object.entries(barrierCounts).sort((a, b) => b[1] - a[1]);
    const topBarrier = sortedBarriers[0] || { name: 'None', count: 0 };
    const secondBarrier = sortedBarriers[1] || { name: 'None', count: 0 };

    // 2. Greenest City (Highest sorting % with at least 5 respondents)
    const cityStats: Record<string, { total: number, sorters: number }> = {};
    surveyData.forEach(d => {
      if (!cityStats[d.city]) cityStats[d.city] = { total: 0, sorters: 0 };
      cityStats[d.city].total++;
      if (d.sortsWaste) cityStats[d.city].sorters++;
    });

    let bestCity = { name: 'N/A', rate: 0 };
    Object.entries(cityStats).forEach(([name, data]) => {
      if (data.total > 5) { // Threshold for statistical significance
        const rate = (data.sorters / data.total) * 100;
        if (rate > bestCity.rate) {
          bestCity = { name, rate };
        }
      }
    });

    // 3. Youth Engagement (< 25 years old who care about ecology > 3)
    const youth = surveyData.filter(d => d.age < 25);
    const engagedYouth = youth.filter(d => d.caresAboutEcology > 3).length;
    const youthRate = Math.round((engagedYouth / youth.length) * 100);

    // 4. Plastic Usage
    const plasticNever = surveyData.filter(d => d.usesPlastic === 'Never').length;
    const plasticSometimes = surveyData.filter(d => d.usesPlastic === 'Sometimes').length;
    const plasticAlways = surveyData.filter(d => d.usesPlastic === 'Always').length;

    return {
      total,
      sortingRate: Math.round((sorters / total) * 100),
      awarenessRate: Math.round((aware / total) * 100),
      topBarrier: { name: topBarrier[0], count: topBarrier[1] },
      secondBarrier: { name: secondBarrier[0], count: secondBarrier[1] },
      bestCity: { ...bestCity, rate: Math.round(bestCity.rate) },
      youthRate,
      plastic: {
        never: Math.round((plasticNever / total) * 100),
        sometimes: Math.round((plasticSometimes / total) * 100),
        always: Math.round((plasticAlways / total) * 100),
      },
      cities: Object.keys(cityStats).length
    };
  }, []);

  // Helper to translate dynamic data strings
  const trBarrier = (name: string) => {
    // @ts-ignore - dynamic access
    return t.data_mappings.barriers[name] || name;
  };
  
  // @ts-ignore
  const trPlastic = (name: string) => t.data_mappings.plastic[name] || name;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-emerald-950 text-white pt-24 pb-32 px-6">
        <div className="absolute inset-0 z-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-emerald-950/80 via-emerald-900/80 to-slate-900 dark:to-slate-950" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-emerald-900/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-emerald-700/50 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-sm font-medium text-emerald-100">{t.hero.badge}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight drop-shadow-sm">
            {t.hero.title_start} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">{t.hero.title_end}</span>
          </h1>
          <p className="text-lg md:text-xl text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            {t.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <button
              onClick={() => setView(ViewState.FINDER)}
              className="group bg-white text-emerald-950 px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-50 transition-all shadow-xl hover:shadow-emerald-900/20 flex items-center"
            >
              {t.hero.btn_find}
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </button>
            <button
              onClick={() => setView(ViewState.EVENTS)}
              className="px-8 py-4 rounded-full font-bold text-lg text-white border-2 border-emerald-500/30 hover:bg-emerald-800/30 hover:border-emerald-400 transition-all backdrop-blur-sm"
            >
              {t.hero.btn_events}
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg dark:hover:shadow-slate-800/50 hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center text-teal-600 dark:text-teal-400 mb-6 shadow-sm">
              <MapPin size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t.features.locator_title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.features.locator_desc}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg dark:hover:shadow-slate-800/50 hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 shadow-sm">
              <Users size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t.features.events_title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.features.events_desc}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg dark:hover:shadow-slate-800/50 hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 shadow-sm">
              <Recycle size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t.features.advice_title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.features.advice_desc}
            </p>
          </div>
        </div>
      </section>

      {/* Community Insights Section (Powered by Survey Data) */}
      {stats && (
        <section className="bg-slate-900 dark:bg-slate-900 text-white py-24 px-6 relative overflow-hidden border-t border-slate-800">
           {/* Background Decoration */}
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-slate-800/80 dark:bg-slate-800/50 border border-slate-700 px-4 py-1.5 rounded-full text-sm font-medium text-teal-400 mb-6 shadow-lg">
                <BarChart3 size={16} />
                <span>{t.stats.live_data}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{t.stats.title}</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                {t.stats.desc_start} <span className="text-white font-semibold">{stats.total} {t.stats.desc_participants}</span> {stats.cities} {t.stats.desc_cities}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Card 1: Top Barrier */}
              <div className="bg-slate-800/50 dark:bg-slate-800/30 backdrop-blur-sm p-8 rounded-3xl border border-slate-700 hover:border-amber-500/50 transition-colors col-span-1 md:col-span-2 lg:col-span-1 group">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                    <AlertCircle size={28} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-950/40 border border-amber-900/50 px-3 py-1 rounded-full">{t.stats.top_barrier}</span>
                </div>
                <h4 className="text-slate-400 text-sm font-medium mb-2">{t.stats.barrier_label}</h4>
                <div className="text-2xl font-bold text-white mb-6 leading-tight">
                  "{trBarrier(stats.topBarrier.name)}"
                </div>
                
                <div className="space-y-4">
                  <div className="bg-slate-700/50 rounded-xl p-3 flex items-center justify-between">
                     <span className="text-slate-300 text-sm">{trBarrier(stats.topBarrier.name)}</span>
                     <span className="font-bold text-amber-400">{stats.topBarrier.count} {t.stats.votes}</span>
                  </div>
                   <div className="bg-slate-700/30 rounded-xl p-3 flex items-center justify-between">
                     <span className="text-slate-400 text-sm">{trBarrier(stats.secondBarrier.name)}</span>
                     <span className="font-medium text-slate-400">{stats.secondBarrier.count} {t.stats.votes}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Greenest City */}
              <div className="bg-gradient-to-br from-teal-900/40 to-emerald-900/40 backdrop-blur-sm p-8 rounded-3xl border border-teal-800/50 hover:border-teal-500/50 transition-colors group">
                 <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-teal-500/10 rounded-2xl text-teal-400 group-hover:bg-teal-500/20 transition-colors">
                    <Trophy size={28} />
                  </div>
                   <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950/40 border border-teal-900/50 px-3 py-1 rounded-full">{t.stats.eco_leader}</span>
                </div>
                <h4 className="text-teal-200/70 text-sm font-medium mb-1">{t.stats.sorting_rate}</h4>
                <div className="text-4xl font-bold text-white mb-2">{stats.bestCity.name}</div>
                <div className="flex items-center space-x-2 mb-6">
                   <span className="text-3xl font-bold text-teal-400">{stats.bestCity.rate}%</span>
                   <span className="text-slate-400 text-sm mt-2">{t.stats.residents_sort}</span>
                </div>
                <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full" style={{ width: `${stats.bestCity.rate}%` }}></div>
                </div>
              </div>

               {/* Card 3: Plastic Usage Stats */}
               <div className="bg-slate-800/50 dark:bg-slate-800/30 backdrop-blur-sm p-8 rounded-3xl border border-slate-700 hover:border-purple-500/50 transition-colors group">
                 <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                    <Leaf size={28} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-950/40 border border-purple-900/50 px-3 py-1 rounded-full">{t.stats.habits}</span>
                </div>
                <h4 className="text-slate-400 text-sm font-medium mb-4">{t.stats.plastic_freq}</h4>
                
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white">{trPlastic("Always")}</span>
                      <span className="text-slate-400">{stats.plastic.always}%</span>
                    </div>
                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${stats.plastic.always}%` }}></div>
                    </div>
                  </div>
                   <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white">{trPlastic("Sometimes")}</span>
                      <span className="text-slate-400">{stats.plastic.sometimes}%</span>
                    </div>
                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${stats.plastic.sometimes}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Youth Engagement */}
              <div className="bg-slate-800/50 dark:bg-slate-800/30 backdrop-blur-sm p-8 rounded-3xl border border-slate-700 hover:border-pink-500/50 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-400 group-hover:bg-pink-500/20 transition-colors">
                    <TrendingUp size={28} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-400 bg-pink-950/40 border border-pink-900/50 px-3 py-1 rounded-full">{t.stats.gen_z}</span>
                </div>
                <div className="mt-2">
                   <div className="text-5xl font-bold text-white mb-2">{stats.youthRate}%</div>
                   <p className="text-slate-300 font-medium">{t.stats.youth_concern}</p>
                   <p className="text-slate-500 text-sm mt-1">{t.stats.youth_desc}</p>
                </div>
              </div>

               {/* Card 5: General Awareness */}
               <div className="bg-slate-800/50 dark:bg-slate-800/30 backdrop-blur-sm p-8 rounded-3xl border border-slate-700 hover:border-blue-500/50 transition-colors md:col-span-2 group">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 h-full">
                   <div>
                      <div className="flex items-center gap-3 mb-4">
                         <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                            <MapPin size={24} />
                         </div>
                         <h4 className="text-lg font-bold text-white">{t.stats.gap_title}</h4>
                      </div>
                      <p className="text-slate-400 max-w-sm mb-4">
                        {t.stats.gap_desc.replace('{sortRate}', stats.sortingRate.toString()).replace('{awareRate}', stats.awarenessRate.toString())}
                      </p>
                      <button onClick={() => setView(ViewState.FINDER)} className="text-teal-400 hover:text-teal-300 font-medium text-sm flex items-center transition-colors">
                        {t.stats.gap_btn} <ArrowRight size={14} className="ml-1" />
                      </button>
                   </div>
                   <div className="flex-shrink-0 flex gap-4">
                      <div className="text-center p-4 bg-slate-700/30 rounded-2xl border border-slate-600/50">
                        <div className="text-3xl font-bold text-white mb-1">{stats.sortingRate}%</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide">{t.stats.stat_sort}</div>
                      </div>
                      <div className="text-center p-4 bg-slate-700/30 rounded-2xl border border-slate-600/50">
                        <div className="text-3xl font-bold text-blue-400 mb-1">{stats.awarenessRate}%</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide">{t.stats.stat_know}</div>
                      </div>
                   </div>
                 </div>
              </div>

            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;