import {
  mockTransactions,
  mockKYCs,
  mockBills,
  mockMonthlyData,
  Transaction,
  KYC,
  Bill,
  TDSVendor,
} from './mockData';

let transactions = [...mockTransactions];
let kycs = [...mockKYCs];
let bills = [...mockBills];

let billCounter = 3;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getBaseHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const companyName = sessionStorage.getItem('companyName');
  if (companyName) {
    headers['X-Company-Name'] = companyName;
  }
  return headers;
};

export const api = {
  login: async (username: string, password: string): Promise<any> => {
    const response = await fetch('http://localhost:9090/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, company: "" }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Invalid credentials');
    }

    return await response.json();
  },

  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const response = await fetch('http://localhost:9090/api/transactions', {
        headers: getBaseHeaders(),
      });
      if (!response.ok) {
        throw new Error(`Error fetching transactions: ${response.statusText}`);
      }
      const data = await response.json();
      transactions = data;
      return data;
    } catch (error) {
      console.error('Failed to get transactions', error);
      throw error;
    }
  },

  uploadStatement: async (file: File, bankName: string): Promise<Transaction[]> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bankName', bankName);

      const response = await fetch('http://localhost:9090/api/upload-statement', {
        method: 'POST',
        headers: {
          'X-Company-Name': sessionStorage.getItem('companyName') || '',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error uploading statement: ${response.statusText}`);
      }

      return [];
    } catch (error) {
      console.error('Failed to upload statement', error);
      throw error;
    }
  },

  saveKyc: async (kycData: Omit<KYC, 'id' | 'updatedAt'>): Promise<KYC> => {
    try {
      const payload = {
        name: kycData.name,
        pan: kycData.pan,
        aadhaarLast4: kycData.aadhaarLast4,
        gst: kycData.gst,
        transactionIds: kycData.linkedTransactions,
      };

      const response = await fetch('http://localhost:9090/api/kyc', {
        method: 'POST',
        headers: getBaseHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error saving KYC: ${response.statusText}`);
      }

      const responseData = await response.json();

      const newKyc: KYC = {
        id: responseData.id || `kyc_${Date.now()}`,
        ...kycData,
        updatedAt: new Date().toISOString().split('T')[0],
      };

      kycs = [...kycs, newKyc];
      transactions = transactions.map((t) =>
        kycData.linkedTransactions.includes(t.id)
          ? { ...t, kycStatus: 'COMPLETED' as const }
          : t
      );

      return newKyc;

    } catch (error) {
      console.error('Failed to save KYC', error);
      throw error;
    }
  },

  getKycs: async (): Promise<KYC[]> => {
    await delay(300);
    return [...kycs];
  },

  generateBill: async (
    transactionId: string,
    notes?: string
  ): Promise<Bill> => {
    await delay(500);
    const transaction = transactions.find((t) => t.id === transactionId);
    if (!transaction) throw new Error('Transaction not found');

    const year = new Date(transaction.date).getFullYear();
    const billId = `${year}-${String(billCounter).padStart(4, '0')}`;
    billCounter++;

    const newBill: Bill = {
      billId,
      customer: transaction.sender,
      amount: transaction.amount,
      date: transaction.date,
      transactionId,
      notes,
      pdfUrl: `/mock/bills/${billId}.pdf`,
    };

    bills = [...bills, newBill];
    transactions = transactions.map((t) =>
      t.id === transactionId ? { ...t, billId } : t
    );

    return newBill;
  },

  getBills: async (): Promise<Bill[]> => {
    await delay(300);
    return [...bills];
  },

  getTdsSummary: async (): Promise<TDSVendor[]> => {
    await delay(300);
    const debits = transactions.filter((t) => t.type === 'DEBIT');

    const vendorMap = new Map<string, { total: number; txns: string[] }>();

    debits.forEach((t) => {
      const existing = vendorMap.get(t.sender) || { total: 0, txns: [] };
      vendorMap.set(t.sender, {
        total: existing.total + t.amount,
        txns: [...existing.txns, t.id],
      });
    });

    const vendors: TDSVendor[] = Array.from(vendorMap.entries()).map(
      ([vendor, data], idx) => ({
        id: `vendor_${idx}`,
        vendor,
        paidYTD: data.total,
        status:
          data.total >= 5000000
            ? 'TDS_REQUIRED'
            : data.total >= 4000000
              ? 'NEARING_LIMIT'
              : 'UNDER_LIMIT',
        transactions: data.txns,
      })
    );

    return vendors;
  },

  getMonthlyData: async () => {
    await delay(300);
    return mockMonthlyData;
  },

  exportMonthlyData: async (month: number, year: number): Promise<Blob> => {
    try {
      const response = await fetch(
        `http://localhost:9090/api/auditor/bills/download?year=${year}&month=${month}`,
        {
          headers: {
            'X-Company-Name': sessionStorage.getItem('companyName') || '',
          }
        }
      );
      if (!response.ok) {
        throw new Error(`Error exporting data: ${response.statusText}`);
      }
      return await response.blob();
    } catch (error) {
      console.error('Failed to export monthly data', error);
      throw error;
    }
  },

  getSuggestions: async (customerName: string) => {
    try {
      const response = await fetch(
        `http://localhost:9090/api/kyc/autocomplete?name=${encodeURIComponent(
          customerName
        )}`,
        {
          headers: getBaseHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error(`Error fetching suggestions: ${response.statusText}`);
      }
      const data: { type: string; value: string }[] = await response.json();

      return {
        pans: data.filter((d) => d.type === 'PAN').map((d) => d.value),
        aadhaars: data.filter((d) => d.type === 'AADHAAR').map((d) => d.value),
        gsts: data.filter((d) => d.type === 'GST').map((d) => d.value),
      };
    } catch (error) {
      console.error('Failed to get suggestions', error);
      return { pans: [], aadhaars: [], gsts: [] };
    }
  },

  getSettings: async (): Promise<{ lastSerial: string }> => {
    try {
      const response = await fetch('http://localhost:9090/api/settings', {
        headers: getBaseHeaders(),
      });
      if (!response.ok) {
        throw new Error(`Error fetching settings: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get settings', error);
      throw error;
    }
  },

  saveSettings: async (lastSerial: string): Promise<void> => {
    try {
      const response = await fetch(
        `http://localhost:9090/api/saveSettings?lastSerial=${lastSerial}`,
        {
          method: 'POST',
          headers: getBaseHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error(`Error saving settings: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to save settings', error);
      throw error;
    }
  },

  // Vehicle Config APIs
  getVehicles: async (): Promise<any[]> => {
    const response = await fetch('http://localhost:9090/api/config/vehicles', {
      headers: getBaseHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch vehicles');
    return await response.json();
  },

  saveVehicle: async (vehicle: { id?: string; vehicleNumber: string }): Promise<void> => {
    const response = await fetch('http://localhost:9090/api/config/vehicles', {
      method: 'POST',
      headers: getBaseHeaders(),
      body: JSON.stringify(vehicle),
    });
    if (!response.ok) throw new Error('Failed to save vehicle');
  },

  deleteVehicle: async (id: string): Promise<void> => {
    const response = await fetch(`http://localhost:9090/api/config/vehicles/${id}`, {
      method: 'DELETE',
      headers: getBaseHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete vehicle');
  },

  // Rice Rate Config APIs
  getRiceRates: async (): Promise<any[]> => {
    const response = await fetch('http://localhost:9090/api/config/rice-rates', {
      headers: getBaseHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch rice rates');
    return await response.json();
  },

  saveRiceRate: async (riceRate: { riceType: string; minRate: number; maxRate: number }): Promise<void> => {
    const response = await fetch('http://localhost:9090/api/config/rice-rates', {
      method: 'POST',
      headers: getBaseHeaders(),
      body: JSON.stringify(riceRate),
    });
    if (!response.ok) throw new Error('Failed to save rice rate');
  },

  deleteRiceRate: async (riceType: string): Promise<void> => {
    const response = await fetch(`http://localhost:9090/api/config/rice-rates/${encodeURIComponent(riceType)}`, {
      method: 'DELETE',
      headers: getBaseHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete rice rate');
  },

  // KYC Limit Config APIs
  getKycLimit: async (): Promise<{ amount: number }> => {
    const response = await fetch('http://localhost:9090/api/config/kyc-limit', {
      headers: getBaseHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch KYC limit');
    return await response.json();
  },

  saveKycLimit: async (amount: number): Promise<void> => {
    const response = await fetch('http://localhost:9090/api/config/kyc-limit', {
      method: 'POST',
      headers: getBaseHeaders(),
      body: JSON.stringify({ amount }),
    });
    if (!response.ok) throw new Error('Failed to save KYC limit');
  },

  cleanupData: async (month: number, year: number): Promise<{ message: string }> => {
    try {
      const response = await fetch(
        `http://localhost:9090/api/bills/cleanup?year=${year}&month=${month}`,
        {
          method: 'DELETE',
          headers: getBaseHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error(`Error cleaning up data: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to cleanup data', error);
      throw error;
    }
  },

  saveTransaction: async (
    transaction: Transaction | Omit<Transaction, 'id'>
  ): Promise<Transaction> => {
    try {
      const response = await fetch(
        'http://localhost:9090/api/transactions/save',
        {
          method: 'POST',
          headers: getBaseHeaders(),
          body: JSON.stringify(transaction),
        }
      );
      if (!response.ok) {
        throw new Error(`Error saving transaction: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to save transaction', error);
      throw error;
    }
  },

  deleteTransaction: async (id: string): Promise<void> => {
    try {
      const response = await fetch(
        `http://localhost:9090/api/transactions/delete?id=${id}`,
        {
          method: 'DELETE',
          headers: getBaseHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error(`Error deleting transaction: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to delete transaction', error);
      throw error;
    }
  },
};
