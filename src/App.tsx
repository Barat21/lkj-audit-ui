import { useState, useEffect } from 'react';
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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('isLoggedIn') === 'true'
  );
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    localStorage.setItem('isLoggedIn', String(isLoggedIn));
  }, [isLoggedIn]);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('dashboard');
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
        return 'Dashboard';
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
        return <Dashboard />;
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <AlertProvider>
      <LoadingProvider>
        <Layout
          activeTab={activeTab}
          onTabChange={setActiveTab}
          title={getPageTitle()}
          onLogout={handleLogout}
        >
          {renderPage()}
        </Layout>
      </LoadingProvider>
    </AlertProvider>
  );
}

export default App;
