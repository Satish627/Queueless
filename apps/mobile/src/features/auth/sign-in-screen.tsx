import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { authSignInSchema } from '@queueless/validation';

import { ScreenShell } from '@/components/screen-shell';

export function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length > 0,
    [email, password],
  );

  const handleSubmit = () => {
    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    const parsed = authSignInSchema.safeParse({
      email: email.trim(),
      password,
    });

    if (!parsed.success) {
      const nextFieldErrors: { email?: string; password?: string } = {};
      const parsedFieldErrors = parsed.error.flatten().fieldErrors;

      if (parsedFieldErrors.email?.[0]) {
        nextFieldErrors.email = parsedFieldErrors.email[0];
      }

      if (parsedFieldErrors.password?.[0]) {
        nextFieldErrors.password = parsedFieldErrors.password[0];
      }

      setFieldErrors(nextFieldErrors);
      setFormError('Please fix the highlighted fields.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setFormError('Form validated. Supabase auth wiring is the next step.');
  };

  return (
    <ScreenShell>
      <View style={styles.container}>
        <Text style={styles.title}>QueueLess</Text>
        <Text style={styles.subtitle}>Sign in to manage your queue experience.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#94a3b8"
            style={[styles.input, fieldErrors.email ? styles.inputError : null]}
            value={email}
          />
          {fieldErrors.email ? <Text style={styles.errorText}>{fieldErrors.email}</Text> : null}

          <Text style={styles.label}>Password</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="password"
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            style={[styles.input, fieldErrors.password ? styles.inputError : null]}
            value={password}
          />
          {fieldErrors.password ? (
            <Text style={styles.errorText}>{fieldErrors.password}</Text>
          ) : null}

          {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

          <Pressable
            disabled={!canSubmit || isSubmitting}
            onPress={handleSubmit}
            style={[styles.button, !canSubmit || isSubmitting ? styles.buttonDisabled : null]}
          >
            <Text style={styles.buttonText}>{isSubmitting ? 'Signing in...' : 'Sign in'}</Text>
          </Pressable>
        </View>

        <Link href="/(auth)/sign-up" style={styles.link}>
          No account yet? Create one
        </Link>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    color: '#475569',
    fontSize: 15,
  },
  form: {
    gap: 10,
  },
  label: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    color: '#0f172a',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
  },
  button: {
    marginTop: 6,
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
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: '#1d4ed8',
    fontWeight: '500',
  },
});
