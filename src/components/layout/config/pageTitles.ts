export const ADMIN_PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'ড্যাশবোর্ড',
  '/admin/members': 'সদস্য তালিকা',
  '/admin/loans': 'ঋণ বিতরণ',
  '/admin/loan-repayment': 'ঋণ ফেরত',
  '/admin/fund-collection': 'ফান্ড / কালেকশন',
  '/admin/categories': 'খাত পরিচালনা',
  '/admin/reports': 'প্রতিবেদন',
  '/admin/roles-permissions': 'ভূমিকা ও অনুমতি',
};

export const USER_PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  '/user/dashboard': { title: 'আমার ড্যাশবোর্ড', subtitle: 'আপনার আর্থিক সারাংশ' },
  '/user/donations': { title: 'দান করুন', subtitle: 'আপনার দানের হিসাব' },
  '/user/savings': { title: 'সঞ্চয়', subtitle: 'আপনার সঞ্চয়ের বিবরণ' },
  '/user/loan': { title: 'ঋণ', subtitle: 'ঋণ ও কিস্তির তথ্য' },
  '/user/transactions': { title: 'লেনদেন', subtitle: 'সব লেনদেনের ইতিহাস' },
  '/user/categories': { title: 'খাতসূচি', subtitle: 'সকল খাতের বিবরণ' },
  '/user/expenses': { title: 'খরচের হিসাব', subtitle: 'ব্যক্তিগত ব্যয়ের বিবরণ' },
  '/user/comments': { title: 'মন্তব্য', subtitle: 'যোগাযোগ ও মন্তব্য' },
  '/user/profile': { title: 'প্রোফাইল', subtitle: 'আপনার তথ্য পরিচালনা' },
};
