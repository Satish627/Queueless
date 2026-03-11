import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';

export function HomeScreen() {
  return (
    <ScreenShell>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Nearby businesses</Text>
      <Text style={{ marginTop: 6, color: '#4b5563' }}>
        Browse active businesses and join their open queue.
      </Text>
      <Link href="/(customer)/businesses/placeholder-business" style={{ marginTop: 18, color: '#1d4ed8' }}>
        Open business page
      </Link>
    </ScreenShell>
  );
}
