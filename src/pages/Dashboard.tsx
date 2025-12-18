import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import SimpleBarChart from '../components/ui/SimpleBarChart';
import SimplePieChart from '../components/ui/SimplePieChart';
import { api } from '../api/api';
import { Transaction } from '../api/mockData';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  UserCheck,
  UserX,
  AlertTriangle,
} from 'lucide-react';

export default function Dashboard() {
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
      title: 'Total Credits This Month',
      value: `₹${totalCreditsThisMonth.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Debits This Month',
      value: `₹${totalDebitsThisMonth.toLocaleString()}`,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Credits ≥ ₹50,000',
      value: creditsAbove50k.toString(),
      icon: AlertCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pending KYC Count',
      value: pendingKyc.toString(),
      icon: UserX,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Completed KYC Count',
      value: completedKyc.toString(),
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'TDS Alerts (>₹50L)',
      value: tdsAlerts.toString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  const kycChartData = [
    { label: 'Pending KYC', value: pendingKyc, color: '#f59e0b' },
    { label: 'Completed KYC', value: completedKyc, color: '#10b981' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading dashboard...</p>
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
        <Card title="Monthly Credits vs Debits">
          <SimpleBarChart data={monthlyData} />
        </Card>

        <Card title="KYC Status Overview">
          <SimplePieChart data={kycChartData} />
        </Card>
      </div>
    </div>
  );
}
