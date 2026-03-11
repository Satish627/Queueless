import { Text } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';

export function ProfileScreen() {
  return (
    <ScreenShell>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Profile</Text>
      <Text style={{ marginTop: 6, color: '#4b5563' }}>Basic profile settings and account controls.</Text>
    </ScreenShell>
  );
}
