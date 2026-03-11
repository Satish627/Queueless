import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';

export function ProfileScreen() {
  return (
    <ScreenShell>
      <View>
        <Text style={{ fontSize: 24, fontWeight: '700' }}>Profile</Text>
        <Text style={{ marginTop: 6, color: '#4b5563' }}>
          Basic profile settings and account controls.
        </Text>
        <View style={{ marginTop: 18, gap: 10 }}>
          <Link href="/(customer)/home" style={{ color: '#1d4ed8' }}>
            Back to businesses
          </Link>
        </View>
      </View>
    </ScreenShell>
  );
}
