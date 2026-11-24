import { useEffect, useRef, useState } from 'react';
import { SymbolView } from 'expo-symbols';
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAnimatedCardStyle, styles } from '@/styles/login-screen';

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
        <Pressable onPress={dismissKeyboard} style={styles.touchCapture} />
        <Animated.View
          style={getAnimatedCardStyle(formOpacity, formTranslateY, keyboardOffset)}>
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
