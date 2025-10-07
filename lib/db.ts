import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const COUPONS_FILE = path.join(DATA_DIR, 'coupons.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  status: 'free' | 'pro';
  proExpiresAt?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  startsAt: string;
  expiresAt: string;
  maxRedemptions: number;
  redeemedCount: number;
  redeemedByUserId?: string;
  redeemedAt?: string;
  createdAt: string;
}

function readUsers(): User[] {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, '[]');
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeUsers(users: User[]): void {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readCoupons(): Coupon[] {
  try {
    if (!fs.existsSync(COUPONS_FILE)) {
      // Initialize with some default coupons
      const defaultCoupons: Coupon[] = [
        {
          id: 'coupon_1',
          code: 'PRODEC25-A7KD-93QF-MZ1H',
          startsAt: new Date().toISOString(),
          expiresAt: '2025-12-30T23:59:59.000Z',
          maxRedemptions: 1,
          redeemedCount: 0,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'coupon_2',
          code: 'PRODEC25-B2LX-5RNU-TY8C',
          startsAt: new Date().toISOString(),
          expiresAt: '2025-12-30T23:59:59.000Z',
          maxRedemptions: 1,
          redeemedCount: 0,
          createdAt: new Date().toISOString(),
        },
      ];
      fs.writeFileSync(COUPONS_FILE, JSON.stringify(defaultCoupons, null, 2));
      return defaultCoupons;
    }
    const data = fs.readFileSync(COUPONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeCoupons(coupons: Coupon[]): void {
  fs.writeFileSync(COUPONS_FILE, JSON.stringify(coupons, null, 2));
}

export const db = {
  users: {
    findByEmail: (email: string): User | null => {
      const users = readUsers();
      return users.find(u => u.email === email) || null;
    },
    
    create: (userData: Omit<User, 'id' | 'createdAt'>): User => {
      const users = readUsers();
      const user: User = {
        ...userData,
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      writeUsers(users);
      return user;
    },
    
    update: (id: string, updates: Partial<User>): User | null => {
      const users = readUsers();
      const index = users.findIndex(u => u.id === id);
      if (index === -1) return null;
      
      users[index] = { ...users[index], ...updates };
      writeUsers(users);
      return users[index];
    },
    
    findAll: (): User[] => {
      return readUsers();
    },
  },
  
  coupons: {
    findByCode: (code: string): Coupon | null => {
      const coupons = readCoupons();
      return coupons.find(c => c.code === code) || null;
    },
    
    create: (couponData: Omit<Coupon, 'id' | 'createdAt'>): Coupon => {
      const coupons = readCoupons();
      const coupon: Coupon = {
        ...couponData,
        id: `coupon_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        createdAt: new Date().toISOString(),
      };
      coupons.push(coupon);
      writeCoupons(coupons);
      return coupon;
    },
    
    update: (id: string, updates: Partial<Coupon>): Coupon | null => {
      const coupons = readCoupons();
      const index = coupons.findIndex(c => c.id === id);
      if (index === -1) return null;
      
      coupons[index] = { ...coupons[index], ...updates };
      writeCoupons(coupons);
      return coupons[index];
    },
    
    findAll: (): Coupon[] => {
      return readCoupons();
    },
  },
};