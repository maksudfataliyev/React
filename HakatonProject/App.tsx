import React, { useState } from 'react';
import { ViewState } from './types';
import Layout from './components/Layout';
import Home from './pages/Home';
import RecycleFinder from './pages/RecycleFinder';
import Events from './pages/Events';
import About from './pages/About';
import Profile from './pages/Profile';
import { LanguageProvider } from './contexts/LanguageContext';
import { UserProvider } from './contexts/UserContext';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);

  const renderView = () => {
    switch (currentView) {
      case ViewState.HOME:
        return <Home setView={setCurrentView} />;
      case ViewState.FINDER:
        return <RecycleFinder />;
      case ViewState.EVENTS:
        return <Events />;
      case ViewState.ABOUT:
        return <About />;
      case ViewState.PROFILE:
        return <Profile setView={setCurrentView} />;
      default:
        return <Home setView={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {renderView()}
    </Layout>
  );
}

function App() {
  return (
    <LanguageProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </LanguageProvider>
  );
}

export default App;