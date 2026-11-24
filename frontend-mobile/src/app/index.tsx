import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/auth-context';
import { styles } from '@/styles/home-screen';

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
