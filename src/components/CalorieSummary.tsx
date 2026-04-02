import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors } from '../constants/colors';
import { Ingredient } from '../types';
import { totalCalories, caloriesPerUnit, caloriesPer100g } from '../utils/calorieCalculator';

interface Props {
  ingredients: Ingredient[];
  yieldAmount: number | null;
  yieldUnit: string | null;
  totalWeightGrams: number | null;
}

export default function CalorieSummary({ ingredients, yieldAmount, yieldUnit, totalWeightGrams }: Props) {
  const total = totalCalories(ingredients);
  const perUnit = caloriesPerUnit(total, yieldAmount);
  const per100g = caloriesPer100g(total, totalWeightGrams);

  if (total === 0 && !perUnit && !per100g) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Calories</Text>
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.value}>{total}</Text>
          <Text style={styles.label}>Total kcal</Text>
        </View>
        {perUnit != null && (
          <View style={styles.item}>
            <Text style={styles.value}>{perUnit}</Text>
            <Text style={styles.label}>kcal / {yieldUnit || 'unit'}</Text>
          </View>
        )}
        {per100g != null && (
          <View style={styles.item}>
            <Text style={styles.value}>{per100g}</Text>
            <Text style={styles.label}>kcal / 100g</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondaryLight,
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  header: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  item: {
    alignItems: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.calorieOrange,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
