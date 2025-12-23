import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Save } from 'lucide-react';
import { api } from '../api/api';
import { useAlert } from '../context/AlertContext';
import { useLoading } from '../context/LoadingContext';

export default function Settings() {
  const [billingSettings, setBillingSettings] = useState({
    serialPrefix: '',
  });

  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();
  const { withLoading } = useLoading();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await api.getSettings();
      setBillingSettings({ serialPrefix: settings.lastSerial });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSaveBillingSettings = async () => {
    await withLoading(async () => {
      try {
        setLoading(true);
        await api.saveSettings(billingSettings.serialPrefix);
        showAlert('Settings saved successfully!', 'Success', 'success');
      } catch (error) {
        console.error('Error saving settings:', error);
        showAlert('Error saving settings', 'Error', 'error');
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card title="Invoice Sequence">
        <div className="space-y-6">
          <div className="max-w-md">
            <Input
              label="Starting Sequence Number"
              value={billingSettings.serialPrefix}
              onChange={(value) =>
                setBillingSettings({ ...billingSettings, serialPrefix: value })
              }
              placeholder="2024"
            />
            <p className="text-xs text-gray-500 mt-2">
              Invoice number sequence starts from this number
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleSaveBillingSettings}
              disabled={loading}
            >
              <Save size={18} className="mr-2 inline" />
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>

          </div>
        </div>
      </Card>
    </div>
  );
}
