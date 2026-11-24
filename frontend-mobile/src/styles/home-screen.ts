import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: '#14532d',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#4b5563',
    fontSize: 16,
    marginTop: 6,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoutButtonPressed: {
    opacity: 0.8,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    gap: 12,
    padding: 20,
    paddingTop: 8,
  },
  pitchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 2,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  pitchName: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  pitchLocation: {
    color: '#6b7280',
    fontSize: 15,
    marginTop: 8,
  },
  loader: {
    flex: 1,
  },
  messageContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
});
