import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const About: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">{t.about.title}</h1>
      <div className="prose prose-lg prose-slate dark:prose-invert text-slate-600 dark:text-slate-300">
        <p className="lead text-xl text-slate-700 dark:text-slate-200 mb-6">
          {t.about.lead}
        </p>
        <p className="mb-6">
          {t.about.p1}
        </p>
        <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mt-10 mb-4">{t.about.how_works}</h3>
        <p className="mb-6">
          {t.about.how_works_text}
        </p>
        <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mt-10 mb-4">{t.about.mission}</h3>
        <ul className="list-disc pl-6 space-y-2 mb-8 marker:text-teal-500">
          <li><strong>{t.about.mission_1.split(':')[0]}:</strong> {t.about.mission_1.split(':')[1]}</li>
          <li><strong>{t.about.mission_2.split(':')[0]}:</strong> {t.about.mission_2.split(':')[1]}</li>
          <li><strong>{t.about.mission_3.split(':')[0]}:</strong> {t.about.mission_3.split(':')[1]}</li>
        </ul>
        <div className="bg-teal-50 dark:bg-teal-900/20 p-6 rounded-xl border border-teal-100 dark:border-teal-800/50 mt-12">
          <p className="font-medium text-teal-800 dark:text-teal-200">
            "{t.about.quote}"
          </p>
          <p className="text-teal-600 dark:text-teal-400 mt-2 text-sm">– Robert Swan</p>
        </div>
      </div>
    </div>
  );
};

export default About;