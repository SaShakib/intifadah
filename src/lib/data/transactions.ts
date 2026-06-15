import type { Transaction } from '@/types';

export const TRANSACTIONS: Transaction[] = [
  {
    id: 'tx1', memberId: 'm3', memberName: 'আবদুল রহমান', memberInitials: 'আ',
    type: 'collection', amount: 5000, categoryName: 'সাপ্তাহিক চাঁদা',
    date: '১৫ জুন ২০২৬', status: 'completed',
  },
  {
    id: 'tx2', memberId: 'm2', memberName: 'রহিমা খাতুন', memberInitials: 'র',
    type: 'savings', amount: 3000, categoryName: 'ব্যক্তিগত সঞ্চয়',
    date: '১৫ জুন ২০২৬', status: 'completed',
  },
  {
    id: 'tx3', memberId: 'm7', memberName: 'ইব্রাহিম শেখ', memberInitials: 'ই',
    type: 'loan', amount: 20000, categoryName: 'কর্যে হাসানাঃ',
    date: '১৪ জুন ২০২৬', status: 'pending',
  },
  {
    id: 'tx4', memberId: 'm4', memberName: 'সালেহা বেগম', memberInitials: 'স',
    type: 'donation', amount: 2500, categoryName: 'দান তহবিল',
    date: '১৪ জুন ২০২৬', status: 'completed',
  },
  {
    id: 'tx5', memberId: 'm5', memberName: 'মো. করিম', memberInitials: 'ম',
    type: 'repayment', amount: 3000, categoryName: 'ঋণ পরিশোধ',
    date: '১৩ জুন ২০২৬', status: 'completed',
  },
  {
    id: 'tx6', memberId: 'm6', memberName: 'নাসরিন আক্তার', memberInitials: 'ন',
    type: 'collection', amount: 4000, categoryName: 'সাপ্তাহিক চাঁদা',
    date: '১৩ জুন ২০২৬', status: 'completed',
  },
  {
    id: 'tx7', memberId: 'm9', memberName: 'আমির হোসেন', memberInitials: 'আ',
    type: 'loan', amount: 15000, categoryName: 'কর্যে হাসানাঃ',
    date: '১২ জুন ২০২৬', status: 'pending',
  },
  {
    id: 'tx8', memberId: 'm8', memberName: 'জান্নাতুন নিসা', memberInitials: 'জ',
    type: 'savings', amount: 8000, categoryName: 'ব্যক্তিগত সঞ্চয়',
    date: '১২ জুন ২০২৬', status: 'completed',
  },
  {
    id: 'tx9', memberId: 'm2', memberName: 'রহিমা খাতুন', memberInitials: 'র',
    type: 'donation', amount: 1500, categoryName: 'দান তহবিল',
    date: '১১ জুন ২০২৬', status: 'completed',
  },
  {
    id: 'tx10', memberId: 'm3', memberName: 'আবদুল রহমান', memberInitials: 'আ',
    type: 'savings', amount: 5000, categoryName: 'ব্যক্তিগত সঞ্চয়',
    date: '১০ জুন ২০২৬', status: 'completed',
  },
];

export const USER_TRANSACTIONS: Transaction[] = [
  {
    id: 'utx1', memberId: 'm2', memberName: 'রহিমা খাতুন', memberInitials: 'র',
    type: 'savings', amount: 3000, categoryName: 'ব্যক্তিগত সঞ্চয়',
    date: '১৫ জুন ২০২৬', status: 'completed',
  },
  {
    id: 'utx2', memberId: 'm2', memberName: 'রহিমা খাতুন', memberInitials: 'র',
    type: 'donation', amount: 1500, categoryName: 'দান তহবিল',
    date: '১১ জুন ২০২৬', status: 'completed',
  },
  {
    id: 'utx3', memberId: 'm2', memberName: 'রহিমা খাতুন', memberInitials: 'র',
    type: 'collection', amount: 2000, categoryName: 'সাপ্তাহিক চাঁদা',
    date: '০৮ জুন ২০২৬', status: 'completed',
  },
  {
    id: 'utx4', memberId: 'm2', memberName: 'রহিমা খাতুন', memberInitials: 'র',
    type: 'savings', amount: 5000, categoryName: 'ব্যক্তিগত সঞ্চয়',
    date: '০১ জুন ২০২৬', status: 'completed',
  },
  {
    id: 'utx5', memberId: 'm2', memberName: 'রহিমা খাতুন', memberInitials: 'র',
    type: 'donation', amount: 2000, categoryName: 'দান তহবিল',
    date: '২৮ মে ২০২৬', status: 'completed',
  },
];
