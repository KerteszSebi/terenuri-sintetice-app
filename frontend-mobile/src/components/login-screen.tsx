import { useEffect, useRef, useState } from 'react';
import { SymbolView } from 'expo-symbols';
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LoginScreenProps = {
  onLogin: (token: string, rememberMe: boolean) => Promise<void> | void;
};

type LoginResponse = {
  token?: unknown;
  error?: unknown;
};

const API_URL = 'http://192.168.1.28:3000/api/auth/login';

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [formOpacity] = useState(() => new Animated.Value(0));
  const [formTranslateY] = useState(() => new Animated.Value(56));
  const [keyboardOffset] = useState(() => new Animated.Value(0));
  const keyboardVisibleRef = useRef(false);
  const keyboardHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const passwordInputRef = useRef<TextInputInstance>(null);
  const [activeField, setActiveField] = useState<'email' | 'password' | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(formOpacity, {
        duration: 1400,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(formTranslateY, {
        duration: 1400,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, [formOpacity, formTranslateY]);

  useEffect(() => {
    passwordInputRef.current?.setNativeProps({ secureTextEntry: true });
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      if (keyboardHideTimerRef.current) {
        clearTimeout(keyboardHideTimerRef.current);
        keyboardHideTimerRef.current = null;
      }

      if (keyboardVisibleRef.current) {
        return;
      }

      keyboardVisibleRef.current = true;
      Animated.timing(keyboardOffset, {
        duration: Platform.OS === 'ios' ? event.duration : 220,
        toValue: -Math.min(event.endCoordinates.height * 0.35, 180),
        useNativeDriver: true,
      }).start();
    });
    const hideSubscription = Keyboard.addListener(hideEvent, (event) => {
      keyboardHideTimerRef.current = setTimeout(() => {
        keyboardVisibleRef.current = false;
        Animated.timing(keyboardOffset, {
          duration: Platform.OS === 'ios' ? event.duration : 220,
          toValue: 0,
          useNativeDriver: true,
        }).start();
        keyboardHideTimerRef.current = null;
      }, 120);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      if (keyboardHideTimerRef.current) {
        clearTimeout(keyboardHideTimerRef.current);
      }
    };
  }, [keyboardOffset]);

  const togglePasswordVisibility = () => {
    const nextVisibility = !isPasswordVisible;
    const cursorPosition = password.length;

    setIsPasswordVisible(nextVisibility);
    passwordInputRef.current?.setNativeProps({
      secureTextEntry: !nextVisibility,
      selection: {
        start: cursorPosition,
        end: cursorPosition,
      },
    });

    setTimeout(() => {
      passwordInputRef.current?.setNativeProps({
        selection: {
          start: cursorPosition,
          end: cursorPosition,
        },
      });
    }, 0);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setActiveField(null);
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('E-mailul și parola sunt obligatorii.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok || typeof data.token !== 'string') {
        throw new Error('Datele de autentificare sunt incorecte.');
      }

      await onLogin(data.token, rememberMe);
    } catch (error) {
      console.error('Failed to log in:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nu s-a putut realiza conexiunea cu serverul.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable onPress={dismissKeyboard} style={StyleSheet.absoluteFill} />
        <Animated.View
          style={[
            styles.card,
            {
              opacity: formOpacity,
              transform: [{ translateY: formTranslateY }, { translateY: keyboardOffset }],
            },
          ]}>
            <Text style={styles.eyebrow}>TERENURI SINTETICE</Text>
            <Text style={styles.title}>Bine ai revenit!</Text>
            <Text style={styles.subtitle}>
              Autentifică-te pentru a vedea terenurile disponibile
            </Text>

            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              onFocus={() => setActiveField('email')}
              placeholder="E-mail"
              placeholderTextColor="#8b94a7"
              style={[styles.input, activeField === 'email' && styles.inputFocused]}
              value={email}
            />

            <View style={styles.passwordInputContainer}>
              <TextInput
                autoCapitalize="none"
                autoComplete="password"
                onChangeText={setPassword}
                onFocus={() => setActiveField('password')}
                placeholder="Parolă"
                placeholderTextColor="#8b94a7"
                ref={passwordInputRef}
                style={[
                  styles.input,
                  styles.passwordInput,
                  activeField === 'password' && styles.inputFocused,
                ]}
                value={password}
              />
              <Pressable
                accessibilityLabel={isPasswordVisible ? 'Ascunde parola' : 'Arată parola'}
                accessibilityRole="button"
                onPress={togglePasswordVisibility}
                style={styles.passwordToggle}>
                <SymbolView
                  name={{
                    ios: isPasswordVisible ? 'eye' : 'eye.slash',
                    android: isPasswordVisible ? 'visibility' : 'visibility_off',
                    web: isPasswordVisible ? 'visibility' : 'visibility_off',
                  }}
                  size={24}
                  tintColor="#00ff87"
                />
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rememberMe }}
              accessibilityLabel="Ține-mă minte"
              onPress={() => setRememberMe((currentValue) => !currentValue)}
              style={styles.rememberMeRow}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Text style={styles.checkboxMark}>✓</Text>}
              </View>
              <Text style={styles.rememberMeText}>Ține-mă minte</Text>
            </Pressable>

            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={() => void handleSubmit()}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.submitButtonPressed,
                isSubmitting && styles.submitButtonDisabled,
              ]}>
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Autentificare</Text>
              )}
            </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#0b132b',
    flex: 1,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#121c35',
    borderColor: '#223153',
    borderRadius: 28,
    borderWidth: 1,
    maxWidth: 480,
    padding: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    width: '100%',
  },
  eyebrow: {
    color: '#00ff87',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    color: '#c4ccdc',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#0e172d',
    borderColor: '#2c3b5f',
    borderRadius: 16,
    borderWidth: 1,
    color: '#ffffff',
    fontSize: 16,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  inputFocused: {
    borderColor: '#00ff87',
    shadowColor: '#00ff87',
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  passwordInputContainer: {
    marginTop: 18,
    position: 'relative',
  },
  passwordInput: {
    marginTop: 0,
    paddingRight: 56,
  },
  passwordToggle: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    top: 0,
    width: 44,
  },
  rememberMeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 18,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: '#56627d',
    borderRadius: 6,
    borderWidth: 1,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  checkboxChecked: {
    backgroundColor: '#00ff87',
    borderColor: '#00ff87',
  },
  checkboxMark: {
    color: '#0b132b',
    fontSize: 14,
    fontWeight: '700',
  },
  rememberMeText: {
    color: '#c4ccdc',
    fontSize: 15,
    marginLeft: 8,
  },
  errorText: {
    color: '#ff7b88',
    fontSize: 14,
    marginTop: 12,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#00ff87',
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 54,
  },
  submitButtonPressed: {
    opacity: 0.8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#061329',
    fontSize: 16,
    fontWeight: '700',
  },
});
