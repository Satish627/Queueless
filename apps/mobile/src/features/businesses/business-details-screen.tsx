import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';
import { formatMinutes } from '@/lib/utils';
import { demoActions, useDemoStore } from '@/store';

export function BusinessDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const businessId = typeof id === 'string' ? id : '';
  const profile = useDemoStore((snapshot) => snapshot.profile);
  const businesses = useDemoStore((snapshot) => snapshot.businesses);
  const queues = useDemoStore((snapshot) => snapshot.queues);
  const queueLoads = useDemoStore((snapshot) => snapshot.queueLoads);
  const activeSession = useDemoStore((snapshot) => snapshot.activeSession);
  const isMutatingQueue = useDemoStore((snapshot) => snapshot.isMutatingQueue);
  const [displayName, setDisplayName] = useState(profile.fullName);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void demoActions.bootstrap();
  }, []);

  const business = useMemo(
    () => businesses.find((item) => item.id === businessId),
    [businessId, businesses],
  );
  const queue = useMemo(
    () => queues.find((item) => item.business_id === businessId),
    [businessId, queues],
  );

  if (!business || !queue) {
    return (
      <ScreenShell>
        <View style={styles.container}>
          <Text style={styles.title}>Business not found</Text>
          <Text style={styles.subtitle}>This business is unavailable or still loading.</Text>
          <Link href="/(customer)/home" style={styles.link}>
            Back to businesses
          </Link>
        </View>
      </ScreenShell>
    );
  }

  const queueLoad = queueLoads[queue.id] ?? 0;
  const estimatedWait = queueLoad * queue.avg_service_minutes;

  const handleJoinQueue = async () => {
    setError(null);
    const trimmedName = displayName.trim();

    if (!trimmedName) {
      setError('Please enter a display name.');
      return;
    }

    const result = await demoActions.joinQueue({
      businessId,
      displayName: trimmedName,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push('/(customer)/queue/active');
  };

  return (
    <ScreenShell>
      <View style={styles.container}>
        <Text style={styles.title}>{business.name}</Text>
        <Text style={styles.subtitle}>
          {business.category} · {business.city}
        </Text>
        <Text style={styles.metaText}>{business.address}</Text>
        <Text style={styles.metaText}>{business.description}</Text>

        <View style={styles.queueCard}>
          <Text style={styles.queueTitle}>Queue status: {queue.status.toUpperCase()}</Text>
          <Text style={styles.metaText}>Current waiting: {queueLoad}</Text>
          <Text style={styles.metaText}>Average service: {queue.avg_service_minutes} min</Text>
          <Text style={styles.metaText}>Estimated wait: {formatMinutes(estimatedWait)}</Text>
        </View>

        {activeSession?.businessId === business.id ? (
          <View style={styles.queueCard}>
            <Text style={styles.queueTitle}>You already joined this queue.</Text>
            <Link href="/(customer)/queue/active" style={styles.link}>
              Open active queue
            </Link>
          </View>
        ) : (
          <View style={styles.joinSection}>
            <Text style={styles.label}>Display name</Text>
            <TextInput
              onChangeText={setDisplayName}
              placeholder="Name shown to staff"
              placeholderTextColor="#94a3b8"
              style={styles.input}
              value={displayName}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              disabled={queue.status !== 'open' || isMutatingQueue}
              onPress={() => void handleJoinQueue()}
              style={[
                styles.button,
                queue.status !== 'open' || isMutatingQueue ? styles.buttonDisabled : null,
              ]}
            >
              <Text style={styles.buttonText}>
                {queue.status === 'open'
                  ? isMutatingQueue
                    ? 'Joining...'
                    : 'Join queue'
                  : 'Queue is closed'}
              </Text>
            </Pressable>
          </View>
        )}

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
    fontWeight: '600',
  },
  metaText: {
    color: '#475569',
  },
  queueCard: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 12,
    gap: 4,
  },
  queueTitle: {
    color: '#0f172a',
    fontWeight: '700',
  },
  joinSection: {
    gap: 8,
    marginTop: 6,
  },
  label: {
    color: '#334155',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0f172a',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
  },
  button: {
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  linkGroup: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 16,
  },
  link: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
});
