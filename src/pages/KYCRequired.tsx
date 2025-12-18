import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Table, { Column } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { api } from '../api/api';
import { Transaction } from '../api/mockData';
import { UserPlus } from 'lucide-react';

export default function KYCRequired() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
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
      await loadData();
    } catch (error) {
      console.error('Error saving KYC:', error);
      alert('Error saving KYC');
    }
  };

  const getLinkedTransactionsCount = (sender: string) => {
    return transactions.filter((t) => t.sender === sender).length;
  };

  const columns: Column<Transaction>[] = [
    {
      header: 'Sender Name',
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
      header: 'Date',
      accessor: 'date',
    },
    {
      header: 'Linked Transactions',
      accessor: (row) => getLinkedTransactionsCount(row.sender),
    },
    {
      header: 'Action',
      accessor: (row) => (
        <Button
          size="sm"
          variant="primary"
          onClick={() => openKycForm(row)}
        >
          <UserPlus size={16} className="mr-2 inline" />
          Perform KYC
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            KYC Required for High-Value Transactions
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            All credit transactions ≥ ₹50,000 require KYC verification
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
        title="KYC Form"
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
            list="pan-list"
            required={!kycForm.aadhaarLast4 && !kycForm.gst}
          />

          <Input
            label="Aadhaar Last 4 Digits"
            value={kycForm.aadhaarLast4}
            onChange={(value) =>
              setKycForm({ ...kycForm, aadhaarLast4: value })
            }
            placeholder="1234"
            list="aadhaar-list"
            required={!kycForm.pan && !kycForm.gst}
          />

          <Input
            label="GST Number"
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
    </div>
  );
}
