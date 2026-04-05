import React, { useState, useCallback } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { FAB } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useGroceryStore } from '../store/groceryStore';
import { GroceryItem, GroceryCategory } from '../types';

export default function GroceryScreen() {
  const {
    categories, items, loading, load,
    addCategory, updateCategory, removeCategory,
    addItem, updateItem, removeItem, cycleItem, resetWeek,
  } = useGroceryStore();

  const [addingItemCatId, setAddingItemCatId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [editItemName, setEditItemName] = useState('');

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const handleAddItem = async (categoryId: string) => {
    if (!newItemName.trim()) return;
    await addItem(categoryId, newItemName.trim());
    setNewItemName('');
    setAddingItemCatId(null);
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    await addCategory(newCatName.trim());
    setNewCatName('');
    setAddingCategory(false);
  };

  const handleDeleteCategory = (cat: GroceryCategory) => {
    Alert.alert('Delete Category', `Delete "${cat.name}" and all its items?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeCategory(cat.id) },
    ]);
  };

  const handleEditCategory = (cat: GroceryCategory) => {
    Alert.prompt
      ? Alert.prompt('Rename Category', '', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => handleDeleteCategory(cat) },
          { text: 'Save', onPress: (val?: string) => {
            if (val?.trim()) updateCategory({ ...cat, name: val.trim() });
          }},
        ], 'plain-text', cat.name)
      : (() => {
          const newName = prompt('Rename category:', cat.name);
          if (newName?.trim()) updateCategory({ ...cat, name: newName.trim() });
        })();
  };

  const handleSaveEditItem = async () => {
    if (!editingItem || !editItemName.trim()) return;
    await updateItem({ ...editingItem, name: editItemName.trim() });
    setEditingItem(null);
    setEditItemName('');
  };

  const handleDeleteItem = (item: GroceryItem) => {
    Alert.alert('Delete Item', `Delete "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeItem(item.id) },
    ]);
  };

  const handleReset = () => {
    Alert.alert('Reset Week', 'Uncheck all items for next week?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', onPress: resetWeek },
    ]);
  };

  const neededCount = items.filter(i => i.needed && !i.taken).length;
  const takenCount = items.filter(i => i.taken).length;

  if (loading) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Summary bar */}
      {(neededCount > 0 || takenCount > 0) && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            {neededCount > 0 ? `${neededCount} to buy` : ''}
            {neededCount > 0 && takenCount > 0 ? '  ·  ' : ''}
            {takenCount > 0 ? `${takenCount} done` : ''}
          </Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
            <Ionicons name="refresh" size={16} color={colors.primary} />
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll}>
        {categories.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No grocery categories yet</Text>
            <Text style={styles.emptySubtitle}>Tap + to create one</Text>
          </View>
        )}

        {categories.map(cat => {
          const catItems = items
            .filter(i => i.categoryId === cat.id)
            .sort((a, b) => {
              // Sort: needed first, then taken, then inactive
              if (a.needed && !a.taken && !(b.needed && !b.taken)) return -1;
              if (b.needed && !b.taken && !(a.needed && !a.taken)) return 1;
              if (!a.needed && !a.taken && (b.needed || b.taken)) return 1;
              if (!b.needed && !b.taken && (a.needed || a.taken)) return -1;
              return a.sortOrder - b.sortOrder;
            });

          return (
            <View key={cat.id} style={styles.section}>
              <TouchableOpacity
                style={styles.catHeader}
                onLongPress={() => handleEditCategory(cat)}
                onPress={() => handleDeleteCategory(cat)}
              >
                <Text style={styles.catTitle}>{cat.name}</Text>
                <Text style={styles.catCount}>
                  {catItems.filter(i => i.needed && !i.taken).length}/{catItems.length}
                </Text>
              </TouchableOpacity>

              {catItems.map(item => (
                <View key={item.id} style={styles.itemRow}>
                  {/* Edit mode */}
                  {editingItem?.id === item.id ? (
                    <View style={styles.editRow}>
                      <TextInput
                        style={styles.editInput}
                        value={editItemName}
                        onChangeText={setEditItemName}
                        onSubmitEditing={handleSaveEditItem}
                        autoFocus
                      />
                      <TouchableOpacity onPress={handleSaveEditItem} style={styles.editBtn}>
                        <Ionicons name="checkmark" size={20} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => { setEditingItem(null); setEditItemName(''); }}
                        style={styles.editBtn}
                      >
                        <Ionicons name="close" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.itemTouchable}
                      onPress={() => cycleItem(item)}
                      onLongPress={() => {
                        setEditingItem(item);
                        setEditItemName(item.name);
                      }}
                    >
                      {/* State indicator */}
                      <View style={styles.checkbox}>
                        {!item.needed ? (
                          <Ionicons name="ellipse-outline" size={22} color="#CCC" />
                        ) : item.taken ? (
                          <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                        ) : (
                          <Ionicons name="ellipse-outline" size={22} color={colors.primary} />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.itemName,
                          !item.needed && styles.itemInactive,
                          item.taken && styles.itemTaken,
                        ]}
                      >
                        {item.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleDeleteItem(item)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="close-circle-outline" size={18} color="#CCC" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {/* Add item input */}
              {addingItemCatId === cat.id ? (
                <View style={styles.addItemRow}>
                  <TextInput
                    style={styles.addItemInput}
                    placeholder="Item name"
                    placeholderTextColor={colors.textSecondary}
                    value={newItemName}
                    onChangeText={setNewItemName}
                    onSubmitEditing={() => handleAddItem(cat.id)}
                    autoFocus
                  />
                  <TouchableOpacity onPress={() => handleAddItem(cat.id)} style={styles.addItemBtn}>
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { setAddingItemCatId(null); setNewItemName(''); }}
                    style={styles.addItemBtn}
                  >
                    <Ionicons name="close" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addItemTrigger}
                  onPress={() => { setAddingItemCatId(cat.id); setNewItemName(''); }}
                >
                  <Ionicons name="add" size={18} color={colors.primary} />
                  <Text style={styles.addItemText}>Add item</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* Add category inline */}
        {addingCategory ? (
          <View style={styles.addCatRow}>
            <TextInput
              style={styles.addCatInput}
              placeholder="Category name"
              placeholderTextColor={colors.textSecondary}
              value={newCatName}
              onChangeText={setNewCatName}
              onSubmitEditing={handleAddCategory}
              autoFocus
            />
            <TouchableOpacity onPress={handleAddCategory} style={styles.addItemBtn}>
              <Ionicons name="checkmark" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setAddingCategory(false); setNewCatName(''); }}
              style={styles.addItemBtn}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setAddingCategory(true)}
        color="#fff"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resetText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  scroll: {
    paddingBottom: 90,
    paddingTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 4,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  catTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  catCount: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  itemRow: {
    paddingHorizontal: 14,
  },
  itemTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  checkbox: {
    width: 24,
    alignItems: 'center',
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  itemInactive: {
    color: '#AAAAAA',
  },
  itemTaken: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 8,
    fontSize: 15,
    color: colors.text,
    backgroundColor: '#FFFFFF',
  },
  editBtn: {
    padding: 4,
  },
  addItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  addItemInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 8,
    fontSize: 15,
    color: colors.text,
    backgroundColor: '#FFFFFF',
  },
  addItemBtn: {
    padding: 4,
  },
  addItemTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  addItemText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  addCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 12,
    gap: 8,
  },
  addCatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: '#F5F5F5',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: colors.primary,
    borderRadius: 28,
  },
});
