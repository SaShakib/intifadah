import type { CommentThread } from './types';

export const COMMENT_THREADS: CommentThread[] = [
  {
    id: 'th-1',
    subject: 'সঞ্চয় এন্ট্রি যাচাই',
    lastMessage: 'আপনার মে মাসের সঞ্চয় এন্ট্রি যাচাই করা হয়েছে।',
    status: 'answered',
    date: '১৪ জুন ২০২৬',
  },
  {
    id: 'th-2',
    subject: 'ঋণ কিস্তির তারিখ পরিবর্তন',
    lastMessage: 'এই অনুরোধটি পর্যালোচনাধীন আছে।',
    status: 'pending',
    date: '১১ জুন ২০২৬',
  },
  {
    id: 'th-3',
    subject: 'দানের রসিদ প্রয়োজন',
    lastMessage: 'রসিদ PDF ডাউনলোড লিংক পাঠানো হয়েছে।',
    status: 'answered',
    date: '০৭ জুন ২০২৬',
  },
];

export const COMMENT_FAQ_ROWS = [
  ['উত্তর পেতে কত সময় লাগে?', 'সাধারণত ২৪ ঘন্টার মধ্যে উত্তর দেওয়া হয়।'],
  ['ফাইল সংযুক্তি দেওয়া যাবে?', 'হ্যাঁ, প্রোফাইল থেকে সাপোর্টে পাঠাতে পারবেন।'],
  ['ঋণ সংক্রান্ত অনুরোধ কোথায়?', 'মন্তব্যে বিষয় হিসেবে ঋণ নির্বাচন করুন।'],
];
