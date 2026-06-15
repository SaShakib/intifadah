import type { Category } from '@/types';

export const CATEGORIES: Category[] = [
  {
    id: 'c1', name: 'সাপ্তাহিক চাঁদা', type: 'donation',
    description: 'প্রতি সপ্তাহে নির্ধারিত পরিমাণ চাঁদা। সকল সদস্যের জন্য বাধ্যতামূলক।',
    recurrence: 'weekly', amount: 200, isVariable: false, isActive: true,
  },
  {
    id: 'c2', name: 'ব্যক্তিগত সঞ্চয়', type: 'savings',
    description: 'প্রতি মাসে ব্যক্তিগত সঞ্চয় জমা দিন। পরিমাণ নিজে নির্ধারণ করতে পারবেন।',
    recurrence: 'monthly', isVariable: true, isActive: true,
  },
  {
    id: 'c3', name: 'কর্যে হাসানাঃ (ঋণ)', type: 'loan',
    description: 'সুদমুক্ত ঋণ সুবিধা। প্রয়োজনে সংগঠনের মাধ্যমে ঋণ নিন এবং কিস্তিতে ফেরত দিন।',
    recurrence: 'one_time', isVariable: true, isActive: true,
  },
  {
    id: 'c4', name: 'দান তহবিল', type: 'donation',
    description: 'স্বেচ্ছায় দান করুন। বিশেষ উপলক্ষে বা যেকোনো সময় দান করা যাবে।',
    recurrence: 'one_time', isVariable: true, isActive: true,
  },
  {
    id: 'c5', name: 'বার্ষিক চাঁদা', type: 'donation',
    description: 'বছরে একবার বার্ষিক চাঁদা প্রদান। সংগঠনের বার্ষিক অনুষ্ঠানের জন্য।',
    recurrence: 'yearly', amount: 1000, isVariable: false, isActive: true,
  },
  {
    id: 'c6', name: 'প্রশিক্ষণ তহবিল', type: 'expense',
    description: 'সদস্যদের দক্ষতা উন্নয়ন প্রশিক্ষণের জন্য বরাদ্দ।',
    recurrence: 'monthly', amount: 5000, isVariable: false, isActive: false,
  },
];
