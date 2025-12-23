import {
  LayoutDashboard,
  ArrowLeftRight,
  UserX,
  UserCheck,
  TrendingUp,
  FileText,
  Settings,
  X,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { TranslationKey } from '../../translations';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const menuItems: { id: string; labelKey: TranslationKey; icon: any }[] = [
  { id: 'dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { id: 'transactions', labelKey: 'transactions', icon: ArrowLeftRight },
  { id: 'kyc-required', labelKey: 'kyc_required', icon: UserX },
  { id: 'kyc-completed', labelKey: 'kyc_completed', icon: UserCheck },
  { id: 'tds-monitor', labelKey: 'tds_monitor', icon: TrendingUp },
  { id: 'bills-export', labelKey: 'bills_export', icon: FileText },
  { id: 'settings', labelKey: 'settings', icon: Settings },
];

export default function Sidebar({
  activeTab,
  onTabChange,
  isOpen,
  onToggle,
}: SidebarProps) {
  const { t } = useLanguage();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onToggle}
        />
      )}

      <aside
        className={`w-64 bg-slate-900 text-white flex flex-col fixed md:relative h-screen transition-transform duration-300 z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Accounting System</h1>
            <p className="text-sm text-slate-400 mt-1">Automation Suite</p>
          </div>
          <button
            onClick={onToggle}
            className="p-2 text-slate-400 hover:text-white md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onTabChange(item.id);
                      if (onToggle) onToggle();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                        : 'text-slate-300 hover:bg-slate-800'
                      }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{t(item.labelKey)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="text-xs text-slate-500">
            <p>
              {t('version')} 1.0.0
            </p>
            <p className="mt-1">{t('mock_mode')}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
