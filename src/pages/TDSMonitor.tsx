import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Table, { Column } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Select from '../components/ui/Select';
import { api } from '../api/api';
import { TDSVendor } from '../api/mockData';
import { Send, AlertTriangle } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { useLanguage } from '../context/LanguageContext';

export default function TDSMonitor() {
  const { t } = useLanguage();
  const [vendors, setVendors] = useState<TDSVendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<TDSVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const { showAlert } = useAlert();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [vendors, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getTdsSummary();
      setVendors(data);
    } catch (error) {
      console.error('Error loading TDS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...vendors];

    if (statusFilter) {
      filtered = filtered.filter((v) => v.status === statusFilter);
    }

    setFilteredVendors(filtered);
  };

  const handleSendReminder = (vendorName: string) => {
    showAlert(t('reminder_sent_success').replace('{name}', vendorName), t('success'), 'success');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'TDS_REQUIRED':
        return <Badge variant="danger">{t('tds_required')}</Badge>;
      case 'NEARING_LIMIT':
        return <Badge variant="warning">{t('nearing_limit')}</Badge>;
      case 'UNDER_LIMIT':
        return <Badge variant="success">{t('under_limit')}</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getProgressBar = (paidYTD: number) => {
    const limit = 5000000;
    const percentage = Math.min((paidYTD / limit) * 100, 100);

    const color =
      percentage >= 100
        ? 'bg-red-500'
        : percentage >= 80
          ? 'bg-yellow-500'
          : 'bg-green-500';

    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  const columns: Column<TDSVendor>[] = [
    {
      header: t('customer_name'),
      accessor: 'vendor',
    },
    {
      header: t('total_paid_ytd'),
      accessor: (row) => (
        <div className="min-w-[150px]">
          <span className="font-semibold block mb-1">
            ₹{row.paidYTD.toLocaleString()}
          </span>
          {getProgressBar(row.paidYTD)}
        </div>
      ),
    },
    {
      header: t('limit_label'),
      accessor: () => '₹50,00,000',
    },
    {
      header: t('kyc_status'),
      accessor: (row) => getStatusBadge(row.status),
    },
    {
      header: t('transactions'),
      accessor: (row) => row.transactions.length,
    },
    {
      header: t('action'),
      accessor: (row) => (
        <Button
          size="sm"
          variant={
            row.status === 'TDS_REQUIRED' ? 'danger' : 'outline'
          }
          onClick={() => handleSendReminder(row.vendor)}
        >
          <Send size={16} className="mr-0 sm:mr-2 inline" />
          <span className="hidden sm:inline">{t('send_reminder')}</span>
          <span className="sm:hidden">{t('send')}</span>
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">{t('loading')}...</p>
      </div>
    );
  }

  const tdsRequiredCount = vendors.filter(
    (v) => v.status === 'TDS_REQUIRED'
  ).length;

  const nearingLimitCount = vendors.filter(
    (v) => v.status === 'NEARING_LIMIT'
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {t('vendors_exceeding_limit')}
              </p>
              <p className="text-3xl font-bold text-red-600">
                {tdsRequiredCount}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-100">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {t('vendors_nearing_limit')}
              </p>
              <p className="text-3xl font-bold text-yellow-600">
                {nearingLimitCount}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100">
              <AlertTriangle size={24} className="text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">{t('total_vendors')}</p>
              <p className="text-3xl font-bold text-gray-800">
                {vendors.length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <AlertTriangle size={24} className="text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {t('tds_monitor_title')}
          </h3>

          <div className="max-w-xs">
            <Select
              label={t('filter_by_status')}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: '', label: t('all_vendors') },
                { value: 'TDS_REQUIRED', label: t('tds_required') },
                { value: 'NEARING_LIMIT', label: t('nearing_limit_label') },
                { value: 'UNDER_LIMIT', label: t('under_limit') },
              ]}
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredVendors}
          keyExtractor={(row) => row.id}
        />
      </Card>

      <Card>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">
            {t('about_tds_title')}
          </h4>
          <p className="text-sm text-blue-800">
            {t('about_tds_desc')}
          </p>
        </div>
      </Card>
    </div>
  );
}
