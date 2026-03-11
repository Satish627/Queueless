import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';

export function ActiveQueueScreen() {
  return (
    <ScreenShell>
      <View>
        <Text style={{ fontSize: 24, fontWeight: '700' }}>Your active queue</Text>
        <Text style={{ marginTop: 6, color: '#4b5563' }}>
          Position and ETA will be shown here after join.
        </Text>
        <View style={{ marginTop: 18, gap: 10 }}>
          <Link href="/(customer)/queue/history" style={{ color: '#1d4ed8' }}>
            View history
          </Link>
          <Link href="/(customer)/home" style={{ color: '#1d4ed8' }}>
            Leave queue (demo)
          </Link>
        </View>
      </View>
    </ScreenShell>
  );
}
