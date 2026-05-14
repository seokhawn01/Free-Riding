'use client';

import { Home, PlusCircle, CreditCard, BarChart2 } from 'lucide-react';

export type TabName = 'home' | 'recording' | 'card' | 'report';

interface BottomNavProps {
  activeTab: TabName;
  onTabPress?: (tab: TabName) => void;
}

const tabs: { name: TabName; label: string; Icon: React.ElementType }[] = [
  { name: 'home', label: '홈', Icon: Home },
  { name: 'recording', label: '녹음', Icon: PlusCircle },
  { name: 'card', label: '카드', Icon: CreditCard },
  { name: 'report', label: '리포트', Icon: BarChart2 },
];

export default function BottomNav({ activeTab, onTabPress }: BottomNavProps) {
  return (
    <nav className="flex border-t-2 border-[#7b2fbe] bg-white h-[82px]">
      {tabs.map(({ name, label, Icon }) => {
        const active = activeTab === name;
        return (
          <button
            key={name}
            onClick={() => onTabPress?.(name)}
            className="flex flex-1 flex-col items-center justify-center gap-1 cursor-pointer"
          >
            <Icon
              size={28}
              className={active ? 'text-[#7b2fbe]' : 'text-[#1c1a1c]'}
              strokeWidth={active ? 2.5 : 1.5}
            />
            <span
              className={`text-xs ${active ? 'text-[#7b2fbe]' : 'text-[#1c1a1c]'}`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
