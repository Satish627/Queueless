import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';

export function QueueHistoryScreen() {
  return (
    <ScreenShell>
      <View>
        <Text style={{ fontSize: 24, fontWeight: '700' }}>Queue history</Text>
        <Text style={{ marginTop: 6, color: '#4b5563' }}>
          Completed and cancelled queue sessions will appear here.
        </Text>
        <View style={{ marginTop: 18, gap: 10 }}>
          <Link href="/(customer)/queue/active" style={{ color: '#1d4ed8' }}>
            Back to active queue
          </Link>
          <Link href="/(customer)/home" style={{ color: '#1d4ed8' }}>
            Back to businesses
          </Link>
        </View>
      </View>
    </ScreenShell>
  );
}
