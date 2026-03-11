import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';

export function SignUpScreen() {
  return (
    <ScreenShell>
      <View>
        <Text style={{ fontSize: 28, fontWeight: '700' }}>Create account</Text>
        <Text style={{ marginTop: 8, color: '#4b5563' }}>
          Sign up to join and track business queues remotely.
        </Text>
        <Link href="/(auth)/sign-in" style={{ marginTop: 18, color: '#1d4ed8' }}>
          Already have an account? Sign in
        </Link>
      </View>
    </ScreenShell>
  );
}
