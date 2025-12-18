import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Table, { Column } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { api } from '../api/api';
import { KYC } from '../api/mockData';
import { Edit } from 'lucide-react';

export default function KYCCompleted() {
  const [kycs, setKycs] = useState<KYC[]>([]);
  const [filteredKycs, setFilteredKycs] = useState<KYC[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedKyc, setSelectedKyc] = useState<KYC | null>(null);

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

  useEffect(() => {
    if (searchTerm) {
      const filtered = kycs.filter((k) =>
        k.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredKycs(filtered);
    } else {
      setFilteredKycs(kycs);
    }
  }, [searchTerm, kycs]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getKycs();
      setKycs(data);
      setFilteredKycs(data);
    } catch (error) {
      console.error('Error loading KYC data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (kyc: KYC) => {
    setSelectedKyc(kyc);
    setKycForm({
      name: kyc.name,
      pan: kyc.pan,
      aadhaarLast4: kyc.aadhaarLast4,
      gst: kyc.gst || '',
      notes: kyc.notes || '',
    });

    // Fetch suggestions
    api.getSuggestions(kyc.name).then(setSuggestions);

    setShowEditModal(true);
  };

  const handleUpdateKyc = async () => {
    if (!selectedKyc) return;

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
        linkedTransactions: selectedKyc.linkedTransactions,
      });

      alert('KYC updated successfully!');
      setShowEditModal(false);
      await loadData();
    } catch (error) {
      console.error('Error updating KYC:', error);
      alert('Error updating KYC');
    }
  };

  const columns: Column<KYC>[] = [
    {
      header: 'Customer Name',
      accessor: 'name',
    },
    {
      header: 'PAN',
      accessor: 'pan',
    },
    {
      header: 'Aadhaar Last 4',
      accessor: 'aadhaarLast4',
    },
    {
      header: 'Last Updated',
      accessor: 'updatedAt',
    },
    {
      header: 'Linked Transactions',
      accessor: (row) => row.linkedTransactions.length,
    },
    {
      header: 'Action',
      accessor: (row) => (
        <Button
          size="sm"
          variant="primary"
          onClick={() => openEditModal(row)}
        >
          <Edit size={16} className="mr-2 inline" />
          Edit KYC
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
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Completed KYC Records
          </h3>

          <div className="max-w-md">
            <Input
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by customer name..."
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredKycs}
          keyExtractor={(row) => row.id}
        />
      </Card>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit KYC Details"
        size="md"
      >
        <datalist id="pan-list-edit">
          {suggestions.pans.map((pan) => (
            <option key={pan} value={pan} />
          ))}
        </datalist>
        <datalist id="aadhaar-list-edit">
          {suggestions.aadhaars.map((aadhaar) => (
            <option key={aadhaar} value={aadhaar} />
          ))}
        </datalist>
        <datalist id="gst-list-edit">
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
            list="pan-list-edit"
            required
          />

          <Input
            label="Aadhaar Last 4 Digits"
            value={kycForm.aadhaarLast4}
            onChange={(value) =>
              setKycForm({ ...kycForm, aadhaarLast4: value })
            }
            placeholder="1234"
            list="aadhaar-list-edit"
            required={!kycForm.pan && !kycForm.gst}
          />

          <Input
            label="GST Number"
            value={kycForm.gst}
            onChange={(value) =>
              setKycForm((prev) => ({ ...prev, gst: value.toUpperCase() }))
            }
            placeholder="22AAAAA0000A1Z5"
            list="gst-list-edit"
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
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button variant="success" onClick={handleUpdateKyc}>
              Update KYC
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
