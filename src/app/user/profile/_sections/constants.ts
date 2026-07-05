import type { ProfilePreference } from './types';

export const PROFILE_PREFERENCES: ProfilePreference[] = [
  { id: 'sms', label: 'এসএমএস নোটিফিকেশন', description: 'লেনদেন আপডেট মোবাইলে' },
  { id: 'email', label: 'ইমেইল সারাংশ', description: 'সাপ্তাহিক আর্থিক রিপোর্ট' },
  { id: 'alerts', label: 'ঋণ রিমাইন্ডার', description: 'কিস্তির আগে স্মরণ করিয়ে দেয়' },
];
