import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Save, Plus, Trash2, X } from 'lucide-react';
import { api } from '../api/api';
import { useAlert } from '../context/AlertContext';
import { useLoading } from '../context/LoadingContext';
import { useLanguage } from '../context/LanguageContext';
import { Vehicle, RiceRate } from '../api/mockData';

export default function Settings() {
  const { t } = useLanguage();
  const [billingSettings, setBillingSettings] = useState({
    serialPrefix: '',
  });

  const [riceTypes, setRiceTypes] = useState<RiceRate[]>([]);
  const [newRiceType, setNewRiceType] = useState({ name: '', minRate: 1000, maxRate: 5000 });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [newVehicleNumber, setNewVehicleNumber] = useState('');

  const [kycLimit, setKycLimit] = useState<number>(50000);

  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();
  const { withLoading } = useLoading();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [settings, vehicleData, riceData, kycData] = await Promise.all([
        api.getSettings(),
        api.getVehicles(),
        api.getRiceRates(),
        api.getKycLimit()
      ]);
      setBillingSettings({ serialPrefix: settings.lastSerial });
      setVehicles(vehicleData);
      setRiceTypes(riceData);
      setKycLimit(kycData?.amount ?? 50000);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSaveBillingSettings = async () => {
    await withLoading(async () => {
      try {
        setLoading(true);
        await Promise.all([
          api.saveSettings(billingSettings.serialPrefix),
          api.saveKycLimit(kycLimit)
        ]);
        showAlert(t('settings_saved'), t('success'), 'success');
      } catch (error) {
        console.error('Error saving settings:', error);
        showAlert('Error saving settings', t('error'), 'error');
      } finally {
        setLoading(false);
      }
    });
  };

  const addRiceType = async () => {
    if (!newRiceType.name) return;
    await withLoading(async () => {
      try {
        await api.saveRiceRate({
          riceType: newRiceType.name,
          minRate: newRiceType.minRate,
          maxRate: newRiceType.maxRate,
        });
        setNewRiceType({ name: '', minRate: 1000, maxRate: 5000 });
        await loadSettings();
        showAlert('Product type added successfully', 'Success', 'success');
      } catch (error) {
        showAlert('Error adding product type', 'Error', 'error');
      }
    });
  };

  const removeRiceType = async (riceType: string) => {
    await withLoading(async () => {
      try {
        await api.deleteRiceRate(riceType);
        await loadSettings();
        showAlert('Product type deleted', 'Success', 'success');
      } catch (error) {
        showAlert('Error deleting product type', 'Error', 'error');
      }
    });
  };

  const updateRiceTypeRate = async (riceType: string, minRate: number, maxRate: number) => {
    await withLoading(async () => {
      try {
        await api.saveRiceRate({ riceType, minRate, maxRate });
        showAlert('Rates updated successfully', 'Success', 'success');
        await loadSettings();
      } catch (error) {
        console.error('Error updating rate:', error);
        showAlert('Error updating rates', 'Error', 'error');
      }
    });
  };

  const handleRateLocalUpdate = (riceType: string, field: 'minRate' | 'maxRate', value: number) => {
    setRiceTypes(prev => prev.map(rt => rt.riceType === riceType ? { ...rt, [field]: value } : rt));
  };

  const addVehicle = async () => {
    if (!newVehicleNumber) return;
    await withLoading(async () => {
      try {
        await api.saveVehicle({ vehicleNumber: newVehicleNumber });
        setNewVehicleNumber('');
        await loadSettings();
        showAlert('Vehicle number added', 'Success', 'success');
      } catch (error) {
        showAlert('Error adding vehicle', 'Error', 'error');
      }
    });
  };

  const removeVehicle = async (id: string) => {
    await withLoading(async () => {
      try {
        await api.deleteVehicle(id);
        await loadSettings();
        showAlert('Vehicle removed', 'Success', 'success');
      } catch (error) {
        showAlert('Error removing vehicle', 'Error', 'error');
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card title={t('invoice_sequence')}>
        <div className="space-y-6">
          <div className="max-w-md">
            <Input
              label={t('starting_sequence')}
              value={billingSettings.serialPrefix}
              onChange={(value) =>
                setBillingSettings({ ...billingSettings, serialPrefix: value })
              }
              placeholder="2024"
            />
            <p className="text-xs text-gray-500 mt-2">
              {t('sequence_help')}
            </p>
          </div>
        </div>
      </Card>

      <Card title="KYC Configuration">
        <div className="space-y-6">
          <div className="max-w-md">
            <Input
              label="KYC Amount Limit (₹)"
              type="number"
              value={(kycLimit || 50000).toString()}
              onChange={(value) => setKycLimit(parseInt(value) || 0)}
              placeholder="50000"
            />
            <p className="text-xs text-gray-500 mt-2">
              Transactions above this amount will require KYC completion.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rice Types Component */}
        <Card title="Product Types Configuration">
          <div className="space-y-4">
            <div className="space-y-4 pb-4 border-b">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="md:col-span-1">
                  <Input
                    label="Product Type Name"
                    value={newRiceType.name}
                    onChange={(val) => setNewRiceType({ ...newRiceType, name: val })}
                    placeholder="e.g. Basmati"
                  />
                </div>
                <div>
                  <Input
                    label="Min Rate (₹)"
                    type="number"
                    value={newRiceType.minRate.toString()}
                    onChange={(val) => setNewRiceType({ ...newRiceType, minRate: parseInt(val) || 0 })}
                  />
                </div>
                <div>
                  <Input
                    label="Max Rate (₹)"
                    type="number"
                    value={newRiceType.maxRate.toString()}
                    onChange={(val) => setNewRiceType({ ...newRiceType, maxRate: parseInt(val) || 0 })}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={addRiceType} size="sm" variant="outline">
                  <Plus size={18} className="mr-1" /> Add Product Type
                </Button>
              </div>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {riceTypes.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No product types added yet.</p>
              ) : (
                riceTypes.map((rt) => (
                  <div key={rt.riceType} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-gray-700">{rt.riceType}</span>
                      <button
                        onClick={() => removeRiceType(rt.riceType)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Min Rate (₹)</label>
                        <Input
                          type="number"
                          value={rt.minRate.toString()}
                          onChange={(val) => handleRateLocalUpdate(rt.riceType, 'minRate', parseInt(val) || 0)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Max Rate (₹)</label>
                        <Input
                          type="number"
                          value={rt.maxRate.toString()}
                          onChange={(val) => handleRateLocalUpdate(rt.riceType, 'maxRate', parseInt(val) || 0)}
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded transition-colors"
                        onClick={() => updateRiceTypeRate(rt.riceType, rt.minRate, rt.maxRate)}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Vehicle Numbers Component */}
        <Card title="Vehicle Configuration">
          <div className="space-y-4">
            <div className="flex gap-2 items-end pb-4 border-b">
              <div className="flex-1">
                <Input
                  label="Vehicle Number"
                  value={newVehicleNumber}
                  onChange={(val) => setNewVehicleNumber(val.toUpperCase())}
                  placeholder="TN-01-AB-1234"
                />
              </div>
              <Button onClick={addVehicle} size="sm" variant="outline">
                <Plus size={18} className="mr-1" /> Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 max-h-[400px] overflow-y-auto pr-2">
              {vehicles.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No vehicles added yet.</p>
              ) : (
                vehicles.map((v) => (
                  <div key={v.id} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100 font-medium text-sm">
                    {v.vehicleNumber}
                    <button
                      onClick={() => removeVehicle(v.id)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          variant="primary"
          onClick={handleSaveBillingSettings}
          disabled={loading}
          className="w-full sm:w-auto px-8"
        >
          <Save size={18} className="mr-2 inline" />
          {loading ? t('saving') : t('save_settings')}
        </Button>
      </div>
    </div>
  );
}
