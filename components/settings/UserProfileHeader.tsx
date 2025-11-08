'use client';

import {
  ChevronDown,
  ChevronRight,
  Copy,
  Share2,
  ShieldCheck,
  VerifiedIcon,
} from 'lucide-react';
import Avater from '@/public/assets/avater/avater5.png';
import Image from 'next/image';
import { useUserStore } from '@/stores/currentUserStore';
import { useState } from 'react';

export const UserProfileHeader = () => {
  const currentUser = useUserStore((state) => state.user);
  console.log(currentUser);
  const accountDetails = [
    {
      id: currentUser?.bankCode,
      bankName: '9PSB',
      accountNumber: currentUser?.bank,
      status: true,
    },
    {
      id: currentUser?.accountNumber2Id,
      bankName: 'SafeHeaven',
      accountNumber: currentUser?.accountNumber2,
      status: currentUser?.accountNumber2Status === 0 ? false : true,
    },
  ];

  const validAccounts = accountDetails.filter((acc) => acc.status);
  const [selectedAccount, setSelectedAccount] = useState(
    validAccounts.length > 0 ? validAccounts[0] : null
  );
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- Copy function ---
  const handleCopy = () => {
    if (!selectedAccount?.accountNumber) return;
    navigator.clipboard.writeText(selectedAccount.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Share function ---
  const handleShare = async () => {
    if (!selectedAccount) return;
    const shareText = `Bank: ${selectedAccount.bankName}\nAccount Number: ${selectedAccount.accountNumber}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Bank Account Details',
          text: shareText,
        });
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // fallback: copy if sharing isn't supported
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className='flex flex-col md:flex-row items-center md:items-start gap-6 bg-white py-10.5 rounded-3xl border border-gray-100'>
      {/* Avatar + Info */}
      <div className='max-w-[785px] w-full mx-auto flex flex-col gap-10  justify-center lg:px-0 px-4'>
        <div className='flex lg:justify-between flex-col lg:flex-row items-center lg:gap-0 gap-3'>
          <div className='flex gap-10 items-center lg:flex-row flex-col lg:justify-start justify-center'>
            <Image
              src={Avater}
              alt='User Avatar'
              className='w-24 h-24 rounded-full object-cover'
            />
            <div className='flex flex-col gap-2 lg:justify-start justify-center lg:text-start text-center'>
              <h2 className='lg:text-2xl text-xl text-[#07052A] font-bold font-sora'>
                {currentUser?.firstName} {''} {currentUser?.lastName}
              </h2>
              <p className='text-[#B4ACCA] font-normal text-sm font-inter'>
                @{currentUser?.username}
              </p>

              <span className='flex lg:items-center items-start lg:justify-start justify-center gap-1 font-normal text-[#474256] px-3 py-1 rounded-full mt-3 text-xs font-inter'>
                <ShieldCheck className='text-[#018BEF]' />{' '}
                <span>Tier {currentUser?.tier}</span>
              </span>
            </div>
          </div>

          <button className='ml-5 bg-[#FA92321A] text-[#474256] h-[50px] gap-4 font-inter font-semibold px-[8px] rounded-full text-sm w-full max-w-[142px] flex justify-center items-center'>
            <span>Upgrade</span> <ChevronRight />
          </button>
        </div>

        {/* Account Info */}
        <div className='flex items-center lg:gap-8  gap-3 justify-center  relative'>
          {/* Dropdown */}
          <div
            onClick={() => setOpen(!open)}
            className='text-start bg-[#FAF7FF] -ml-5 py-2.5 px-4 rounded-[8px] flex items-center gap-4 cursor-pointer relative'
          >
            <div className='flex flex-col gap-3'>
              <p className='text-xs text-[#B4ACCA] font-normal font-inter'>
                {selectedAccount?.bankName}
              </p>
              <p className='text-base font-inter text-[#474256] font-semibold mt-1'>
                {selectedAccount?.accountNumber}
              </p>
            </div>

            <ChevronDown
              className={`transition-transform duration-200 ${
                open ? 'rotate-180' : ''
              }`}
            />

            {open && (
              <div className='absolute top-[105%] left-0 w-full bg-white shadow-md rounded-[8px] border border-gray-100 z-10'>
                {validAccounts.map((account) => (
                  <div
                    key={account.id}
                    onClick={() => {
                      setSelectedAccount(account);
                      setOpen(false);
                    }}
                    className='px-4 py-2.5 hover:bg-[#FAF7FF] cursor-pointer rounded-[8px]'
                  >
                    <p className='text-xs text-[#B4ACCA] font-normal font-inter'>
                      {account.bankName}
                    </p>
                    <p className='text-base font-inter text-[#474256] font-semibold mt-1'>
                      {account.accountNumber}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Copy / Share buttons */}
          <div className='flex gap-6'>
            <button
              onClick={handleCopy}
              className='p-2 bg-[#D70D4A] h-[60px] cursor-pointer w-[60px] text-white rounded-lg flex justify-center items-center relative'
            >
              <Copy size={20} />
              {copied && (
                <span className='absolute -bottom-6 text-[11px] text-[#D70D4A] font-medium'>
                  Copied!
                </span>
              )}
            </button>

            <button
              onClick={handleShare}
              className='p-2 bg-[#D70D4A] h-[60px] cursor-pointer w-[60px] text-white rounded-lg flex justify-center items-center'
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
