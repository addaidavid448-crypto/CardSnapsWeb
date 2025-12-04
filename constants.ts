
import { CardCategory, SecuritySettings } from "./types";

export const APP_NAME = "CardSnap";

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  pin: '1234',
  fakePin: '0000',
  biometricEnabled: false,
  autoLockEnabled: true,
  autoLockTimeout: 60 * 1000, // 1 minute
  selfDestructEnabled: true,
  stealthMode: false,
  screenProtection: true
};

export const MOCK_CARDS = [
  {
    id: '1',
    type: CardCategory.BANKING,
    issuer: 'Visa',
    number: '**** **** **** 4242',
    holderName: 'Alex Johnson',
    expiryDate: '12/28',
    colorTheme: 'from-blue-600 to-blue-800',
    createdAt: Date.now(),
    usageCount: 15
  },
  {
    id: '2',
    type: CardCategory.BUSINESS,
    issuer: 'TechCorp Inc.',
    number: '+1 555 0123',
    holderName: 'Sarah Smith',
    jobTitle: 'Senior Software Engineer',
    email: 'sarah.smith@techcorp.com',
    phone: '+1 555 0123',
    notes: 'Met at TechConf 2024',
    colorTheme: 'from-gray-700 to-gray-900',
    createdAt: Date.now() - 100000,
    usageCount: 8
  },
  {
    id: '3',
    type: CardCategory.PASSPORT,
    issuer: 'United States',
    number: 'A12345678',
    holderName: 'Alex Johnson',
    expiryDate: '01/24', // Intentionally expired for demo
    dob: '15/05/1990',
    nationality: 'USA',
    colorTheme: 'from-indigo-900 to-slate-900',
    createdAt: Date.now() - 2000000,
    usageCount: 1
  },
  {
    id: '4',
    type: CardCategory.DRIVER_LICENSE,
    issuer: 'California DMV',
    number: 'D98765432',
    holderName: 'Alex Johnson',
    expiryDate: '10/25', // Expiring soon logic
    dob: '15/05/1990',
    colorTheme: 'from-amber-700 to-orange-900',
    createdAt: Date.now() - 3000000,
    usageCount: 5
  }
];

export const MOCK_FAKE_CARDS = [
  {
    id: 'fake-1',
    type: CardCategory.LOYALTY,
    issuer: 'Library Card',
    number: '12345678',
    holderName: 'John Doe',
    colorTheme: 'from-gray-400 to-gray-600',
    createdAt: Date.now(),
    usageCount: 1
  },
  {
    id: 'fake-2',
    type: CardCategory.OTHER,
    issuer: 'Gym Membership',
    number: 'G-9999',
    holderName: 'John Doe',
    colorTheme: 'from-blue-400 to-blue-500',
    createdAt: Date.now(),
    usageCount: 0
  }
];

export const MAX_FREE_SCANS = 5;

export const GRADIENTS = [
  'from-blue-600 to-blue-800',
  'from-purple-600 to-purple-800',
  'from-emerald-600 to-emerald-800',
  'from-rose-600 to-rose-800',
  'from-amber-600 to-orange-800',
  'from-slate-700 to-slate-900',
  'from-indigo-600 to-blue-900',
  'from-teal-600 to-emerald-800',
  'from-red-700 to-red-900',
];
