'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import React from 'react';

export const SettingsCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  const router = useRouter();
  const pathname = usePathname(); // current route e.g. /dashboard/settings
  const searchParams = useSearchParams();

  const handleClick = () => {
    const tabParam = title.toLowerCase().replace(/\s+/g, '-');

    // Preserve other existing params (if any)
    const params = new URLSearchParams(searchParams);
    params.set('sub', tabParam);

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div
      onClick={handleClick}
      className='flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all cursor-pointer'
    >
      <div className='flex items-center gap-3'>
        <div className='p-2 bg-gray-50 rounded-xl'>{icon}</div>
        <div>
          <h3 className='font-medium text-gray-800'>{title}</h3>
          <p className='text-sm text-gray-500'>{description}</p>
        </div>
      </div>
      <span className='text-gray-400 text-sm'>›</span>
    </div>
  );
};
