import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Button,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Calendar from 'expo-calendar';
import { CameraCapture } from '../components/CameraCapture';
import { LocationMap } from '../components/LocationMap';
import { Coordinates, Incident  } from '../types';
import { submitIncident } from '../services/api';

export const IncidentScreen: React.FC = () => {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addEventToCalendar = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission refusée', "Impossible d'accéder au calendrier.");
      return;
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

    const writableCalendar = calendars.find((calendar) => calendar.allowsModifications);

    if (!writableCalendar) {
      Alert.alert('Erreur', 'Aucun calendrier disponible pour écrire un événement.');
      return;
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    await Calendar.createEventAsync(writableCalendar.id, {
      title: 'Suivi intervention',
      startDate,
      endDate,
      location: location ? `${location.latitude}, ${location.longitude}` : undefined,
    });
  };

  const handleSubmit = async () => {
    if (!photoUri || !location) {
      Alert.alert(
        'Erreur',
        'Vous devez prendre une photo et récupérer la localisation avant de sauvegarder.'
      );
      return;
    }

    const entry: Incident = {
      photoUri,
      location,
      timestamp: Date.now(),
    };

    try {
      setIsSubmitting(true);

      const response = await submitIncident(entry);

      if (response.success) {
        Vibration.vibrate(300);
        await addEventToCalendar();

        setPhotoUri(null);
        setLocation(null);
        

        Alert.alert('Succès', 'Entrée sauvegardée avec succès.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur serveur (HTTP 500).');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <Text style={styles.header}>Créer un incident</Text>

        <Text style={styles.label}>1. Preuve Photographique</Text>

        {photoUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: photoUri }} style={styles.image} />
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => setPhotoUri(null)}
            >
              <Text style={styles.retryButtonText}>Reprendre la photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            <CameraCapture onPictureTaken={setPhotoUri} />
          </View>
        )}

        <Text style={styles.label}>2. Localisation</Text>
        <LocationMap onLocationFound={setLocation} />

        {!location || !photoUri ? null : (
          <View style={styles.submitContainer}>
          {isSubmitting ? (
            <ActivityIndicator size="large" />
          ) : (
            <Button title="Sauvegarder" onPress={handleSubmit} />
          )}
        </View>
        )
        }
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 12,
    marginTop: 16,
  },
  previewContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  retryButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  cameraContainer: {
    marginVertical: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  submitContainer: {
    marginTop: 24,
    marginBottom: 30,
  },
});