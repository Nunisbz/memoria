import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';

export default function MemoryApp() {
  const [memories, setMemories] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [description, setDescription] = useState('');
  const [cameraPermission, setCameraPermission] = useState(null);
  const [galleryPermission, setGalleryPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(cameraStatus.status === 'granted');

      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setGalleryPermission(galleryStatus.status === 'granted');

      const savedMemories = await AsyncStorage.getItem('memories');
      if (savedMemories) {
        setMemories(JSON.parse(savedMemories));
      }
    })();
  }, []);

  const saveMemories = async (newMemories) => {
    await AsyncStorage.setItem('memories', JSON.stringify(newMemories));
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSaveMemory = () => {
    if (selectedImage && description.trim()) {
      const newMemory = { image: selectedImage, description };
      const newMemories = [...memories, newMemory];
      setMemories(newMemories);
      saveMemories(newMemories);
      setSelectedImage(null);
      setDescription('');
    }
  };

  const renderMemory = ({ item }) => (
    <View style={styles.memoryItem}>
      <Image source={{ uri: item.image }} style={styles.memoryImage} />
      <Text style={styles.memoryDescription}>{item.description}</Text>
    </View>
  );

  if (!cameraPermission || !galleryPermission) {
    return (
      <View style={styles.container}>
        <Text>É necessário permitir o uso da câmera e galeria.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {selectedImage ? (
        <View>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          <TextInput
            placeholder="Adicione uma descrição"
            style={styles.input}
            value={description}
            onChangeText={setDescription}
          />
          <Button title="Salvar Imagem" onPress={handleSaveMemory} />
        </View>
      ) : (
        <View>
          <Button title="Escolher da Galeria" onPress={handlePickImage} />
          <Button title="Tirar Foto" onPress={handleTakePhoto} />
        </View>
      )}
      <FlatList
        data={memories}
        renderItem={renderMemory}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginVertical: 10,
    padding: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  memoryItem: {
    marginBottom: 20,
    alignItems: 'center',
  },
  memoryImage: {
    width: '100%',
    height: 200,
  },
  memoryDescription: {
    marginTop: 10,
    fontSize: 16,
  },
});
