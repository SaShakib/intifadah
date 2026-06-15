import type { Loan } from '@/types';

export const LOANS: Loan[] = [
  {
    id: 'l1', borrowerId: 'm7', borrowerName: 'ইব্রাহিম শেখ', borrowerInitials: 'ই',
    amount: 20000, purpose: 'ব্যবসায়িক মূলধন', issueDate: '১৪ জুন ২০২৬',
    dueDate: '১৪ ডিসেম্বর ২০২৬', status: 'pending_approval', totalRepaid: 0,
    installmentAmount: 3500,
  },
  {
    id: 'l2', borrowerId: 'm9', borrowerName: 'আমির হোসেন', borrowerInitials: 'আ',
    amount: 15000, purpose: 'চিকিৎসা ব্যয়', issueDate: '১২ জুন ২০২৬',
    dueDate: '১২ নভেম্বর ২০২৬', status: 'pending_approval', totalRepaid: 0,
    installmentAmount: 2800,
  },
  {
    id: 'l3', borrowerId: 'm5', borrowerName: 'মো. করিম', borrowerInitials: 'ম',
    amount: 8000, purpose: 'শিক্ষা ব্যয়', issueDate: '০১ মার্চ ২০২৬',
    dueDate: '০১ সেপ্টেম্বর ২০২৬', status: 'overdue', totalRepaid: 0,
    installmentAmount: 1400,
  },
  {
    id: 'l4', borrowerId: 'm4', borrowerName: 'সালমা বেগম', borrowerInitials: 'স',
    amount: 12000, purpose: 'গৃহ সংস্কার', issueDate: '১৫ ফেব্রুয়ারি ২০২৬',
    dueDate: '১৫ আগস্ট ২০২৬', status: 'overdue', totalRepaid: 0,
    installmentAmount: 2100,
  },
  {
    id: 'l5', borrowerId: 'm6', borrowerName: 'নাসরিন আক্তার', borrowerInitials: 'ন',
    amount: 10000, purpose: 'ব্যবসায়িক মূলধন', issueDate: '১০ জানুয়ারি ২০২৬',
    dueDate: '১০ জুলাই ২০২৬', status: 'active', totalRepaid: 6000,
    installmentAmount: 1800,
  },
];
