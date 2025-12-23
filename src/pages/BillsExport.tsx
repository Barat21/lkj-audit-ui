import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import { Column } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { api } from '../api/api';
import { Bill, Transaction } from '../api/mockData';
import { useAlert } from '../context/AlertContext';
import { useLoading } from '../context/LoadingContext';
import {
  RefreshCw,
  FileDown,
} from 'lucide-react';

export default function BillsExport() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const { showAlert } = useAlert();
  const { withLoading } = useLoading();

  const [billForm, setBillForm] = useState({
    customerName: '',
    amount: 0,
    date: '',
    notes: '',
  });

  const [exportForm, setExportForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [billsData, txnsData] = await Promise.all([
        api.getBills(),
        api.getTransactions(),
      ]);
      setBills(billsData);
      setTransactions(txnsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openGenerateModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setBillForm({
      customerName: transaction.sender,
      amount: transaction.amount,
      date: transaction.date,
      notes: '',
    });
  };

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
        showAlert('Export completed successfully!', 'Success', 'success');
      } catch (error) {
        console.error('Error exporting data:', error);
        showAlert('Error exporting data', 'Error', 'error');
      }
    });
  };

  const handleCleanup = async () => {
    await withLoading(async () => {
      try {
        setLoading(true);
        const response = await api.cleanupData(exportForm.month, exportForm.year);
        showAlert(response.message, 'Cleanup Successful', 'success');
      } catch (error) {
        console.error('Error cleaning up data:', error);
        showAlert('Error cleaning up data', 'Error', 'error');
      } finally {
        setLoading(false);
      }
    });
  };

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { value: String(year), label: String(year) };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card title="Monthly Export">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Select
            label="Month"
            value={String(exportForm.month)}
            onChange={(value) =>
              setExportForm({ ...exportForm, month: parseInt(value) })
            }
            options={months}
          />

          <Select
            label="Year"
            value={String(exportForm.year)}
            onChange={(value) =>
              setExportForm({ ...exportForm, year: parseInt(value) })
            }
            options={years}
          />

          <Button variant="primary" onClick={handleExport}>
            <FileDown size={18} className="mr-2 inline" />
            Export Bills + Summary CSV
          </Button>
        </div>
      </Card>

      <Card title="Clean Up Data">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Select
            label="Month"
            value={String(exportForm.month)}
            onChange={(value) =>
              setExportForm({ ...exportForm, month: parseInt(value) })
            }
            options={months}
          />

          <Select
            label="Year"
            value={String(exportForm.year)}
            onChange={(value) =>
              setExportForm({ ...exportForm, year: parseInt(value) })
            }
            options={years}
          />

          <Button variant="primary" onClick={handleCleanup}>
            <RefreshCw size={18} className="mr-2 inline" />
            Clean Up Data
          </Button>
        </div>
      </Card>
    </div>
  );
}
