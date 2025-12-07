import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import AppRouter from './router/AppRouter';
import './services/i18n'; // Initialize i18n

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <AppRouter />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;