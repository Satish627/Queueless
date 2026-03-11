import { Link, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';

export function BusinessDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <ScreenShell>
      <View>
        <Text style={{ fontSize: 24, fontWeight: '700' }}>Business details</Text>
        <Text style={{ marginTop: 6, color: '#4b5563' }}>Business id: {id ?? 'unknown'}</Text>
        <Link href="/(customer)/queue/active" style={{ marginTop: 18, color: '#1d4ed8' }}>
          Join queue
        </Link>
      </View>
    </ScreenShell>
  );
}
