import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Save } from 'lucide-react';
import { api } from '../api/api';
import { useAlert } from '../context/AlertContext';
import { useLoading } from '../context/LoadingContext';
import { useLanguage } from '../context/LanguageContext';

export default function Settings() {
  const { t } = useLanguage();
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
        showAlert(t('settings_saved'), t('success'), 'success');
      } catch (error) {
        console.error('Error saving settings:', error);
        showAlert('Error saving settings', t('error'), 'error');
      } finally {
        setLoading(false);
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

          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleSaveBillingSettings}
              disabled={loading}
            >
              <Save size={18} className="mr-2 inline" />
              {loading ? t('saving') : t('save_settings')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
