// etc...
'use client';
import NotificationTab from '@/components/settings/notificationTab';
import ProfileTab from '@/components/settings/ProfileTab';
import Security from '@/components/settings/Security';
import SettingsLayout from '@/components/settings/SettingsLayout';
import { useSearchParams } from 'next/navigation';

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'Profile';

  return (
    <SettingsLayout>
      {tab === 'Profile' && <ProfileTab />}
      {tab === 'Notification' && <NotificationTab />}

      {tab === 'Security' && <Security />}
      {/* add others */}
    </SettingsLayout>
  );
}
