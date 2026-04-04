import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { colors } from '../constants/colors';
import { useAuthStore } from '../store/authStore';

export default function AuthScreen() {
  const { signIn, signUp } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);
    if (!email.trim() || !password.trim()) {
      setError('Please fill in both fields');
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const err = await signUp(email.trim(), password);
        if (err) {
          setError(err);
        } else {
          setMessage('Account created! You can now sign in.');
          setIsSignUp(false);
        }
      } else {
        const err = await signIn(email.trim(), password);
        if (err) setError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.appTitle}>P&#233;pin's cookbook</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? 'Create an account' : 'Sign in to your account'}
        </Text>

        {error && <Text style={styles.error}>{error}</Text>}
        {message && <Text style={styles.message}>{message}</Text>}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Your password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toggle}
          onPress={() => {
            setIsSignUp(!isSignUp);
            setError(null);
            setMessage(null);
          }}
        >
          <Text style={styles.toggleText}>
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  inner: {
    paddingHorizontal: 32,
  },
  appTitle: {
    fontFamily: 'Pacifico_400Regular',
    fontSize: 36,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  toggle: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    color: colors.primary,
    fontSize: 14,
  },
  error: {
    backgroundColor: '#FDECEA',
    color: colors.error,
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    backgroundColor: colors.primaryLight,
    color: colors.primary,
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
});
