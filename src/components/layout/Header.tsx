import { Bell, User, LogOut, Menu, Languages } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface HeaderProps {
  title: string;
  onLogout: () => void;
  onMenuClick?: () => void;
}

export default function Header({ title, onLogout, onMenuClick }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden transition-colors"
            aria-label="Toggle Menu"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 truncate max-w-[150px] md:max-w-none">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
          >
            <Languages size={16} />
            <span className="hidden sm:inline">
              {language === 'en' ? 'தமிழ்' : 'English'}
            </span>
          </button>

          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-gray-200">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-800">Admin User</p>
              <p className="text-xs text-gray-500">admin@company.com</p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title={t('sign_out')}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
