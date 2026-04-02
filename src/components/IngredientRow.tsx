import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text } from 'react-native';
import { colors } from '../constants/colors';

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
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TextInput
          style={[styles.input, styles.nameInput]}
          placeholder="Ingredient"
          placeholderTextColor={colors.textSecondary}
          value={ingredient.name}
          onChangeText={name => onChange({ ...ingredient, name })}
        />
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
          onChangeText={amount => onChange({ ...ingredient, amount })}
        />
        <View style={styles.unitPicker}>
          {UNITS.map(u => (
            <TouchableOpacity
              key={u}
              style={[styles.unitChip, ingredient.unit === u && styles.unitChipActive]}
              onPress={() => onChange({ ...ingredient, unit: u })}
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
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
    marginRight: 8,
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
});
