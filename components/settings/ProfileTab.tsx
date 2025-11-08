'use client';

import { User, ShieldCheck, FileText, Lock, HelpCircle } from 'lucide-react';
import { UserProfileHeader } from './UserProfileHeader';
import { SettingsCard } from './SettingsCard';
import { DeleteAccountButton } from './DeleteAccountButton';

export default function ProfileTab() {
  return (
    <div className='flex flex-col gap-10'>
      {/* Top Profile Card */}
      <UserProfileHeader />

      {/* Settings Options */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[785px] mx-auto'>
        <SettingsCard
          icon={<User className='text-pink-500' />}
          title='Account Settings'
          description='Manage my account details'
        />
        <SettingsCard
          icon={<ShieldCheck className='text-yellow-500' />}
          title='Account Verification'
          description='BVN Verification'
        />
        <SettingsCard
          icon={<FileText className='text-blue-500' />}
          title='Terms of Use'
          description='About our contract with you'
        />
        <SettingsCard
          icon={<Lock className='text-green-500' />}
          title='Privacy Policy'
          description='Check the privacy policies'
        />
        <SettingsCard
          icon={<HelpCircle className='text-purple-500' />}
          title='Support'
          description='You can ask questions here'
        />
      </div>

      {/* Delete Account */}

      <DeleteAccountButton />
    </div>
  );
}
