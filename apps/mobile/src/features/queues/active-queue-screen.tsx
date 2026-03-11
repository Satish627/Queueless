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
        <Link href="/(customer)/queue/history" style={{ marginTop: 18, color: '#1d4ed8' }}>
          View history
        </Link>
      </View>
    </ScreenShell>
  );
}
