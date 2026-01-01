import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  title: string;
  onLogout: () => void;
}

export default function Layout({
  children,
  activeTab,
  onTabChange,
  title,
  onLogout,
}: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden print:h-auto print:overflow-visible">
      <div className="print:hidden">
        <Sidebar
          activeTab={activeTab}
          onTabChange={onTabChange}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden print:h-auto print:overflow-visible">
        <div className="print:hidden">
          <Header
            title={title}
            onLogout={onLogout}
            onMenuClick={() => setIsSidebarOpen(true)}
          />
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 print:p-0 print:overflow-visible">
          <div className="max-w-7xl mx-auto w-full print:max-w-none print:mx-0">
            {children}
          </div>
        </main>

      </div>
    </div>

  );
}
