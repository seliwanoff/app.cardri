'use client';

import { User, ShieldCheck, FileText, Lock, HelpCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { UserProfileHeader } from './UserProfileHeader';
import { SettingsCard } from './SettingsCard';
import { DeleteAccountButton } from './DeleteAccountButton';
import { useMemo } from 'react';
import ProfileForm from './tabs/profileForm';
//import VerificationTab from './tabs/VerificationTab';
//import TermsTab from './tabs/TermsTab';
//import PrivacyTab from './tabs/PrivacyTab';
//import SupportTab from './tabs/SupportTab';

export default function ProfileTab() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('sub');

  const renderTabContent = useMemo(() => {
    switch (currentTab) {
      case 'account-settings':
        return <ProfileForm />;
      case 'account-verification':
      // return <VerificationTab />;
      case 'terms-of-use':
      // return <TermsTab />;
      case 'privacy-policy':
      // return <PrivacyTab />;
      case 'support':
      // return <SupportTab />;
      default:
        return null;
    }
  }, [currentTab]);

  return (
    <div className='flex flex-col gap-10 bg-white px-6 pt-6 rounded-2xl'>
      {/* Top Profile Card */}
      {!currentTab && <UserProfileHeader />}

      {currentTab ? (
        <div className=''>{renderTabContent}</div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
