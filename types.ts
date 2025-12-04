
export enum CardCategory {
  BANKING = 'Banking',
  BUSINESS = 'Business',
  ID = 'ID',
  LOYALTY = 'Loyalty',
  PASSPORT = 'Passport',
  DRIVER_LICENSE = 'Driver License',
  NATIONAL_ID = 'National ID',
  STUDENT_ID = 'Student ID',
  OTHER = 'Other'
}

export interface CardData {
  id: string;
  type: CardCategory;
  issuer: string; // Visa, Amex, Company Name
  number: string; // Card number or Phone
  holderName: string;
  expiryDate?: string;
  cvv?: string;
  notes?: string;
  colorTheme: string;
  createdAt: number;
  
  // Extended Contact Info (Business)
  jobTitle?: string;
  email?: string;
  phone?: string;
  
  // Extended ID Info (Vault)
  dob?: string;
  nationality?: string;
  
  // Analytics
  usageCount: number;
}

export interface SecurityLog {
  id: string;
  timestamp: number;
  event: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'DATA_WIPE' | 'SETTINGS_CHANGE' | 'FAKE_VAULT_ACCESS';
  details: string;
}

export interface SecuritySettings {
  pin: string;
  fakePin: string; // Duress PIN
  biometricEnabled: boolean;
  autoLockEnabled: boolean;
  autoLockTimeout: number; // in milliseconds
  selfDestructEnabled: boolean;
  stealthMode: boolean; // Disguise as Calculator
  screenProtection: boolean; // Blur on background
}

export interface UserSettings {
  isPremium: boolean;
  scanCount: number;
  security: SecuritySettings;
  logs: SecurityLog[];
}

export enum AppRoute {
  DASHBOARD = 'dashboard',
  SCANNER = 'scanner',
  WALLET = 'wallet',
  SETTINGS = 'settings',
  PREMIUM = 'premium',
  SECURITY = 'security'
}
