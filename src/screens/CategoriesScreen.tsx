import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, Alert } from 'react-native';
import { FAB } from 'react-native-paper';
import { colors } from '../constants/colors';
import { useCategoryStore } from '../store/categoryStore';
import { Category } from '../types';
import CategoryCard from '../components/CategoryCard';
import AddEditCategoryModal from '../components/AddEditCategoryModal';
import EmptyState from '../components/EmptyState';

export default function CategoriesScreen({ navigation }: any) {
  const { categories, loading, load, add, update, remove } = useCategoryStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (name: string, emoji: string) => {
    if (editingCategory) {
      await update({ ...editingCategory, name, emoji });
    } else {
      await add(name, emoji);
    }
    setModalVisible(false);
    setEditingCategory(null);
  };

  const handleDelete = () => {
    if (!editingCategory) return;
    Alert.alert(
      'Delete Category',
      `Delete "${editingCategory.name}" and all its recipes?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await remove(editingCategory.id);
            setModalVisible(false);
            setEditingCategory(null);
          },
        },
      ]
    );
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setModalVisible(true);
  };

  const openCreate = () => {
    setEditingCategory(null);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {categories.length === 0 && !loading ? (
        <EmptyState
          message="No categories yet"
          submessage='Tap "+" to create your first category'
        />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <CategoryCard
              category={item}
              onPress={() => navigation.navigate('CategoryDetail', { categoryId: item.id, categoryName: item.name })}
              onLongPress={() => openEdit(item)}
            />
          )}
        />
      )}

      <FAB icon="plus" style={styles.fab} onPress={openCreate} color="#fff" />

      <AddEditCategoryModal
        visible={modalVisible}
        category={editingCategory}
        onSave={handleSave}
        onDelete={editingCategory ? handleDelete : undefined}
        onClose={() => { setModalVisible(false); setEditingCategory(null); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 10,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: colors.primary,
    borderRadius: 28,
  },
});
