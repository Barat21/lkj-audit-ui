import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Table, { Column } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { api } from '../api/api';
import { Transaction } from '../api/mockData';
import { UserPlus, Printer } from 'lucide-react';
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
      const [allTransactions, kycLimitData] = await Promise.all([
        api.getTransactions(),
        api.getKycLimit()
      ]);
      const limit = kycLimitData?.amount ?? 50000;
      const pendingKyc = allTransactions.filter(
        (t) => t.amount >= limit && t.kycStatus === 'PENDING'
      );
      setTransactions(pendingKyc);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
      <div className="print:hidden">
        <Card>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {t('kyc_required_title')}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {t('kyc_required_desc')}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer size={18} />
              {t('print_kyc_sheets')}
            </Button>
          </div>

          <Table
            columns={columns}
            data={transactions}
            keyExtractor={(row) => row.id}
          />
        </Card>
      </div>

      {/* Print Only Section */}
      <div className="hidden print:block !m-0 !p-0">
        <style dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            body, html {
              height: auto !important;
              overflow: visible !important;
              background: white !important;
              color: black !important;
              -webkit-print-color-adjust: exact;
            }
            #root, .App {
              height: auto !important;
              overflow: visible !important;
            }
            tr {
              page-break-inside: avoid;
            }
            thead {
              display: table-header-group;
            }
          }
        `}} />

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-900 border-b-2 border-gray-900 pb-2 inline-block">
            {t('kyc_required_title')}
          </h1>
          <p className="text-xs text-gray-500 mt-2">
            Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
          </p>
        </div>

        <table className="w-full border-collapse border-2 border-gray-900 table-fixed">
          <thead>
            <tr className="bg-gray-100 text-[10px]">
              <th className="border border-gray-900 p-2 text-left w-[12%]">{t('date')}</th>
              <th className="border border-gray-900 p-2 text-left w-[25%]">{t('customer_name')}</th>
              <th className="border border-gray-900 p-2 text-right w-[13%]">{t('amount')}</th>
              <th className="border border-gray-900 p-2 text-left w-[12%]">PAN</th>
              <th className="border border-gray-900 p-2 text-left w-[12%]">AADHAAR</th>
              <th className="border border-gray-900 p-2 text-left w-[12%]">GST</th>
              <th className="border border-gray-900 p-2 text-left w-[14%]">{t('notes')}</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id} className="h-16">
                <td className="border border-gray-900 p-2 text-[10px] whitespace-nowrap">{txn.date}</td>
                <td className="border border-gray-900 p-2 font-semibold text-[11px] break-words uppercase">{txn.sender}</td>
                <td className="border border-gray-900 p-2 text-right font-bold text-[11px]">₹{txn.amount.toLocaleString()}</td>
                <td className="border border-gray-900 p-2 tracking-widest text-gray-300">__________</td>
                <td className="border border-gray-900 p-2 tracking-widest text-gray-300">__________</td>
                <td className="border border-gray-900 p-2 tracking-widest text-gray-300">__________</td>
                <td className="border border-gray-900 p-2 font-semibold text-[11px] break-words uppercase">
                  {txn.particulars}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 flex justify-between items-end border-t border-gray-300 pt-6">
          <div className="text-[10px] text-gray-600 space-y-2">
            <p className="font-bold uppercase tracking-wider">{t('notes')}:</p>
            <div className="w-80 border-b border-gray-300 h-6"></div>
            <div className="w-80 border-b border-gray-300 h-6"></div>
            <p className="italic mt-2">* Hand over filled sheet to auditor for system entry.</p>
          </div>
          <div className="text-center mr-10">
            <div className="w-40 border-b-2 border-gray-900 mb-2 h-12"></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-800">Verified By</p>
          </div>
        </div>
      </div>


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
