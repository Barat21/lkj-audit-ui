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

export const api = {
  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const response = await fetch('http://localhost:8080/api/transactions');
      if (!response.ok) {
        throw new Error(`Error fetching transactions: ${response.statusText}`);
      }
      const data = await response.json();
      transactions = data; // Update local cache so other mock functions might work with real data
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

      const response = await fetch('http://localhost:8080/api/upload-statement', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error uploading statement: ${response.statusText}`);
      }

      // We don't strictly need to return the new transactions here as the UI re-fetches
      // But we'll return an empty array to match signature
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

      console.log('Sending KYC Payload:', payload);

      const response = await fetch('http://localhost:8080/api/kyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error saving KYC: ${response.statusText}`);
      }

      const responseData = await response.json();

      // Update local cache to reflect changes in UI immediately without reload if needed
      // But standard way is to return the data

      // We also need to update the transactions locally to show 'COMPLETED' status
      // This is a bit of a hybrid approach since we are mixing mock data with real API calls
      // ideally we should re-fetch transactions from the server.

      // Let's rely on the caller to reload data, but we can update the mock cache if we desire 
      // strict consistency with the mock behavior we had before.

      const newKyc: KYC = {
        id: responseData.id || `kyc_${Date.now()}`,
        ...kycData,
        updatedAt: new Date().toISOString().split('T')[0],
      };

      // Update local mock store just in case other parts of the app rely on it
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
        `http://localhost:8080/api/auditor/bills/download?year=${year}&month=${month}`
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
        `http://localhost:8080/api/kyc/autocomplete?name=${encodeURIComponent(
          customerName
        )}`
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
      const response = await fetch('http://localhost:8080/api/settings');
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
        `http://localhost:8080/api/saveSettings?lastSerial=${lastSerial}`,
        {
          method: 'POST',
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

  cleanupData: async (month: number, year: number): Promise<void> => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/bills/cleanup?year=${year}&month=${month}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) {
        throw new Error(`Error cleaning up data: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to cleanup data', error);
      throw error;
    }
  },
};
