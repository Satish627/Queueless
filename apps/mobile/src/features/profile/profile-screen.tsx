import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';
import { demoActions, useDemoStore } from '@/store';

export function ProfileScreen() {
  const profile = useDemoStore((snapshot) => snapshot.profile);
  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = () => {
    const normalizedName = fullName.trim();
    if (!normalizedName) {
      setMessage('Full name is required.');
      return;
    }

    demoActions.updateProfile({
      fullName: normalizedName,
      phone: phone.trim(),
    });
    setMessage('Profile updated in preview mode.');
  };

  return (
    <ScreenShell>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Basic profile details for queue participation.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            onChangeText={setFullName}
            placeholder="Your name"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={fullName}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            editable={false}
            style={[styles.input, styles.inputReadonly]}
            value={profile.email}
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            keyboardType="phone-pad"
            onChangeText={setPhone}
            placeholder="+45 00 00 00 00"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={phone}
          />

          <Pressable onPress={handleSave} style={styles.button}>
            <Text style={styles.buttonText}>Save profile</Text>
          </Pressable>

          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>

        <View style={styles.linkGroup}>
          <Link href="/(customer)/home" style={styles.link}>
            Back to businesses
          </Link>
          <Link href="/(customer)/queue/history" style={styles.link}>
            Queue history
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
  },
  form: {
    gap: 8,
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
  inputReadonly: {
    opacity: 0.7,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  message: {
    color: '#334155',
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
