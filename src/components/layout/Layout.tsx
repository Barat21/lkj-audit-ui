import { ReactNode } from 'react';
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
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />

      <div className="flex-1 flex flex-col">
        <Header title={title} onLogout={onLogout} />

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
