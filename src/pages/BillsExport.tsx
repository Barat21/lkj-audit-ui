import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { api } from '../api/api';

import { useAlert } from '../context/AlertContext';
import { useLoading } from '../context/LoadingContext';
import { useLanguage } from '../context/LanguageContext';
import {
  RefreshCw,
  FileDown,
} from 'lucide-react';

export default function BillsExport() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();
  const { withLoading } = useLoading();

  const [exportForm, setExportForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleExport = async () => {
    await withLoading(async () => {
      try {
        const blob = await api.exportMonthlyData(
          exportForm.month,
          exportForm.year
        );
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bills_${exportForm.year}_${exportForm.month}.xlsx`;
        a.click();
        showAlert(t('export_success'), t('success'), 'success');
      } catch (error) {
        console.error('Error exporting data:', error);
        showAlert('Error exporting data', t('error'), 'error');
      }
    });
  };

  const handleCleanup = async () => {
    await withLoading(async () => {
      try {
        setLoading(true);
        const response = await api.cleanupData(exportForm.month, exportForm.year);
        showAlert(response.message, t('cleanup_success'), 'success');
      } catch (error) {
        console.error('Error cleaning up data:', error);
        showAlert('Error cleaning up data', t('error'), 'error');
      } finally {
        setLoading(false);
      }
    });
  };

  const months = [
    { value: '1', label: t('january') },
    { value: '2', label: t('february') },
    { value: '3', label: t('march') },
    { value: '4', label: t('april') },
    { value: '5', label: t('may') },
    { value: '6', label: t('june') },
    { value: '7', label: t('july') },
    { value: '8', label: t('august') },
    { value: '9', label: t('september') },
    { value: '10', label: t('october') },
    { value: '11', label: t('november') },
    { value: '12', label: t('december') },
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { value: String(year), label: String(year) };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">{t('loading')}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card title={t('monthly_export')}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <Select
            label={t('month')}
            value={String(exportForm.month)}
            onChange={(value) =>
              setExportForm({ ...exportForm, month: parseInt(value) })
            }
            options={months}
          />

          <Select
            label={t('year')}
            value={String(exportForm.year)}
            onChange={(value) =>
              setExportForm({ ...exportForm, year: parseInt(value) })
            }
            options={years}
          />

          <Button variant="primary" onClick={handleExport}>
            <FileDown size={18} className="mr-2 inline" />
            <span className="truncate">{t('export_bills')}</span>
          </Button>
        </div>
      </Card>

      <Card title={t('cleanup_data')}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <Select
            label={t('month')}
            value={String(exportForm.month)}
            onChange={(value) =>
              setExportForm({ ...exportForm, month: parseInt(value) })
            }
            options={months}
          />

          <Select
            label={t('year')}
            value={String(exportForm.year)}
            onChange={(value) =>
              setExportForm({ ...exportForm, year: parseInt(value) })
            }
            options={years}
          />

          <Button variant="primary" onClick={handleCleanup}>
            <RefreshCw size={18} className="mr-2 inline" />
            <span className="truncate">{t('cleanup_data')}</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
