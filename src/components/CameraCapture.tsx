import React, { useRef } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface CameraCaptureProps {
  onPictureTaken: (uri: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onPictureTaken }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Nous avons besoin de votre permission pour accéder à la caméra.
        </Text>
        <Button title="Accorder la permission" onPress={requestPermission} />
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
      });

      if (photo?.uri) {
        onPictureTaken(photo.uri);
      }
    } catch (error) {
      console.error('Erreur lors de la capture de la photo :', error);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />

      <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
        <Text style={styles.buttonText}>Prendre une photo</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    backgroundColor: 'black',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  captureButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
});