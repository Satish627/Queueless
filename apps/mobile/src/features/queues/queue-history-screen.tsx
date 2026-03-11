import { Text } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';

export function QueueHistoryScreen() {
  return (
    <ScreenShell>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Queue history</Text>
      <Text style={{ marginTop: 6, color: '#4b5563' }}>
        Completed and cancelled queue sessions will appear here.
      </Text>
    </ScreenShell>
  );
}
