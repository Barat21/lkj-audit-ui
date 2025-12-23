import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import SimpleBarChart from '../components/ui/SimpleBarChart';
import SimplePieChart from '../components/ui/SimplePieChart';
import { api } from '../api/api';
import { Transaction } from '../api/mockData';
import { useLanguage } from '../context/LanguageContext';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  UserCheck,
  UserX,
  AlertTriangle,
} from 'lucide-react';

export default function Dashboard() {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [txns, monthly] = await Promise.all([
        api.getTransactions(),
        api.getMonthlyData(),
      ]);
      setTransactions(txns);
      setMonthlyData(monthly);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentMonth = new Date().getMonth();
  const currentMonthTxns = transactions.filter((t) => {
    const txnMonth = new Date(t.date).getMonth();
    return txnMonth === currentMonth;
  });

  const totalCreditsThisMonth = currentMonthTxns
    .filter((t) => t.type === 'CREDIT')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebitsThisMonth = currentMonthTxns
    .filter((t) => t.type === 'DEBIT')
    .reduce((sum, t) => sum + t.amount, 0);

  const creditsAbove50k = transactions.filter(
    (t) => t.type === 'CREDIT' && t.amount >= 50000
  ).length;

  const pendingKyc = transactions.filter((t) => t.kycStatus === 'PENDING')
    .length;

  const completedKyc = transactions.filter((t) => t.kycStatus === 'COMPLETED')
    .length;

  const tdsAlerts = 2;

  const widgets = [
    {
      title: t('total_credits_this_month'),
      value: `₹${totalCreditsThisMonth.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: t('total_debits_this_month'),
      value: `₹${totalDebitsThisMonth.toLocaleString()}`,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: t('credits_above_50k'),
      value: creditsAbove50k.toString(),
      icon: AlertCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: t('pending_kyc_count'),
      value: pendingKyc.toString(),
      icon: UserX,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: t('completed_kyc_count'),
      value: completedKyc.toString(),
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: t('tds_alerts_count'),
      value: tdsAlerts.toString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  const kycChartData = [
    { label: t('pending'), value: pendingKyc, color: '#f59e0b' },
    { label: t('completed'), value: completedKyc, color: '#10b981' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">{t('loading_dashboard')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets.map((widget, idx) => {
          const Icon = widget.icon;
          return (
            <Card key={idx}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">{widget.title}</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {widget.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${widget.bgColor}`}>
                  <Icon size={24} className={widget.color} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('monthly_credits_vs_debits')}>
          <SimpleBarChart data={monthlyData} />
        </Card>

        <Card title={t('kyc_status_overview')}>
          <SimplePieChart data={kycChartData} />
        </Card>
      </div>
    </div>
  );
}
