import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Table, { Column } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import FileUploader from '../components/ui/FileUploader';
import Modal from '../components/ui/Modal';
import { api } from '../api/api';
import { Transaction } from '../api/mockData';
import { Upload, Search } from 'lucide-react';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [showKycModal, setShowKycModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const [kycForm, setKycForm] = useState({
    name: '',
    pan: '',
    aadhaarLast4: '',
    gst: '',
    notes: '',
  });

  const [filters, setFilters] = useState({
    type: '',
    amountFilter: '',
    search: '',
    dateFrom: '',
    dateTo: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await api.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filters.type) {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    if (filters.amountFilter === 'above50k') {
      filtered = filtered.filter((t) => t.amount >= 50000);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((t) =>
        t.sender.toLowerCase().includes(searchLower)
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter((t) => t.date >= filters.dateFrom);
    }

    if (filters.dateTo) {
      filtered = filtered.filter((t) => t.date <= filters.dateTo);
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedBank) {
      alert('Please select a bank');
      return;
    }
    try {
      setUploading(true);
      setUploading(true);
      await api.uploadStatement(file, selectedBank);
      await loadTransactions();
      setShowUploadModal(false);
      setSelectedBank(''); // Reset bank selection
      alert('Statement uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateBill = async (txnId: string) => {
    try {
      await api.generateBill(txnId);
      await loadTransactions();
      alert('Bill generated successfully!');
    } catch (error) {
      console.error('Error generating bill:', error);
    }
  };


  const openKycForm = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setKycForm({
      name: transaction.sender,
      pan: '',
      aadhaarLast4: '',
      gst: '',
      notes: '',
    });
    setShowKycModal(true);
  };

  const handleSaveKyc = async () => {
    if (!selectedTransaction) return;

    console.log('KYC Form Data before save:', kycForm);

    if (!kycForm.pan && !kycForm.aadhaarLast4 && !kycForm.gst) {
      alert('Please fill at least one of PAN, GST, or Aadhaar');
      return;
    }

    try {
      await api.saveKyc({
        name: kycForm.name,
        pan: kycForm.pan,
        aadhaarLast4: kycForm.aadhaarLast4,
        gst: kycForm.gst,
        notes: kycForm.notes,
        linkedTransactions: [selectedTransaction.id],
      });

      alert('KYC saved successfully!');
      setShowKycModal(false);
      await loadTransactions();
    } catch (error) {
      console.error('Error saving KYC:', error);
      alert('Error saving KYC');
    }
  };

  const paginatedData = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: Column<Transaction>[] = [
    {
      header: 'Date',
      accessor: 'date',
    },
    {
      header: 'Sender/Receiver',
      accessor: 'sender',
    },
    {
      header: 'Description',
      accessor: (row) => (
        <span className="text-xs text-gray-600 max-w-xs truncate block">
          {row.particulars}
        </span>
      ),
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
      header: 'Type',
      accessor: (row) => (
        <Badge variant={row.type === 'CREDIT' ? 'success' : 'danger'}>
          {row.type}
        </Badge>
      ),
    },
    {
      header: 'KYC Status',
      accessor: (row) => {
        if (row.kycStatus === 'N/A') {
          return <Badge variant="default">N/A</Badge>;
        }
        return (
          <Badge
            variant={
              row.kycStatus === 'COMPLETED' ? 'success' : 'warning'
            }
          >
            {row.kycStatus}
          </Badge>
        );
      },
    },
    {
      header: 'Bill',
      accessor: (row) => (
        <Badge variant={row.billId ? 'success' : 'default'}>
          {row.billId ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2">
          {row.kycStatus === 'PENDING' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => openKycForm(row)}
            >
              Perform KYC
            </Button>
          )}
          {row.type === 'CREDIT' && !row.billId && (
            <Button
              size="sm"
              variant="success"
              onClick={() => handleGenerateBill(row.id)}
            >
              Generate Bill
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card
        title="Upload Bank Statement"
        action={
          <Button
            variant="primary"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload size={18} className="mr-2 inline" />
            Upload Statement
          </Button>
        }
      >
        <p className="text-sm text-gray-600">
          Upload your bank statement (PDF or CSV) to automatically parse
          transactions.
        </p>
      </Card>

      <Card title="Filters">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Select
            label="Type"
            value={filters.type}
            onChange={(value) => setFilters({ ...filters, type: value })}
            options={[
              { value: '', label: 'All' },
              { value: 'CREDIT', label: 'Credit' },
              { value: 'DEBIT', label: 'Debit' },
            ]}
          />

          <Select
            label="Amount"
            value={filters.amountFilter}
            onChange={(value) =>
              setFilters({ ...filters, amountFilter: value })
            }
            options={[
              { value: '', label: 'All Amounts' },
              { value: 'above50k', label: '≥ ₹50,000' },
            ]}
          />

          <Input
            label="Search Sender"
            value={filters.search}
            onChange={(value) => setFilters({ ...filters, search: value })}
            placeholder="Search by name..."
          />

          <Input
            label="Date From"
            type="date"
            value={filters.dateFrom}
            onChange={(value) =>
              setFilters({ ...filters, dateFrom: value })
            }
          />

          <Input
            label="Date To"
            type="date"
            value={filters.dateTo}
            onChange={(value) => setFilters({ ...filters, dateTo: value })}
          />
        </div>
      </Card>

      <Card title={`Transactions (${filteredTransactions.length})`}>
        <Table
          columns={columns}
          data={paginatedData}
          keyExtractor={(row) => row.id}
          pagination={{
            currentPage,
            totalPages: Math.ceil(filteredTransactions.length / pageSize),
            onPageChange: setCurrentPage,
            pageSize,
            totalItems: filteredTransactions.length,
          }}
        />
      </Card>

      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Bank Statement"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Select Bank"
            value={selectedBank}
            onChange={(value) => setSelectedBank(value)}
            options={[
              { value: '', label: 'Select Bank Check' },
              { value: 'City Union Bank', label: 'City Union Bank' },
              { value: 'Indian Bank', label: 'Indian Bank' },
              { value: 'Karur Vysya Bank', label: 'Karur Vysya Bank' },
            ]}
          />
          <FileUploader
            onFileSelect={handleFileUpload}
            accept=".pdf,.csv"
          />
          {uploading && (
            <p className="text-center text-gray-600">Uploading...</p>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={showKycModal}
        onClose={() => setShowKycModal(false)}
        title="KYC Form"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Customer Name"
            value={kycForm.name}
            onChange={(value) => setKycForm({ ...kycForm, name: value })}
            required
          />

          <Input
            label="PAN Number"
            value={kycForm.pan}
            onChange={(value) =>
              setKycForm({ ...kycForm, pan: value.toUpperCase() })
            }
            placeholder="ABCDE1234F"
            required={!kycForm.aadhaarLast4 && !kycForm.gst}
          />

          <Input
            label="Aadhaar Last 4 Digits"
            value={kycForm.aadhaarLast4}
            onChange={(value) =>
              setKycForm({ ...kycForm, aadhaarLast4: value })
            }
            placeholder="1234"
            required={!kycForm.pan && !kycForm.gst}
          />

          <Input
            label="GST Number"
            value={kycForm.gst || ''}
            onChange={(value) =>
              setKycForm((prev) => ({ ...prev, gst: value.toUpperCase() }))
            }
            placeholder="22AAAAA0000A1Z5"
            required={!kycForm.pan && !kycForm.aadhaarLast4}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={kycForm.notes}
              onChange={(e) =>
                setKycForm({ ...kycForm, notes: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setShowKycModal(false)}
            >
              Cancel
            </Button>
            <Button variant="success" onClick={handleSaveKyc}>
              Save KYC
            </Button>
          </div>
        </div>
      </Modal>
    </div >
  );
}
