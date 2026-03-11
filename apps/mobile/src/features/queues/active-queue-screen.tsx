import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';
import { formatMinutes } from '@/lib/utils';
import { demoActions, useDemoStore } from '@/store';

export function ActiveQueueScreen() {
  const activeSession = useDemoStore((snapshot) => snapshot.activeSession);

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

  const isNext = activeSession.entry.position <= 1;

  return (
    <ScreenShell>
      <View style={styles.container}>
        <Text style={styles.title}>Your active queue</Text>
        <Text style={styles.subtitle}>
          {activeSession.business.name} · {activeSession.queue.name}
        </Text>

        <View style={styles.statsCard}>
          <Text style={styles.statsValue}>#{activeSession.entry.position}</Text>
          <Text style={styles.statsLabel}>Current position</Text>
          <Text style={styles.statsMeta}>
            Estimated wait: {formatMinutes(activeSession.estimatedWaitMinutes)}
          </Text>
          <Text style={styles.statsMeta}>
            Status: {isNext ? 'You are next' : 'Waiting in queue'}
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          <Pressable onPress={demoActions.stepQueueForward} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Refresh queue position</Text>
          </Pressable>
          <Pressable
            onPress={() => demoActions.completeActiveQueue('served')}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Mark served (demo)</Text>
          </Pressable>
          <Pressable onPress={demoActions.leaveQueue} style={styles.dangerButton}>
            <Text style={styles.dangerButtonText}>Leave queue</Text>
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
  buttonGroup: {
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
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
