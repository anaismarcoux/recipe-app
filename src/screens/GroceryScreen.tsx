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

export default function GroceryScreen({ navigation }: any) {
  const {
    categories, items, loading, load,
    addCategory, updateCategory, removeCategory,
    addItem, updateItem, removeItem, cycleItem, resetWeek,
    moveCategoryUp, moveCategoryDown, moveItemUp, moveItemDown,
  } = useGroceryStore();

  const [addingItemCatId, setAddingItemCatId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [reorderMode, setReorderMode] = useState(false);
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});

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
    if (Platform.OS === 'web') {
      if (confirm(`Delete "${cat.name}" and all its items?`)) removeCategory(cat.id);
    } else {
      Alert.alert('Delete Category', `Delete "${cat.name}" and all its items?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeCategory(cat.id) },
      ]);
    }
  };

  const handleEditCategory = (cat: GroceryCategory) => {
    if (Platform.OS === 'web') {
      const action = prompt(`"${cat.name}"\n\nType a new name to rename, or type DELETE to remove:`, cat.name);
      if (action === null) return; // cancelled
      if (action.trim().toUpperCase() === 'DELETE') {
        if (confirm(`Delete "${cat.name}" and all its items?`)) removeCategory(cat.id);
      } else if (action.trim()) {
        updateCategory({ ...cat, name: action.trim() });
      }
    } else {
      Alert.prompt
        ? Alert.prompt('Rename Category', '', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => handleDeleteCategory(cat) },
            { text: 'Save', onPress: (val?: string) => {
              if (val?.trim()) updateCategory({ ...cat, name: val.trim() });
            }},
          ], 'plain-text', cat.name)
        : Alert.alert('Edit Category', cat.name, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => handleDeleteCategory(cat) },
          ]);
    }
  };

  const handleSaveEditItem = async () => {
    if (!editingItem || !editItemName.trim()) return;
    await updateItem({ ...editingItem, name: editItemName.trim() });
    setEditingItem(null);
    setEditItemName('');
  };

  const handleDeleteItem = (item: GroceryItem) => {
    if (Platform.OS === 'web') {
      if (confirm(`Delete "${item.name}"?`)) removeItem(item.id);
    } else {
      Alert.alert('Delete Item', `Delete "${item.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeItem(item.id) },
      ]);
    }
  };

  const handleReset = () => {
    if (Platform.OS === 'web') {
      if (confirm('Uncheck all items for next week?')) resetWeek();
    } else {
      Alert.alert('Reset Week', 'Uncheck all items for next week?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', onPress: resetWeek },
      ]);
    }
  };

  const neededCount = items.filter(i => i.needed).length;

  if (loading) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Summary bar */}
      <View style={styles.summaryBar}>
        <TouchableOpacity
          style={styles.weekBtn}
          onPress={() => navigation.navigate('WeeklyList')}
        >
          <Ionicons name="list" size={16} color="#fff" />
          <Text style={styles.weekBtnText}>This Week</Text>
        </TouchableOpacity>
        {reorderMode ? (
          <TouchableOpacity onPress={() => setReorderMode(false)} style={styles.weekBtn}>
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={styles.weekBtnText}>Done</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.summaryText}>
              {neededCount > 0 ? `${neededCount} needed` : 'Tap items you need'}
            </Text>
            <TouchableOpacity onPress={() => setReorderMode(true)} style={styles.reorderBtn}>
              <Ionicons name="swap-vertical" size={18} color={colors.primary} />
            </TouchableOpacity>
            {neededCount > 0 && (
              <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
                <Ionicons name="refresh" size={16} color={colors.primary} />
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {categories.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No grocery categories yet</Text>
            <Text style={styles.emptySubtitle}>Tap + to create one</Text>
          </View>
        )}

        {[...categories].sort((a, b) => a.sortOrder - b.sortOrder).map(cat => {
          const catItems = items
            .filter(i => i.categoryId === cat.id)
            .sort((a, b) => {
              if (reorderMode) return a.sortOrder - b.sortOrder;
              if (a.needed !== b.needed) return a.needed ? -1 : 1;
              return a.sortOrder - b.sortOrder;
            });

          return (
            <View key={cat.id} style={styles.section}>
              {reorderMode ? (
                <View style={styles.catHeaderReorder}>
                  <Text style={[styles.catTitle, { flex: 1 }]}>{cat.name}</Text>
                  <TouchableOpacity onPress={() => moveCategoryUp(cat.id)} style={styles.arrowBtn}>
                    <Ionicons name="chevron-up" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => moveCategoryDown(cat.id)} style={styles.arrowBtn}>
                    <Ionicons name="chevron-down" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.catHeader}
                  onPress={() => setCollapsedCats(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                  onLongPress={() => handleEditCategory(cat)}
                >
                  <Ionicons
                    name={collapsedCats[cat.id] ? 'chevron-forward' : 'chevron-down'}
                    size={18}
                    color={colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.catTitle, { flex: 1 }]}>{cat.name}</Text>
                  <Text style={styles.catCount}>
                    {catItems.filter(i => i.needed).length}/{catItems.length}
                  </Text>
                </TouchableOpacity>
              )}

              {!collapsedCats[cat.id] && (
                <>
                  {catItems.map(item => (
                    <View key={item.id} style={styles.itemRow}>
                      {reorderMode ? (
                        <View style={styles.itemReorderRow}>
                          <Text style={[styles.itemName, { flex: 1 }]}>{item.name}</Text>
                          <TouchableOpacity onPress={() => moveItemUp(item)} style={styles.arrowBtn}>
                            <Ionicons name="chevron-up" size={18} color={colors.textSecondary} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => moveItemDown(item)} style={styles.arrowBtn}>
                            <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
                          </TouchableOpacity>
                        </View>
                      ) : editingItem?.id === item.id ? (
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
                          <View style={styles.checkbox}>
                            <Ionicons
                              name={item.needed ? 'checkmark-circle' : 'ellipse-outline'}
                              size={22}
                              color={item.needed ? colors.primary : '#CCC'}
                            />
                          </View>
                          <Text
                            style={[
                              styles.itemName,
                              !item.needed && styles.itemInactive,
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
                </>
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
  weekBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  weekBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  reorderBtn: {
    padding: 4,
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
  catHeaderReorder: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  arrowBtn: {
    padding: 6,
  },
  itemRow: {
    paddingHorizontal: 14,
  },
  itemReorderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
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
