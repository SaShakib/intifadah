import {
  ArrowLeftRight,
  BookOpenCheck,
  ChartNoAxesCombined,
  CircleDollarSign,
  CircleUserRound,
  HandCoins,
  HeartHandshake,
  LayoutDashboard,
  ListFilter,
  LockKeyhole,
  MessageSquareText,
  ReceiptText,
  RotateCcw,
  Settings,
  Users,
  WalletCards,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const ICONS: Record<string, IconComponent> = {
  'arrow-left-right': ArrowLeftRight,
  'book-open-check': BookOpenCheck,
  'chart-no-axes-combined': ChartNoAxesCombined,
  'circle-dollar-sign': CircleDollarSign,
  'circle-user-round': CircleUserRound,
  'hand-coins': HandCoins,
  'heart-handshake': HeartHandshake,
  'layout-dashboard': LayoutDashboard,
  'list-filter': ListFilter,
  'lock-keyhole': LockKeyhole,
  'message-square-text': MessageSquareText,
  'receipt-text': ReceiptText,
  'rotate-ccw': RotateCcw,
  settings: Settings,
  users: Users,
  'wallet-cards': WalletCards,
};

export function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? LayoutDashboard;
  return <Icon className={className} aria-hidden="true" />;
}
