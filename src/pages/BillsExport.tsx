import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Table, { Column } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { api } from '../api/api';
import { Bill, Transaction } from '../api/mockData';
import {
  FileText,
  Download,
  RefreshCw,
  FileDown,
} from 'lucide-react';

export default function BillsExport() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

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
    setShowGenerateModal(true);
  };

  const handleGenerateBill = async () => {
    if (!selectedTransaction) return;

    try {
      await api.generateBill(selectedTransaction.id, billForm.notes);
      alert('Bill generated successfully!');
      setShowGenerateModal(false);
      await loadData();
    } catch (error) {
      console.error('Error generating bill:', error);
      alert('Error generating bill');
    }
  };

  const handleDownloadBill = (billId: string) => {
    alert(`Downloading bill ${billId} (mock)`);
  };

  const handleRegenerateBill = async (bill: Bill) => {
    if (confirm(`Regenerate bill ${bill.billId}?`)) {
      alert('Bill regenerated (mock)');
    }
  };

  const handleExport = async () => {
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
      alert('Export completed successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data');
    }
  };

  const handleCleanup = async () => {
    try {
      setLoading(true);
      await api.cleanupData(exportForm.month, exportForm.year);
      alert('Data cleanup completed successfully!');
    } catch (error) {
      console.error('Error cleaning up data:', error);
      alert('Error cleaning up data');
    } finally {
      setLoading(false);
    }
  };

  const creditTransactionsWithoutBills = transactions.filter(
    (t) => t.type === 'CREDIT' && !t.billId
  );

  const billColumns: Column<Bill>[] = [
    {
      header: 'Bill Number',
      accessor: 'billId',
    },
    {
      header: 'Customer Name',
      accessor: 'customer',
    },
    {
      header: 'Amount',
      accessor: (row) => (
        <span className="font-semibold">
          ₹{row.amount.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: 'date',
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleDownloadBill(row.billId)}
          >
            <Download size={16} className="mr-1 inline" />
            Download
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRegenerateBill(row)}
          >
            <RefreshCw size={16} className="mr-1 inline" />
            Regenerate
          </Button>
        </div>
      ),
    },
  ];

  const transactionColumns: Column<Transaction>[] = [
    {
      header: 'Date',
      accessor: 'date',
    },
    {
      header: 'Customer',
      accessor: 'sender',
    },
    {
      header: 'Amount',
      accessor: (row) => (
        <span className="font-semibold">
          ₹{row.amount.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: (row) => (
        <Button
          size="sm"
          variant="success"
          onClick={() => openGenerateModal(row)}
        >
          <FileText size={16} className="mr-1 inline" />
          Generate Bill
        </Button>
      ),
    },
  ];

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
