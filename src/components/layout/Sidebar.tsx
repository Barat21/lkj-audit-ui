import {
  LayoutDashboard,
  ArrowLeftRight,
  UserX,
  UserCheck,
  TrendingUp,
  FileText,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'kyc-required', label: 'KYC Required', icon: UserX },
  { id: 'kyc-completed', label: 'KYC Completed', icon: UserCheck },
  { id: 'tds-monitor', label: 'TDS Monitor', icon: TrendingUp },
  { id: 'bills-export', label: 'Bills & Export', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold">Accounting System</h1>
        <p className="text-sm text-slate-400 mt-1">Automation Suite</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-500">
          <p>Version 1.0.0</p>
          <p className="mt-1">Mock Data Mode</p>
        </div>
      </div>
    </aside>
  );
}
