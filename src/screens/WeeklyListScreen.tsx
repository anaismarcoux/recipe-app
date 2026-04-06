import React, { useCallback, useState } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useGroceryStore } from '../store/groceryStore';
import { GroceryItem } from '../types';

export default function WeeklyListScreen() {
  const { categories, items, loading, load, cycleItem, updateItem } = useGroceryStore();
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const neededItems = items.filter(i => i.needed);
  const toBuy = neededItems.filter(i => !i.taken);
  const done = neededItems.filter(i => i.taken);

  const activeCatIds = [...new Set(neededItems.map(i => i.categoryId))];
  const activeCategories = categories
    .filter(c => activeCatIds.includes(c.id))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Search all items (not just needed ones)
  const searchResults = query.length >= 2
    ? items
        .filter(i => i.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10)
    : [];

  const addToWeek = async (item: GroceryItem) => {
    if (!item.needed) {
      await updateItem({ ...item, needed: true, taken: false });
    }
    setQuery('');
    setShowResults(false);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || '';
  };

  if (loading) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Add from your grocery list..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={text => {
            setQuery(text);
            setShowResults(text.length >= 2);
          }}
          onFocus={() => {
            if (query.length >= 2) setShowResults(true);
          }}
          onBlur={() => {
            setTimeout(() => setShowResults(false), 200);
          }}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setShowResults(false); }}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search results dropdown */}
      {showResults && searchResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <ScrollView
            style={styles.resultsList}
            keyboardShouldPersistTaps="always"
          >
            {searchResults.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.resultItem}
                onPress={() => addToWeek(item)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{item.name}</Text>
                  <Text style={styles.resultCat}>{getCategoryName(item.categoryId)}</Text>
                </View>
                {item.needed ? (
                  <Text style={styles.alreadyAdded}>already added</Text>
                ) : (
                  <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {toBuy.length > 0 ? `${toBuy.length} to buy` : 'All done!'}
            {done.length > 0 ? `  ·  ${done.length} done` : ''}
          </Text>
        </View>

        {neededItems.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={48} color="#CCC" />
            <Text style={styles.emptyTitle}>Nothing on this week's list</Text>
            <Text style={styles.emptySubtitle}>
              Search above to add items from your grocery list
            </Text>
          </View>
        )}

        {/* Items to buy, grouped by category */}
        {activeCategories.map(cat => {
          const catToBuy = toBuy.filter(i => i.categoryId === cat.id);
          const catDone = done.filter(i => i.categoryId === cat.id);

          if (catToBuy.length === 0 && catDone.length === 0) return null;

          return (
            <View key={cat.id} style={styles.section}>
              <Text style={styles.catTitle}>{cat.name}</Text>

              {catToBuy.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemRow}
                  onPress={() => cycleItem(item)}
                  activeOpacity={0.6}
                >
                  <Ionicons name="ellipse-outline" size={22} color={colors.primary} />
                  <Text style={styles.itemName}>{item.name}</Text>
                </TouchableOpacity>
              ))}

              {catDone.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemRow}
                  onPress={() => cycleItem(item)}
                  activeOpacity={0.6}
                >
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  <Text style={styles.itemNameDone}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 0,
  },
  resultsContainer: {
    marginHorizontal: 12,
    zIndex: 10,
  },
  resultsList: {
    maxHeight: 220,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultName: {
    fontSize: 15,
    color: colors.text,
  },
  resultCat: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  alreadyAdded: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  scroll: {
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  summary: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  section: {
    marginHorizontal: 12,
    marginTop: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  catTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  itemName: {
    fontSize: 15,
    color: colors.text,
  },
  itemNameDone: {
    fontSize: 15,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
});
