import React, { useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useGroceryStore } from '../store/groceryStore';

export default function WeeklyListScreen() {
  const { categories, items, loading, load, cycleItem } = useGroceryStore();

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const neededItems = items.filter(i => i.needed);
  const toBuy = neededItems.filter(i => !i.taken);
  const done = neededItems.filter(i => i.taken);

  // Only show categories that have needed items
  const activeCatIds = [...new Set(neededItems.map(i => i.categoryId))];
  const activeCategories = categories
    .filter(c => activeCatIds.includes(c.id))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (loading) return null;

  if (neededItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={48} color="#CCC" />
        <Text style={styles.emptyTitle}>Nothing on this week's list</Text>
        <Text style={styles.emptySubtitle}>
          Go to the full grocery list and tap items you need
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {toBuy.length > 0 ? `${toBuy.length} to buy` : 'All done!'}
          {done.length > 0 ? `  ·  ${done.length} done` : ''}
        </Text>
      </View>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
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
