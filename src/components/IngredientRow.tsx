import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ScrollView } from 'react-native';
import { colors } from '../constants/colors';
import { searchFoods, calculateCalories, FoodEntry } from '../data/foodDatabase';

interface IngredientInput {
  name: string;
  amount: string;
  unit: string;
  calories: string;
}

interface Props {
  ingredient: IngredientInput;
  onChange: (updated: IngredientInput) => void;
  onRemove: () => void;
}

const UNITS = ['g', 'ml', 'cups', 'tbsp', 'tsp', 'pcs', 'oz', 'lb'];

export default function IngredientRow({ ingredient, onChange, onRemove }: Props) {
  const [suggestions, setSuggestions] = useState<FoodEntry[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodEntry | null>(null);
  const ignoreNextSearch = useRef(false);

  // Search as user types
  useEffect(() => {
    if (ignoreNextSearch.current) {
      ignoreNextSearch.current = false;
      return;
    }
    const results = searchFoods(ingredient.name);
    setSuggestions(results);
    setShowSuggestions(results.length > 0 && ingredient.name.length >= 2);
  }, [ingredient.name]);

  // Auto-calculate calories when amount, unit, or selected food changes
  useEffect(() => {
    if (!selectedFood) return;
    const amount = parseFloat(ingredient.amount);
    if (!amount || amount <= 0) return;
    const cal = calculateCalories(selectedFood, amount, ingredient.unit);
    if (cal !== null) {
      onChange({ ...ingredient, calories: String(cal) });
    }
  }, [ingredient.amount, ingredient.unit, selectedFood]);

  const handleSelectFood = (food: FoodEntry) => {
    ignoreNextSearch.current = true;
    setSelectedFood(food);
    setShowSuggestions(false);
    setSuggestions([]);

    const amount = parseFloat(ingredient.amount);
    const cal = amount > 0 ? calculateCalories(food, amount, ingredient.unit) : null;
    onChange({
      ...ingredient,
      name: food.name,
      calories: cal !== null ? String(cal) : ingredient.calories,
    });
  };

  const handleAmountChange = (amount: string) => {
    const update: IngredientInput = { ...ingredient, amount };
    if (selectedFood) {
      const amt = parseFloat(amount);
      if (amt > 0) {
        const cal = calculateCalories(selectedFood, amt, ingredient.unit);
        if (cal !== null) update.calories = String(cal);
      }
    }
    onChange(update);
  };

  const handleUnitChange = (unit: string) => {
    const update: IngredientInput = { ...ingredient, unit };
    if (selectedFood) {
      const amt = parseFloat(ingredient.amount);
      if (amt > 0) {
        const cal = calculateCalories(selectedFood, amt, unit);
        if (cal !== null) update.calories = String(cal);
      }
    }
    onChange(update);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <TextInput
            style={[styles.input, styles.nameInput]}
            placeholder="Ingredient"
            placeholderTextColor={colors.textSecondary}
            value={ingredient.name}
            onChangeText={name => {
              setSelectedFood(null);
              onChange({ ...ingredient, name });
            }}
            onFocus={() => {
              if (suggestions.length > 0 && ingredient.name.length >= 2) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              // Small delay so tap on suggestion registers
              setTimeout(() => setShowSuggestions(false), 200);
            }}
          />
          {showSuggestions && (
            <View style={styles.suggestionsContainer}>
              <ScrollView
                style={styles.suggestionsList}
                keyboardShouldPersistTaps="always"
                nestedScrollEnabled
              >
                {suggestions.map((food, i) => (
                  <TouchableOpacity
                    key={`${food.name}-${i}`}
                    style={styles.suggestionItem}
                    onPress={() => handleSelectFood(food)}
                  >
                    <Text style={styles.suggestionName}>{food.name}</Text>
                    <Text style={styles.suggestionCal}>
                      {food.calPer100g} kcal/100g
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        {selectedFood && (
          <Text style={styles.calBadge}>{selectedFood.calPer100g}/100g</Text>
        )}
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
          <Text style={styles.removeText}>X</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomRow}>
        <TextInput
          style={[styles.input, styles.smallInput]}
          placeholder="Amt"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          value={ingredient.amount}
          onChangeText={handleAmountChange}
        />
        <View style={styles.unitPicker}>
          {UNITS.map(u => (
            <TouchableOpacity
              key={u}
              style={[styles.unitChip, ingredient.unit === u && styles.unitChipActive]}
              onPress={() => handleUnitChange(u)}
            >
              <Text style={[styles.unitText, ingredient.unit === u && styles.unitTextActive]}>
                {u}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={[styles.input, styles.smallInput]}
          placeholder="kcal"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          value={ingredient.calories}
          onChangeText={calories => onChange({ ...ingredient, calories })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'visible',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: colors.text,
  },
  nameInput: {
    flex: 1,
  },
  smallInput: {
    width: 60,
  },
  removeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  calBadge: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 8,
  },
  unitPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: 4,
  },
  unitChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  unitChipActive: {
    backgroundColor: colors.primary,
  },
  unitText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  unitTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 10,
  },
  suggestionsList: {
    maxHeight: 180,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 10,
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionName: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  suggestionCal: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
  },
});
