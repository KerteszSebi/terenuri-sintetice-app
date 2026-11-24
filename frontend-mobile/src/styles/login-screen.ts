import { Animated, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
  touchCapture: {
    ...StyleSheet.absoluteFill,
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

export const getAnimatedCardStyle = (
  opacity: Animated.Value,
  formTranslateY: Animated.Value,
  keyboardOffset: Animated.Value,
) => [
  styles.card,
  {
    opacity,
    transform: [{ translateY: formTranslateY }, { translateY: keyboardOffset }],
  },
];
