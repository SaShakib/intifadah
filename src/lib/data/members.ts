import type { Member } from '@/types';

export const MEMBERS: Member[] = [
  {
    id: 'm1', memberId: 'INT-001', name: 'আবু বক্কর সিদ্দিক', phone: '01711-234567',
    email: 'abu.bakkar@example.com', role: 'manager', initials: 'আ', joinDate: '২০২৩-০১-১৫',
    address: 'মিরপুর-১, ঢাকা', gender: 'male', isActive: true,
    totalSavings: 45000, totalDonations: 18000,
  },
  {
    id: 'm2', memberId: 'INT-002', name: 'রহিমা খাতুন', phone: '01812-345678',
    role: 'user', initials: 'র', joinDate: '২০২৩-০২-২০',
    address: 'গুলশান-২, ঢাকা', gender: 'female', isActive: true,
    totalSavings: 32000, totalDonations: 12500,
  },
  {
    id: 'm3', memberId: 'INT-003', name: 'আবদুল রহমান', phone: '01913-456789',
    role: 'user', initials: 'আর', joinDate: '২০২৩-০৩-১০',
    address: 'মোহাম্মদপুর, ঢাকা', gender: 'male', isActive: true,
    totalSavings: 28000, totalDonations: 9500,
  },
  {
    id: 'm4', memberId: 'INT-004', name: 'সালেহা বেগম', phone: '01614-567890',
    role: 'user', initials: 'স', joinDate: '২০২৩-০৪-০৫',
    address: 'ধানমন্ডি, ঢাকা', gender: 'female', isActive: true,
    totalSavings: 21000, totalDonations: 15000,
  },
  {
    id: 'm5', memberId: 'INT-005', name: 'মো. করিম', phone: '01715-678901',
    role: 'user', initials: 'ম', joinDate: '২০২৩-০৫-১২',
    address: 'উত্তরা, ঢাকা', gender: 'male', isActive: true,
    totalSavings: 15000, totalDonations: 7500, activeLoan: 8000,
  },
  {
    id: 'm6', memberId: 'INT-006', name: 'নাসরিন আক্তার', phone: '01816-789012',
    role: 'user', initials: 'ন', joinDate: '২০২৩-০৬-২২',
    address: 'বনানী, ঢাকা', gender: 'female', isActive: true,
    totalSavings: 38000, totalDonations: 11000,
  },
  {
    id: 'm7', memberId: 'INT-007', name: 'ইব্রাহিম শেখ', phone: '01917-890123',
    role: 'user', initials: 'ই', joinDate: '২০২৩-০৭-০৮',
    address: 'যাত্রাবাড়ি, ঢাকা', gender: 'male', isActive: true,
    totalSavings: 9000, totalDonations: 5000, activeLoan: 20000,
  },
  {
    id: 'm8', memberId: 'INT-008', name: 'জান্নাতুন নিসা', phone: '01618-901234',
    role: 'user', initials: 'জ', joinDate: '২০২৩-০৮-১৫',
    address: 'রামপুরা, ঢাকা', gender: 'female', isActive: true,
    totalSavings: 52000, totalDonations: 20000,
  },
  {
    id: 'm9', memberId: 'INT-009', name: 'আমির হোসেন', phone: '01719-012345',
    role: 'user', initials: 'আহ', joinDate: '২০২৩-০৯-০৩',
    address: 'নারায়ণগঞ্জ', gender: 'male', isActive: true,
    totalSavings: 7000, totalDonations: 3500, activeLoan: 15000,
  },
  {
    id: 'm10', memberId: 'INT-010', name: 'রফিক আহমেদ', phone: '01820-123456',
    role: 'user', initials: 'র', joinDate: '২০২৩-১০-১৮',
    gender: 'male', isActive: false,
    totalSavings: 0, totalDonations: 0,
  },
];

export const CURRENT_ADMIN: Member = MEMBERS[0];
export const CURRENT_USER: Member = MEMBERS[1];
