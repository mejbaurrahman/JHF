export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  ADVISOR = "advisor",
  GUEST = "guest",
}

export enum DonationMethod {
  BKASH = "bkash",
  NAGAD = "nagad",
  CASH = "cash",
  BANK = "bank",
}

export enum DonationStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  FAILED = "failed",
}

export enum EventType {
  MAHFIL = "mahfil",
  CHARITY = "charity",
  MEETING = "quran_class",
  OTHER = "other",
  TAFSEER = "tafseer",
}

export enum EventStatus {
  UPCOMING = "upcoming",
  ONGOING = "ongoing",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface User {
  _id: string;
  id?: string; // Frontend alias
  name: string;
  email: string;
  role: UserRole | string;
  phone?: string;
  createdAt?: string;
  joinDate?: string; // Frontend alias
  customRole?: string;
  // New Profile Fields
  profileImage?: string;
  address?: string;
  occupation?: string;
  bio?: string;
  isActive?: boolean;
}

export interface Event {
  _id: string;
  id?: string; // Frontend alias
  title: string;
  slug?: string;
  startDate?: string;
  date?: string; // Frontend alias compatibility
  endDate?: string;
  description: string;
  location: string;
  type: EventType;
  status?: EventStatus;
  managerIds?: any[];
  manager?: string; // Frontend alias
  totalDonations?: number; // Virtual or computed
  totalExpenses?: number; // Virtual or computed
  estimatedBudget?: number;
  bannerUrl?: string; // New Field
  createdBy?: any;
}

export interface Donation {
  _id: string;
  id?: string;
  userId?: string; // Linked User ID if logged in
  donorName: string;
  donorPhone?: string;
  amount: number;
  paymentMethod: DonationMethod;
  method?: string; // Frontend alias
  transactionId: string;
  status: DonationStatus;
  eventId?: any;
  donationDate?: string;
  date?: string; // Frontend alias
  isAnonymous?: boolean;
}

export interface Fee {
  _id: string;
  id?: string;
  userId: string | User;
  month: number;
  year: number;
  amount: number;
  status: "pending" | "paid" | "failed";
  paymentMethod: string;
  transactionId?: string;
  isPaid?: boolean; // Frontend helper
  paidAt?: string;
}

export interface Expense {
  _id: string;
  id?: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
  eventId?: string | Event;
}

export interface FinanceSummary {
  totalDonations: number;
  totalConfirmedDonations: number;
  totalFees: number;
  totalExpenses: number;
  netBalance: number;
  // Operational Counts
  userCount: number;
  eventCount: number;
  pendingDonationCount: number;
}

// CMS Types
export interface SiteContent {
  section: string;
  data: Record<string, any>;
}

export interface CommitteeMember {
  _id: string;
  id?: string;
  name: string;
  roleKey: string;
  imageUrl?: string;
  phone?: string;
  order: number;
  customRole?: string;
}

export interface GalleryItem {
  _id: string;
  id?: string;
  title: string;
  imageUrl: string;
  category?: string;
  date?: string;
}

export interface Notification {
  _id: string;
  id?: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: string;
}
