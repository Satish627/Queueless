import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';
import { formatMinutes } from '@/lib/utils';
import { demoActions, useDemoStore } from '@/store';

export function ActiveQueueScreen() {
  const router = useRouter();
  const activeSession = useDemoStore((snapshot) => snapshot.activeSession);
  const isMutatingQueue = useDemoStore((snapshot) => snapshot.isMutatingQueue);
  const isSyncingActive = useDemoStore((snapshot) => snapshot.isSyncingActive);
  const lastError = useDemoStore((snapshot) => snapshot.lastError);

  if (!activeSession) {
    return (
      <ScreenShell>
        <View style={styles.container}>
          <Text style={styles.title}>No active queue</Text>
          <Text style={styles.subtitle}>
            You have not joined any queue yet. Browse businesses and join an open queue first.
          </Text>
          <Link href="/(customer)/home" style={styles.link}>
            Browse businesses
          </Link>
        </View>
      </ScreenShell>
    );
  }

  const isNext = activeSession.position <= 1;

  const handleLeaveQueue = async () => {
    const left = await demoActions.leaveQueue();
    if (left) {
      router.replace('/(customer)/home');
    }
  };

  return (
    <ScreenShell>
      <View style={styles.container}>
        <Text style={styles.title}>Your active queue</Text>
        <Text style={styles.subtitle}>
          {activeSession.businessName} · {activeSession.queueName}
        </Text>

        <View style={styles.statsCard}>
          <Text style={styles.statsValue}>#{activeSession.position}</Text>
          <Text style={styles.statsLabel}>Current position</Text>
          <Text style={styles.statsMeta}>
            Estimated wait: {formatMinutes(activeSession.estimatedWaitMinutes)}
          </Text>
          <Text style={styles.statsMeta}>
            Status: {isNext ? 'You are next' : activeSession.status}
          </Text>
        </View>

        {lastError ? <Text style={styles.errorText}>{lastError}</Text> : null}

        <View style={styles.buttonGroup}>
          <Pressable
            disabled={isSyncingActive}
            onPress={() => void demoActions.refreshActiveSession()}
            style={[styles.secondaryButton, isSyncingActive ? styles.buttonDisabled : null]}
          >
            <Text style={styles.secondaryButtonText}>
              {isSyncingActive ? 'Refreshing...' : 'Refresh queue position'}
            </Text>
          </Pressable>

          <Pressable
            disabled={isMutatingQueue}
            onPress={() => void handleLeaveQueue()}
            style={[styles.dangerButton, isMutatingQueue ? styles.buttonDisabled : null]}
          >
            <Text style={styles.dangerButtonText}>
              {isMutatingQueue ? 'Leaving...' : 'Leave queue'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.linkGroup}>
          <Link href="/(customer)/queue/history" style={styles.link}>
            Queue history
          </Link>
          <Link href="/(customer)/home" style={styles.link}>
            Back to businesses
          </Link>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    color: '#475569',
    fontWeight: '600',
  },
  statsCard: {
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    padding: 14,
    gap: 4,
  },
  statsValue: {
    color: '#1e3a8a',
    fontSize: 34,
    fontWeight: '800',
  },
  statsLabel: {
    color: '#1e40af',
    fontWeight: '600',
  },
  statsMeta: {
    color: '#1e40af',
  },
  errorText: {
    color: '#b91c1c',
  },
  buttonGroup: {
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#1d4ed8',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  secondaryButtonText: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  dangerButtonText: {
    color: '#dc2626',
    fontWeight: '600',
  },
  linkGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  link: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
});
