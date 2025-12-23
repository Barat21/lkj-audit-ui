import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Table, { Column } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { api } from '../api/api';
import { Transaction } from '../api/mockData';
import { UserPlus } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { useLoading } from '../context/LoadingContext';
import { useLanguage } from '../context/LanguageContext';

export default function KYCRequired() {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKycModal, setShowKycModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const { showAlert } = useAlert();
  const { withLoading } = useLoading();

  const [kycForm, setKycForm] = useState({
    name: '',
    pan: '',
    aadhaarLast4: '',
    gst: '',
    notes: '',
  });

  const [suggestions, setSuggestions] = useState<{
    pans: string[];
    aadhaars: string[];
    gsts: string[];
  }>({
    pans: [],
    aadhaars: [],
    gsts: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const allTransactions = await api.getTransactions();
      const pendingKyc = allTransactions.filter(
        (t) => t.amount >= 50000 && t.kycStatus === 'PENDING'
      );
      setTransactions(pendingKyc);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
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

    // Fetch suggestions
    api.getSuggestions(transaction.sender).then(setSuggestions);

    setShowKycModal(true);
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

        showAlert(t('kyc_saved_success'), t('success'), 'success');
        setShowKycModal(false);
        await loadData();
      } catch (error) {
        console.error('Error saving KYC:', error);
        showAlert('Error saving KYC', t('error'), 'error');
      }
    });
  };

  const getLinkedTransactionsCount = (sender: string) => {
    return transactions.filter((t) => t.sender === sender).length;
  };

  const columns: Column<Transaction>[] = [
    {
      header: t('sender_receiver'),
      accessor: 'sender',
    },
    {
      header: t('amount'),
      accessor: (row) => (
        <span className="font-semibold">
          ₹{row.amount.toLocaleString()}
        </span>
      ),
    },
    {
      header: t('date'),
      accessor: 'date',
    },
    {
      header: t('linked_transactions'),
      accessor: (row) => getLinkedTransactionsCount(row.sender),
    },
    {
      header: t('action'),
      accessor: (row) => (
        <Button
          size="sm"
          variant="primary"
          onClick={() => openKycForm(row)}
        >
          <UserPlus size={16} className="mr-0 sm:mr-2 inline" />
          <span className="hidden sm:inline">{t('perform_kyc')}</span>
          <span className="sm:hidden">{t('kyc')}</span>
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

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {t('kyc_required_title')}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {t('kyc_required_desc')}
          </p>
        </div>

        <Table
          columns={columns}
          data={transactions}
          keyExtractor={(row) => row.id}
        />
      </Card>

      <Modal
        isOpen={showKycModal}
        onClose={() => setShowKycModal(false)}
        title={t('kyc_form')}
        size="md"
      >
        <datalist id="pan-list">
          {suggestions.pans.map((pan) => (
            <option key={pan} value={pan} />
          ))}
        </datalist>
        <datalist id="aadhaar-list">
          {suggestions.aadhaars.map((aadhaar) => (
            <option key={aadhaar} value={aadhaar} />
          ))}
        </datalist>
        <datalist id="gst-list">
          {suggestions.gsts.map((gst) => (
            <option key={gst} value={gst} />
          ))}
        </datalist>

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
            list="pan-list"
            required={!kycForm.aadhaarLast4 && !kycForm.gst}
          />

          <Input
            label={t('aadhaar_last_4')}
            value={kycForm.aadhaarLast4}
            onChange={(value) =>
              setKycForm({ ...kycForm, aadhaarLast4: value })
            }
            placeholder="1234"
            list="aadhaar-list"
            required={!kycForm.pan && !kycForm.gst}
          />

          <Input
            label={t('gst_number')}
            value={kycForm.gst || ''}
            onChange={(value) =>
              setKycForm((prev) => ({ ...prev, gst: value.toUpperCase() }))
            }
            placeholder="22AAAAA0000A1Z5"
            list="gst-list"
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
            <Button
              variant="outline"
              onClick={() => setShowKycModal(false)}
            >
              {t('cancel')}
            </Button>
            <Button variant="success" onClick={handleSaveKyc}>
              {t('save_kyc')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
