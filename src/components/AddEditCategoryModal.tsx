import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { Category } from '../types';

interface Props {
  visible: boolean;
  category: Category | null;
  onSave: (name: string, emoji: string, imageUri: string | null) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function AddEditCategoryModal({ visible, category, onSave, onDelete, onClose }: Props) {
  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setImageUri(category.imageUri);
    } else {
      setName('');
      setImageUri(null);
    }
  }, [category, visible]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), '', imageUri);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{category ? 'Edit Category' : 'New Category'}</Text>

          <TextInput
            style={styles.input}
            placeholder="Category name"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <Text style={styles.label}>Cover image</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={28} color={colors.textSecondary} />
                <Text style={styles.imagePickerText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
          {imageUri && (
            <TouchableOpacity onPress={() => setImageUri(null)} style={styles.removeImage}>
              <Text style={styles.removeImageText}>Remove image</Text>
            </TouchableOpacity>
          )}

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            {category && onDelete && (
              <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.saveBtn, !name.trim() && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!name.trim()}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  imagePlaceholder: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: 4,
  },
  imagePickerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  imagePreview: {
    width: '100%',
    height: 140,
  },
  removeImage: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  removeImageText: {
    fontSize: 13,
    color: colors.error,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  deleteBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
