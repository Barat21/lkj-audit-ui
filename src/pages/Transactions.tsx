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
import { Upload, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { useLoading } from '../context/LoadingContext';
import { useLanguage } from '../context/LanguageContext';

export default function Transactions() {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { showAlert } = useAlert();
  const { withLoading } = useLoading();

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

  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionModalMode, setTransactionModalMode] = useState<
    'add' | 'edit'
  >('add');
  const [transactionForm, setTransactionForm] = useState<
    Omit<Transaction, 'id' | 'kycStatus' | 'billId'>
  >({
    date: new Date().toISOString().split('T')[0],
    sender: '',
    particulars: '',
    amount: 0,
    type: 'CREDIT',
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

    // Sort to show PENDING KYC first
    filtered.sort((a, b) => {
      if (a.kycStatus === 'PENDING' && b.kycStatus !== 'PENDING') return -1;
      if (a.kycStatus !== 'PENDING' && b.kycStatus === 'PENDING') return 1;
      return 0;
    });

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedBank) {
      showAlert(t('please_select_bank'), t('bank_required'), 'info');
      return;
    }
    await withLoading(async () => {
      try {
        setUploading(true);
        await api.uploadStatement(file, selectedBank);
        await loadTransactions();
        setShowUploadModal(false);
        setSelectedBank(''); // Reset bank selection
        showAlert('Statement uploaded successfully!', 'Success', 'success');
      } catch (error) {
        console.error('Error uploading file:', error);
        showAlert('Error uploading file', 'Error', 'error');
      } finally {
        setUploading(false);
      }
    });
  };

  const handleGenerateBill = async (txnId: string) => {
    await withLoading(async () => {
      try {
        await api.generateBill(txnId);
        await loadTransactions();
        showAlert('Bill generated successfully!', 'Success', 'success');
      } catch (error) {
        console.error('Error generating bill:', error);
      }
    });
  };


  const openKycForm = async (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setKycForm({
      name: transaction.sender,
      pan: '',
      aadhaarLast4: '',
      gst: '',
      notes: '',
    });
    setShowKycModal(true);

    // Trigger autocompletion
    try {
      const suggestions = await api.getSuggestions(transaction.sender);
      if (suggestions) {
        setKycForm((prev) => ({
          ...prev,
          pan: suggestions.pans[0] || '',
          aadhaarLast4: suggestions.aadhaars[0] || '',
          gst: suggestions.gsts[0] || '',
        }));
      }
    } catch (error) {
      console.error('Failed to fetch KYC suggestions:', error);
    }
  };

  const handleSaveKyc = async () => {
    if (!selectedTransaction) return;

    if (!kycForm.pan && !kycForm.aadhaarLast4 && !kycForm.gst) {
      showAlert('Please fill at least one of PAN, GST, or Aadhaar', t('info_missing'), 'info');
      return;
    }

    await withLoading(async () => {
      try {
        await api.saveKyc({
          name: kycForm.name,
          pan: kycForm.pan,
          aadhaarLast4: kycForm.aadhaarLast4,
          gst: kycForm.gst,
          notes: kycForm.notes,
          linkedTransactions: [selectedTransaction.id],
        });

        showAlert('KYC saved successfully!', 'Success', 'success');
        setShowKycModal(false);
        await loadTransactions();
      } catch (error) {
        console.error('Error saving KYC:', error);
        showAlert('Error saving KYC', 'Error', 'error');
      }
    });
  };

  const openTransactionModal = (transaction?: Transaction) => {
    if (transaction) {
      setTransactionModalMode('edit');
      setTransactionForm({
        date: transaction.date,
        sender: transaction.sender,
        particulars: transaction.particulars,
        amount: transaction.amount,
        type: transaction.type,
      });
      setSelectedTransaction(transaction);
    } else {
      setTransactionModalMode('add');
      setTransactionForm({
        date: new Date().toISOString().split('T')[0],
        sender: '',
        particulars: '',
        amount: 0,
        type: 'CREDIT',
      });
      setSelectedTransaction(null);
    }
    setShowTransactionModal(true);
  };

  const handleSaveTransaction = async () => {
    if (
      !transactionForm.sender ||
      !transactionForm.amount ||
      !transactionForm.date
    ) {
      showAlert(t('please_fill_required'), t('info_missing'), 'info');
      return;
    }

    await withLoading(async () => {
      try {
        const payload = {
          ...transactionForm,
          ...(transactionModalMode === 'edit' && selectedTransaction
            ? { id: selectedTransaction.id }
            : {}),
        };

        await api.saveTransaction(payload as any);
        showAlert(
          transactionModalMode === 'add' ? t('txn_added_success') : t('txn_updated_success'),
          'Success',
          'success'
        );
        setShowTransactionModal(false);
        await loadTransactions();
      } catch (error) {
        console.error('Error saving transaction:', error);
        showAlert('Error saving transaction', 'Error', 'error');
      }
    });
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    await withLoading(async () => {
      try {
        await api.deleteTransaction(id);
        showAlert('Transaction deleted successfully!', 'Success', 'success');
        await loadTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        showAlert('Error deleting transaction', 'Error', 'error');
      }
    });
  };

  const paginatedData = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: Column<Transaction>[] = [
    {
      header: t('date'),
      accessor: 'date',
    },
    {
      header: t('sender_receiver'),
      accessor: 'sender',
    },
    {
      header: t('transaction_id'),
      accessor: 'id',
    },
    {
      header: t('amount'),
      accessor: (row) => (
        <span className="font-semibold">₹{row.amount.toLocaleString()}</span>
      ),
    },
    {
      header: t('type'),
      accessor: (row) => (
        <Badge variant={row.type === 'CREDIT' ? 'success' : 'danger'}>
          {row.type === 'CREDIT' ? t('credit') : t('debit')}
        </Badge>
      ),
    },
    {
      header: t('actions'),
      accessor: (row) => (
        <div className="flex flex-wrap gap-2">
          {row.kycStatus === 'PENDING' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => openKycForm(row)}
            >
              {t('kyc')}
            </Button>
          )}
          {row.type === 'CREDIT' && !row.billId && (
            <Button
              size="sm"
              variant="success"
              onClick={() => handleGenerateBill(row.id)}
            >
              {t('bill')}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => openTransactionModal(row)}
          >
            <Edit2 size={14} />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteTransaction(row.id)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">{t('loading_transactions')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card
        title={t('upload_statement')}
        action={
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => openTransactionModal()}>
              <Plus size={18} className="mr-0 sm:mr-2 inline" />
              <span className="hidden sm:inline">{t('add_transaction')}</span>
              <span className="sm:hidden">{t('add')}</span>
            </Button>
            <Button variant="primary" onClick={() => setShowUploadModal(true)}>
              <Upload size={18} className="mr-0 sm:mr-2 inline" />
              <span className="hidden sm:inline">{t('upload_statement')}</span>
              <span className="sm:hidden">{t('upload')}</span>
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          {t('bank_statement_desc')}
        </p>
      </Card>

      <Card title={t('filters')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Select
            label={t('type')}
            value={filters.type}
            onChange={(value) => setFilters({ ...filters, type: value })}
            options={[
              { value: '', label: t('all') },
              { value: 'CREDIT', label: t('credit') },
              { value: 'DEBIT', label: t('debit') },
            ]}
          />

          <Select
            label={t('amount')}
            value={filters.amountFilter}
            onChange={(value) =>
              setFilters({ ...filters, amountFilter: value })
            }
            options={[
              { value: '', label: t('all_amounts') },
              { value: 'above50k', label: '≥ ₹50,000' },
            ]}
          />

          <Input
            label={t('search_sender')}
            value={filters.search}
            onChange={(value) => setFilters({ ...filters, search: value })}
            placeholder={t('search_placeholder')}
          />

          <Input
            label={t('date_from')}
            type="date"
            value={filters.dateFrom}
            onChange={(value) => setFilters({ ...filters, dateFrom: value })}
          />

          <Input
            label={t('date_to')}
            type="date"
            value={filters.dateTo}
            onChange={(value) => setFilters({ ...filters, dateTo: value })}
          />
        </div>
      </Card>

      <Card title={`${t('transactions')} (${filteredTransactions.length})`}>
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
        title={t('upload_statement')}
        size="md"
      >
        <div className="space-y-4">
          <Select
            label={t('select_bank')}
            value={selectedBank}
            onChange={(value) => setSelectedBank(value)}
            options={[
              { value: '', label: t('select_bank_check') },
              { value: 'City Union Bank', label: 'City Union Bank' },
              { value: 'Indian Bank', label: 'Indian Bank' },
              { value: 'Karur Vysya Bank', label: 'Karur Vysya Bank' },
            ]}
          />
          <FileUploader onFileSelect={handleFileUpload} accept=".pdf,.csv" />
          {uploading && (
            <p className="text-center text-gray-600">{t('loading')}</p>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={showKycModal}
        onClose={() => setShowKycModal(false)}
        title={t('kyc_form')}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label={t('customer_name')}
            value={kycForm.name}
            onChange={(value) => setKycForm({ ...kycForm, name: value })}
            required
          />

          <Input
            label={t('pan_number')}
            value={kycForm.pan}
            onChange={(value) =>
              setKycForm({ ...kycForm, pan: value.toUpperCase() })
            }
            placeholder="ABCDE1234F"
            required={!kycForm.aadhaarLast4 && !kycForm.gst}
          />

          <Input
            label={t('aadhaar_last_4')}
            value={kycForm.aadhaarLast4}
            onChange={(value) =>
              setKycForm({ ...kycForm, aadhaarLast4: value })
            }
            placeholder="1234"
            required={!kycForm.pan && !kycForm.gst}
          />

          <Input
            label={t('gst_number')}
            value={kycForm.gst || ''}
            onChange={(value) =>
              setKycForm((prev) => ({ ...prev, gst: value.toUpperCase() }))
            }
            placeholder="22AAAAA0000A1Z5"
            required={!kycForm.pan && !kycForm.aadhaarLast4}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('notes')}
            </label>
            <textarea
              value={kycForm.notes}
              onChange={(e) =>
                setKycForm({ ...kycForm, notes: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder={t('notes')}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => setShowKycModal(false)}>
              {t('cancel')}
            </Button>
            <Button variant="success" onClick={handleSaveKyc}>
              {t('save_kyc')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        title={
          transactionModalMode === 'add'
            ? t('add_transaction')
            : t('edit')
        }
        size="md"
      >
        <div className="space-y-4">
          {transactionModalMode === 'edit' && selectedTransaction && (
            <Input
              label={t('transaction_id')}
              value={selectedTransaction.id}
              onChange={() => { }}
              readOnly
              className="bg-gray-50 font-mono text-xs"
            />
          )}

          <Input
            label={t('date')}
            type="date"
            value={transactionForm.date}
            onChange={(value) =>
              setTransactionForm({ ...transactionForm, date: value })
            }
            required
          />

          <Input
            label={t('sender_receiver')}
            value={transactionForm.sender}
            onChange={(value) =>
              setTransactionForm({ ...transactionForm, sender: value })
            }
            placeholder={t('name_placeholder')}
            required
          />

          <Input
            label={t('particulars')}
            value={transactionForm.particulars}
            onChange={(value) =>
              setTransactionForm({
                ...transactionForm,
                particulars: value,
              })
            }
            placeholder={t('details_placeholder')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('amount')}
              type="number"
              value={transactionForm.amount.toString()}
              onChange={(value) =>
                setTransactionForm({
                  ...transactionForm,
                  amount: parseFloat(value) || 0,
                })
              }
              required
            />

            <Select
              label={t('type')}
              value={transactionForm.type}
              onChange={(value) =>
                setTransactionForm({
                  ...transactionForm,
                  type: value as 'CREDIT' | 'DEBIT',
                })
              }
              options={[
                { value: 'CREDIT', label: t('credit') },
                { value: 'DEBIT', label: t('debit') },
              ]}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setShowTransactionModal(false)}
            >
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleSaveTransaction}>
              {transactionModalMode === 'add'
                ? t('add_transaction')
                : t('update')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
