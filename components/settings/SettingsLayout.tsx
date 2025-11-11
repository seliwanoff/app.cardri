'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = ['Profile', 'Security', 'Notification', 'Support'];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || '';

  const handleTabChange = (tab: string) => {
    router.push(`/dashboard/settings?${tab !== 'Profile' ? `tab=${tab}` : ''}`);
  };

  return (
    <div className='w-full min-h-screen mt-4'>
      {/* Top Tabs */}
      <div
        className='w-full bg-white rounded-xl'
        style={{
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        <div
          className='max-w-5xl mx-auto flex items-center gap-8 p-4 overflow-x-auto w-full'
          style={{
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={cn(
                'text-sm font-bold transition-all py-3 px-6 cursor-pointer rounded-[8px]',
                activeTab === tab
                  ? 'bg-[#FAF7FF] text-[#1B1B1B]'
                  : 'text-[#B4ACCA] hover:text-black'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className='mx-auto  pt-6 mt-4 pb-10 rounded-2xl'>{children}</div>
    </div>
  );
}
