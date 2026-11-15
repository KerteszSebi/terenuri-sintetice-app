import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/auth-context';

type Pitch = {
  id: string;
  name: string;
  location: string;
};

const API_URL = 'http://192.168.1.28:3000/api/pitches';

export default function HomeScreen() {
  const { logout } = useAuth();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchPitches = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setErrorMessage(null);

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: Pitch[] = await response.json();
      setPitches(data);
    } catch (error) {
      console.error('Failed to fetch pitches:', error);
      setErrorMessage('Unable to load pitches. Check the API connection.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchPitches();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Synthetic Football Pitches</Text>
          <Text style={styles.subtitle}>Find a pitch for your next match</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => void logout()}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}>
          <Text style={styles.logoutButtonText}>Log out</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#166534" style={styles.loader} />
      ) : errorMessage ? (
        <View style={styles.messageContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : (
        <FlatList
          data={pitches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void fetchPitches(true)}
            />
          }
          ListEmptyComponent={
            <View style={styles.messageContainer}>
              <Text style={styles.emptyText}>No pitches are available.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.pitchCard}>
              <Text style={styles.pitchName}>{item.name}</Text>
              <Text style={styles.pitchLocation}>{item.location}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
