export interface Transaction {
  id: string;
  date: string;
  sender: string;
  particulars: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  kycStatus: 'PENDING' | 'COMPLETED' | 'N/A';
  billId: string | null;
}

export interface KYC {
  id: string;
  name: string;
  pan: string;
  aadhaarLast4: string;
  gst?: string;
  notes?: string;
  updatedAt: string;
  linkedTransactions: string[];
}

export interface Bill {
  billId: string;
  customer: string;
  amount: number;
  date: string;
  transactionId: string;
  notes?: string;
  pdfUrl: string;
}

export interface TDSVendor {
  id: string;
  vendor: string;
  paidYTD: number;
  status: 'UNDER_LIMIT' | 'NEARING_LIMIT' | 'TDS_REQUIRED';
  transactions: string[];
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
}

export interface RiceRate {
  riceType: string;
  minRate: number;
  maxRate: number;
}

export const mockTransactions: Transaction[] = [];

export const mockKYCs: KYC[] = [
];

export const mockBills: Bill[] = [
  {
    billId: '2024-0001',
    customer: 'SURESH ENTERPRISES',
    amount: 150000,
    date: '2024-04-18',
    transactionId: 'txn2',
    notes: 'Consulting services rendered',
    pdfUrl: '/mock/bills/2024-0001.pdf',
  },
  {
    billId: '2024-0002',
    customer: 'PRIYA SOLUTIONS',
    amount: 125000,
    date: '2024-05-02',
    transactionId: 'txn7',
    notes: 'Project milestone payment',
    pdfUrl: '/mock/bills/2024-0002.pdf',
  },
];

export const mockTDSVendors: TDSVendor[] = [
  {
    id: 'vendor1',
    vendor: 'VENDOR ABC',
    paidYTD: 5200000,
    status: 'TDS_REQUIRED',
    transactions: ['txn4', 'txn6', 'txn10', 'txn15'],
  },
  {
    id: 'vendor2',
    vendor: 'VENDOR XYZ',
    paidYTD: 4500000,
    status: 'NEARING_LIMIT',
    transactions: ['txn8', 'txn12'],
  },
  {
    id: 'vendor3',
    vendor: 'SUPPLIES CO',
    paidYTD: 2300000,
    status: 'UNDER_LIMIT',
    transactions: [],
  },
];

export const mockMonthlyData = [
  { month: 'Jan', credits: 450000, debits: 320000 },
  { month: 'Feb', credits: 580000, debits: 420000 },
  { month: 'Mar', credits: 720000, debits: 510000 },
  { month: 'Apr', credits: 495000, debits: 1080000 },
  { month: 'May', credits: 830000, debits: 1870000 },
];
