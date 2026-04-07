import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, TextInput, TouchableOpacity, Text,
  ScrollView, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { searchFoods, calculateCalories, FoodEntry } from '../data/foodDatabase';
import { useCustomFoodStore } from '../store/customFoodStore';

interface IngredientInput {
  name: string;
  amount: string;
  unit: string;
  grams: string;
  calories: string;
  prep: string;
}

interface Props {
  ingredient: IngredientInput;
  onChange: (updated: IngredientInput) => void;
  onRemove: () => void;
}

const UNITS = ['g', 'ml', 'cups', 'tbsp', 'tsp', 'pcs', 'oz', 'lb'];

function calcCalFromGrams(food: FoodEntry, grams: number): number {
  return Math.round((grams / 100) * food.calPer100g);
}

export default function IngredientRow({ ingredient, onChange, onRemove }: Props) {
  const [suggestions, setSuggestions] = useState<FoodEntry[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodEntry | null>(null);
  const ignoreNextSearch = useRef(false);

  // Custom food modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCal, setCustomCal] = useState('');
  const [customGramsCup, setCustomGramsCup] = useState('');
  const [customError, setCustomError] = useState('');

  const { load: loadCustom, searchCustom, add: addCustom } = useCustomFoodStore();

  useEffect(() => {
    loadCustom();
  }, []);

  // Search both built-in and custom foods
  useEffect(() => {
    if (ignoreNextSearch.current) {
      ignoreNextSearch.current = false;
      return;
    }
    const builtIn = searchFoods(ingredient.name);
    const custom = searchCustom(ingredient.name);
    const combined = [...custom, ...builtIn].slice(0, 8);
    setSuggestions(combined);
    setShowSuggestions(combined.length > 0 && ingredient.name.length >= 2);
  }, [ingredient.name]);

  // Recalculate calories when grams changes (grams is the source of truth for calories)
  const recalcFromGrams = (food: FoodEntry | null, grams: string): string | null => {
    if (!food) return null;
    const g = parseFloat(grams);
    if (!g || g <= 0) return null;
    return String(calcCalFromGrams(food, g));
  };

  const handleSelectFood = (food: FoodEntry) => {
    ignoreNextSearch.current = true;
    setSelectedFood(food);
    setShowSuggestions(false);
    setSuggestions([]);

    const update: IngredientInput = { ...ingredient, name: food.name };

    // If grams is filled, calculate calories from grams
    const g = parseFloat(ingredient.grams);
    if (g > 0) {
      update.calories = String(calcCalFromGrams(food, g));
    } else {
      // Try calculating from amount+unit
      const amt = parseFloat(ingredient.amount);
      if (amt > 0) {
        const cal = calculateCalories(food, amt, ingredient.unit);
        if (cal !== null) update.calories = String(cal);
      }
    }
    onChange(update);
  };

  const handleAmountChange = (amount: string) => {
    const update: IngredientInput = { ...ingredient, amount };
    // Only recalc from amount if no grams specified
    if (selectedFood && !parseFloat(ingredient.grams)) {
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
    // If switching to 'g', sync grams field with amount
    if (unit === 'g' && parseFloat(ingredient.amount) > 0) {
      update.grams = ingredient.amount;
      if (selectedFood) {
        const cal = recalcFromGrams(selectedFood, ingredient.amount);
        if (cal) update.calories = cal;
      }
    } else if (selectedFood && !parseFloat(ingredient.grams)) {
      const amt = parseFloat(ingredient.amount);
      if (amt > 0) {
        const cal = calculateCalories(selectedFood, amt, unit);
        if (cal !== null) update.calories = String(cal);
      }
    }
    onChange(update);
  };

  const handleGramsChange = (grams: string) => {
    const update: IngredientInput = { ...ingredient, grams };
    if (selectedFood) {
      const cal = recalcFromGrams(selectedFood, grams);
      if (cal) update.calories = cal;
    }
    onChange(update);
  };

  const openAddModal = () => {
    setCustomName(ingredient.name);
    setCustomCal('');
    setCustomGramsCup('');
    setCustomError('');
    setShowSuggestions(false);
    setShowAddModal(true);
  };

  const handleSaveCustom = async () => {
    const cal = parseFloat(customCal);
    if (!customName.trim()) { setCustomError('Enter a name'); return; }
    if (!cal || cal <= 0) { setCustomError('Enter calories per 100g'); return; }
    const gpc = parseFloat(customGramsCup) || null;
    try {
      const food = await addCustom(customName.trim(), cal, gpc);
      setShowAddModal(false);
      handleSelectFood(food);
    } catch (e: any) {
      setCustomError(e?.message || 'Failed to save custom food');
    }
  };

  // Show grams field when unit is NOT already grams
  const showGramsField = ingredient.unit !== 'g';

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
                    <Text style={styles.suggestionName}>
                      {food.category === 'Custom' ? '* ' : ''}{food.name}
                    </Text>
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
        {!selectedFood && ingredient.name.length >= 2 && (
          <TouchableOpacity
            style={styles.addCustomBtn}
            onPress={openAddModal}
          >
            <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
          <Text style={styles.removeText}>X</Text>
        </TouchableOpacity>
      </View>

      {/* Prep / description */}
      <TextInput
        style={[styles.input, styles.prepInput]}
        placeholder="e.g. medium, chopped, finely diced"
        placeholderTextColor={colors.textSecondary}
        value={ingredient.prep}
        onChangeText={prep => onChange({ ...ingredient, prep })}
      />

      {/* Amount + unit row */}
      <View style={styles.bottomRow}>
        <TextInput
          style={[styles.input, styles.smallInput]}
          placeholder="Amt"
          placeholderTextColor={colors.textSecondary}
          keyboardType="decimal-pad"
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
      </View>

      {/* Grams + kcal row */}
      <View style={styles.gramsRow}>
        {showGramsField && (
          <View style={styles.gramsInputWrap}>
            <TextInput
              style={[styles.input, styles.gramsInput]}
              placeholder="grams"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              value={ingredient.grams}
              onChangeText={handleGramsChange}
            />
            <Text style={styles.gramsLabel}>g</Text>
          </View>
        )}
        <View style={{ flex: 1 }} />
        <TextInput
          style={[styles.input, styles.kcalInput]}
          placeholder="kcal"
          placeholderTextColor={colors.textSecondary}
          keyboardType="decimal-pad"
          value={ingredient.calories}
          onChangeText={calories => onChange({ ...ingredient, calories })}
        />
      </View>

      {/* Add custom food modal */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Custom Food</Text>

            <Text style={styles.modalLabel}>Name</Text>
            <TextInput
              style={styles.modalInput}
              value={customName}
              onChangeText={setCustomName}
              placeholder="Food name"
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />

            <Text style={styles.modalLabel}>Calories per 100g</Text>
            <TextInput
              style={styles.modalInput}
              value={customCal}
              onChangeText={setCustomCal}
              placeholder="e.g. 250"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />

            <Text style={styles.modalLabel}>Grams per cup (optional)</Text>
            <TextInput
              style={styles.modalInput}
              value={customGramsCup}
              onChangeText={setCustomGramsCup}
              placeholder="e.g. 150"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />

            {customError ? <Text style={styles.modalError}>{customError}</Text> : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveCustom}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 6,
  },
  gramsRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  prepInput: {
    marginBottom: 6,
    fontSize: 13,
    paddingVertical: 5,
    fontStyle: 'italic',
  },
  smallInput: {
    width: 60,
  },
  gramsInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  gramsInput: {
    width: 60,
  },
  gramsLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  kcalInput: {
    width: 60,
    textAlign: 'right',
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
    maxHeight: 220,
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
  addCustomBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: colors.text,
    backgroundColor: '#F5F5F5',
  },
  modalError: {
    color: '#D32F2F',
    fontSize: 13,
    marginTop: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalCancelText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalSaveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalSaveText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '700',
  },
});
