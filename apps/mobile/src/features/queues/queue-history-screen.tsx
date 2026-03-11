import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';
import { useDemoStore } from '@/store';

export function QueueHistoryScreen() {
  const history = useDemoStore((snapshot) => snapshot.history);

  return (
    <ScreenShell>
      <View style={styles.container}>
        <Text style={styles.title}>Queue history</Text>
        <Text style={styles.subtitle}>Completed and cancelled queue sessions.</Text>

        <View style={styles.list}>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>No queue history yet.</Text>
          ) : (
            history.map((item) => (
              <View key={item.id} style={styles.historyCard}>
                <Text style={styles.historyTitle}>{item.businessName}</Text>
                <Text style={styles.historyMeta}>{item.queueName}</Text>
                <Text style={styles.historyMeta}>Name used: {item.displayName}</Text>
                <Text style={styles.historyMeta}>Status: {item.status.replace('_', ' ')}</Text>
                <Text style={styles.historyMeta}>
                  Completed: {new Date(item.completedAt).toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.linkGroup}>
          <Link href="/(customer)/queue/active" style={styles.link}>
            Active queue
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
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    color: '#475569',
  },
  list: {
    gap: 10,
    marginTop: 4,
  },
  emptyText: {
    color: '#64748b',
  },
  historyCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 12,
    gap: 3,
  },
  historyTitle: {
    color: '#0f172a',
    fontWeight: '700',
  },
  historyMeta: {
    color: '#475569',
  },
  linkGroup: {
    marginTop: 6,
    flexDirection: 'row',
    gap: 16,
  },
  link: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
});
