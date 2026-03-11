import { Link, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';
import { formatMinutes } from '@/lib/utils';
import { demoActions, useDemoStore } from '@/store';

export function HomeScreen() {
  const [query, setQuery] = useState('');
  const businesses = useDemoStore((snapshot) => snapshot.businesses);
  const queues = useDemoStore((snapshot) => snapshot.queues);
  const queueLoads = useDemoStore((snapshot) => snapshot.queueLoads);
  const activeSession = useDemoStore((snapshot) => snapshot.activeSession);
  const isLoadingBusinesses = useDemoStore((snapshot) => snapshot.isLoadingBusinesses);
  const lastError = useDemoStore((snapshot) => snapshot.lastError);

  useEffect(() => {
    void demoActions.bootstrap();
  }, []);

  const filteredBusinesses = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return businesses;
    }

    return businesses.filter((business) => {
      return (
        business.name.toLowerCase().includes(normalized) ||
        business.city.toLowerCase().includes(normalized) ||
        business.category.toLowerCase().includes(normalized)
      );
    });
  }, [businesses, query]);

  return (
    <ScreenShell>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Nearby businesses</Text>
          <Text style={styles.subtitle}>
            Browse active businesses, check queue status, and join remotely.
          </Text>
        </View>

        <TextInput
          onChangeText={setQuery}
          placeholder="Search by name, city, or category"
          placeholderTextColor="#94a3b8"
          style={styles.searchInput}
          value={query}
        />

        {activeSession ? (
          <View style={styles.activeBanner}>
            <Text style={styles.activeBannerTitle}>Active queue: {activeSession.businessName}</Text>
            <Text style={styles.activeBannerText}>
              Position #{activeSession.position}, ETA{' '}
              {formatMinutes(activeSession.estimatedWaitMinutes)}
            </Text>
            <Link href="/(customer)/queue/active" style={styles.inlineLink}>
              Open active queue
            </Link>
          </View>
        ) : null}

        {lastError ? <Text style={styles.errorText}>{lastError}</Text> : null}

        <View style={styles.businessList}>
          {isLoadingBusinesses ? (
            <Text style={styles.loadingText}>Loading businesses...</Text>
          ) : filteredBusinesses.length === 0 ? (
            <Text style={styles.loadingText}>No matching businesses found.</Text>
          ) : (
            filteredBusinesses.map((business) => {
              const queue = queues.find((item) => item.business_id === business.id);
              const queueLoad = queue ? (queueLoads[queue.id] ?? 0) : 0;
              const estimatedWait = queue ? queueLoad * queue.avg_service_minutes : 0;

              return (
                <View key={business.id} style={styles.businessCard}>
                  <Text style={styles.businessName}>{business.name}</Text>
                  <Text style={styles.businessMeta}>
                    {business.category} · {business.city}
                  </Text>
                  <Text style={styles.businessMeta}>
                    Queue: {queue?.status === 'open' ? 'Open' : 'Closed'}
                  </Text>
                  <Text style={styles.businessMeta}>
                    Estimated wait: {formatMinutes(estimatedWait)}
                  </Text>
                  <Link
                    href={
                      {
                        pathname: '/(customer)/businesses/[id]',
                        params: { id: business.id },
                      } as Href
                    }
                    style={styles.inlineLink}
                  >
                    View details
                  </Link>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.footerLinks}>
          <Link href="/(customer)/queue/history" style={styles.inlineLink}>
            Queue history
          </Link>
          <Link href="/(customer)/profile" style={styles.inlineLink}>
            Profile
          </Link>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    color: '#475569',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0f172a',
  },
  activeBanner: {
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    padding: 12,
    gap: 4,
  },
  activeBannerTitle: {
    fontWeight: '700',
    color: '#1e3a8a',
  },
  activeBannerText: {
    color: '#1e40af',
  },
  errorText: {
    color: '#b91c1c',
  },
  loadingText: {
    color: '#475569',
  },
  businessList: {
    gap: 10,
  },
  businessCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  businessName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  businessMeta: {
    color: '#475569',
  },
  inlineLink: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 16,
  },
});
