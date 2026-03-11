import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';

export function HomeScreen() {
  return (
    <ScreenShell>
      <View>
        <Text style={{ fontSize: 24, fontWeight: '700' }}>Nearby businesses</Text>
        <Text style={{ marginTop: 6, color: '#4b5563' }}>
          Browse active businesses and join their open queue.
        </Text>

        <View style={{ marginTop: 18, gap: 10 }}>
          <Link href="/(customer)/businesses/placeholder-business" style={{ color: '#1d4ed8' }}>
            Open business page
          </Link>
          <Link href="/(customer)/queue/active" style={{ color: '#1d4ed8' }}>
            Go to active queue
          </Link>
          <Link href="/(customer)/profile" style={{ color: '#1d4ed8' }}>
            Open profile
          </Link>
        </View>
      </View>
    </ScreenShell>
  );
}
