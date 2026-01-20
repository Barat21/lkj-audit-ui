import { useState } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import KYCRequired from './pages/KYCRequired';
import KYCCompleted from './pages/KYCCompleted';
import TDSMonitor from './pages/TDSMonitor';
import BillsExport from './pages/BillsExport';
import Settings from './pages/Settings';
import LoginPage from './pages/LoginPage';
import { AlertProvider } from './context/AlertContext';
import { LoadingProvider } from './context/LoadingContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { isLoggedIn, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('transactions');

  const handleLogout = () => {
    logout();
    setActiveTab('transactions');
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'transactions':
        return 'Transactions';
      case 'kyc-required':
        return 'KYC Required';
      case 'kyc-completed':
        return 'KYC Completed';
      case 'tds-monitor':
        return 'TDS Monitor';
      case 'bills-export':
        return 'Bills & Export';
      case 'settings':
        return 'Settings';
      default:
        return 'Transactions';
    }
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'kyc-required':
        return <KYCRequired />;
      case 'kyc-completed':
        return <KYCCompleted />;
      case 'tds-monitor':
        return <TDSMonitor />;
      case 'bills-export':
        return <BillsExport />;
      case 'settings':
        return <Settings />;
      default:
        return <Transactions />;
    }
  };

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title={getPageTitle()}
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <LoadingProvider>
          <LanguageProvider>
            <AppContent />
          </LanguageProvider>
        </LoadingProvider>
      </AlertProvider>
    </AuthProvider>
  );
}

export default App;
