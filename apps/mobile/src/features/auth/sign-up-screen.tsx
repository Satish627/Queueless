import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { authSignUpSchema } from '@queueless/validation';

import { ScreenShell } from '@/components/screen-shell';

export function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    full_name?: string;
    email?: string;
    phone?: string;
    password?: string;
  }>({});

  const canSubmit = useMemo(() => {
    return fullName.trim().length > 0 && email.trim().length > 0 && password.length > 0;
  }, [fullName, email, password]);

  const handleSubmit = () => {
    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    const normalizedPhone = phone.trim().length > 0 ? phone.trim() : null;
    const parsed = authSignUpSchema.safeParse({
      full_name: fullName.trim(),
      email: email.trim(),
      password,
      phone: normalizedPhone,
    });

    if (!parsed.success) {
      const nextFieldErrors: {
        full_name?: string;
        email?: string;
        phone?: string;
        password?: string;
      } = {};
      const parsedFieldErrors = parsed.error.flatten().fieldErrors;

      if (parsedFieldErrors.full_name?.[0]) {
        nextFieldErrors.full_name = parsedFieldErrors.full_name[0];
      }

      if (parsedFieldErrors.email?.[0]) {
        nextFieldErrors.email = parsedFieldErrors.email[0];
      }

      if (parsedFieldErrors.phone?.[0]) {
        nextFieldErrors.phone = parsedFieldErrors.phone[0];
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
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Sign up to join and track queues remotely.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            autoCapitalize="words"
            onChangeText={setFullName}
            placeholder="John Doe"
            placeholderTextColor="#94a3b8"
            style={[styles.input, fieldErrors.full_name ? styles.inputError : null]}
            value={fullName}
          />
          {fieldErrors.full_name ? (
            <Text style={styles.errorText}>{fieldErrors.full_name}</Text>
          ) : null}

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

          <Text style={styles.label}>Phone (optional)</Text>
          <TextInput
            keyboardType="phone-pad"
            onChangeText={setPhone}
            placeholder="+45 12 34 56 78"
            placeholderTextColor="#94a3b8"
            style={[styles.input, fieldErrors.phone ? styles.inputError : null]}
            value={phone}
          />
          {fieldErrors.phone ? <Text style={styles.errorText}>{fieldErrors.phone}</Text> : null}

          <Text style={styles.label}>Password</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="new-password"
            onChangeText={setPassword}
            placeholder="At least 8 characters"
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
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Text>
          </Pressable>
        </View>

        <Link href="/(auth)/sign-in" style={styles.link}>
          Already have an account? Sign in
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
