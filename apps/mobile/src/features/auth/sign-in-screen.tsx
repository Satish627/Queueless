import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';

export function SignInScreen() {
  return (
    <ScreenShell>
      <View>
        <Text style={{ fontSize: 28, fontWeight: '700' }}>QueueLess</Text>
        <Text style={{ marginTop: 8, color: '#4b5563' }}>
          Sign in to manage your queue experience.
        </Text>
        <Link href="/(auth)/sign-up" style={{ marginTop: 18, color: '#1d4ed8' }}>
          No account yet? Create one
        </Link>
      </View>
    </ScreenShell>
  );
}
