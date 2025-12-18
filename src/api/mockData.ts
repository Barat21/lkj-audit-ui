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

export const mockTransactions: Transaction[] = [
  {
    id: 'txn1',
    date: '2024-04-15',
    sender: 'MR KALAI',
    particulars: 'UPI/CR/408552127716/MR KALAI/PAYTM',
    amount: 75000,
    type: 'CREDIT',
    kycStatus: 'PENDING',
    billId: null,
  },
  {
    id: 'txn2',
    date: '2024-04-18',
    sender: 'SURESH ENTERPRISES',
    particulars: 'NEFT/SURESH ENTERPRISES/INV 1234',
    amount: 150000,
    type: 'CREDIT',
    kycStatus: 'COMPLETED',
    billId: '2024-0001',
  },
  {
    id: 'txn3',
    date: '2024-04-20',
    sender: 'KUMAR SERVICES',
    particulars: 'IMPS/KUMAR SERVICES/PAYMENT',
    amount: 45000,
    type: 'CREDIT',
    kycStatus: 'N/A',
    billId: null,
  },
  {
    id: 'txn4',
    date: '2024-04-22',
    sender: 'VENDOR ABC',
    particulars: 'NEFT/VENDOR ABC/SUPPLIES',
    amount: 280000,
    type: 'DEBIT',
    kycStatus: 'N/A',
    billId: null,
  },
  {
    id: 'txn5',
    date: '2024-04-25',
    sender: 'RAJESH TRADING',
    particulars: 'UPI/CR/408552127717/RAJESH TRADING',
    amount: 95000,
    type: 'CREDIT',
    kycStatus: 'PENDING',
    billId: null,
  },
  {
    id: 'txn6',
    date: '2024-04-28',
    sender: 'VENDOR ABC',
    particulars: 'RTGS/VENDOR ABC/PAYMENT',
    amount: 520000,
    type: 'DEBIT',
    kycStatus: 'N/A',
    billId: null,
  },
  {
    id: 'txn7',
    date: '2024-05-02',
    sender: 'PRIYA SOLUTIONS',
    particulars: 'NEFT/PRIYA SOLUTIONS/CONSULTING',
    amount: 125000,
    type: 'CREDIT',
    kycStatus: 'COMPLETED',
    billId: '2024-0002',
  },
  {
    id: 'txn8',
    date: '2024-05-05',
    sender: 'VENDOR XYZ',
    particulars: 'NEFT/VENDOR XYZ/RAW MATERIALS',
    amount: 450000,
    type: 'DEBIT',
    kycStatus: 'N/A',
    billId: null,
  },
  {
    id: 'txn9',
    date: '2024-05-08',
    sender: 'ARUN INDUSTRIES',
    particulars: 'IMPS/ARUN INDUSTRIES/ORDER 5678',
    amount: 85000,
    type: 'CREDIT',
    kycStatus: 'PENDING',
    billId: null,
  },
  {
    id: 'txn10',
    date: '2024-05-10',
    sender: 'VENDOR ABC',
    particulars: 'NEFT/VENDOR ABC/MONTHLY',
    amount: 320000,
    type: 'DEBIT',
    kycStatus: 'N/A',
    billId: null,
  },
  {
    id: 'txn11',
    date: '2024-05-12',
    sender: 'DEEPA CONSULTANTS',
    particulars: 'UPI/CR/408552127718/DEEPA CONSULTANTS',
    amount: 60000,
    type: 'CREDIT',
    kycStatus: 'COMPLETED',
    billId: null,
  },
  {
    id: 'txn12',
    date: '2024-05-15',
    sender: 'VENDOR XYZ',
    particulars: 'RTGS/VENDOR XYZ/SUPPLIES',
    amount: 680000,
    type: 'DEBIT',
    kycStatus: 'N/A',
    billId: null,
  },
  {
    id: 'txn13',
    date: '2024-05-18',
    sender: 'MR KALAI',
    particulars: 'UPI/CR/408552127719/MR KALAI/PAYTM',
    amount: 55000,
    type: 'CREDIT',
    kycStatus: 'PENDING',
    billId: null,
  },
  {
    id: 'txn14',
    date: '2024-05-20',
    sender: 'TECH SOLUTIONS PVT',
    particulars: 'NEFT/TECH SOLUTIONS PVT/PROJECT PAYMENT',
    amount: 250000,
    type: 'CREDIT',
    kycStatus: 'PENDING',
    billId: null,
  },
  {
    id: 'txn15',
    date: '2024-05-22',
    sender: 'VENDOR ABC',
    particulars: 'NEFT/VENDOR ABC/FINAL PAYMENT',
    amount: 420000,
    type: 'DEBIT',
    kycStatus: 'N/A',
    billId: null,
  },
];

export const mockKYCs: KYC[] = [
  {
    id: 'kyc1',
    name: 'SURESH ENTERPRISES',
    pan: 'ABCDE1234F',
    aadhaarLast4: '5678',
    notes: 'Regular client, verified documents',
    updatedAt: '2024-04-18',
    linkedTransactions: ['txn2'],
  },
  {
    id: 'kyc2',
    name: 'PRIYA SOLUTIONS',
    pan: 'FGHIJ5678K',
    aadhaarLast4: '9012',
    notes: 'Consulting services provider',
    updatedAt: '2024-05-02',
    linkedTransactions: ['txn7'],
  },
  {
    id: 'kyc3',
    name: 'DEEPA CONSULTANTS',
    pan: 'KLMNO9012P',
    aadhaarLast4: '3456',
    updatedAt: '2024-05-12',
    linkedTransactions: ['txn11'],
  },
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
