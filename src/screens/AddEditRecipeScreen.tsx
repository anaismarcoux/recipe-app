import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { generateId } from '../utils/uuid';
import { colors } from '../constants/colors';
import { useRecipeStore } from '../store/recipeStore';
import { useCategoryStore } from '../store/categoryStore';
import IngredientRow from '../components/IngredientRow';
import { totalCalories } from '../utils/calorieCalculator';

interface IngredientInput {
  name: string;
  amount: string;
  unit: string;
  calories: string;
}

const emptyIngredient = (): IngredientInput => ({
  name: '', amount: '', unit: 'g', calories: '',
});

export default function AddEditRecipeScreen({ route, navigation }: any) {
  const { categoryId, recipeId } = route.params || {};
  const { add, update, getWithIngredients } = useRecipeStore();
  const { categories } = useCategoryStore();

  const [title, setTitle] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId || '');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [about, setAbout] = useState('');
  const [ingredients, setIngredients] = useState<IngredientInput[]>([emptyIngredient()]);
  const [steps, setSteps] = useState('');
  const [yieldAmount, setYieldAmount] = useState('');
  const [yieldUnit, setYieldUnit] = useState('');
  const [totalWeight, setTotalWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (recipeId) {
      navigation.setOptions({ title: 'Edit Recipe' });
      getWithIngredients(recipeId).then(r => {
        if (!r) return;
        setTitle(r.title);
        setSelectedCategoryId(r.categoryId);
        setImageUri(r.imageUri);
        setAbout(r.about || '');
        setSteps(r.steps);
        setYieldAmount(r.yieldAmount?.toString() || '');
        setYieldUnit(r.yieldUnit || '');
        setTotalWeight(r.totalWeightGrams?.toString() || '');
        setNotes(r.notes || '');
        if (r.ingredients.length > 0) {
          setIngredients(r.ingredients.map(ing => ({
            name: ing.name,
            amount: ing.amount.toString(),
            unit: ing.unit,
            calories: ing.calories.toString(),
          })));
        }
      });
    } else {
      navigation.setOptions({ title: 'New Recipe' });
    }
  }, [recipeId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const updateIngredient = (index: number, updated: IngredientInput) => {
    const copy = [...ingredients];
    copy[index] = updated;
    setIngredients(copy);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length === 1) {
      setIngredients([emptyIngredient()]);
    } else {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, emptyIngredient()]);
  };

  const runningTotal = ingredients.reduce(
    (sum, ing) => sum + (parseFloat(ing.calories) || 0), 0
  );

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a recipe title');
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setSaving(true);
    try {
      const recipeData = {
        categoryId: selectedCategoryId,
        title: title.trim(),
        imageUri,
        about: about.trim() || null,
        steps: steps.trim(),

        notes: notes.trim() || null,
        yieldAmount: yieldAmount ? parseFloat(yieldAmount) : null,
        yieldUnit: yieldUnit.trim() || null,
        totalWeightGrams: totalWeight ? parseFloat(totalWeight) : null,
      };

      const ingredientData = ingredients
        .filter(ing => ing.name.trim())
        .map(ing => ({
          name: ing.name.trim(),
          amount: parseFloat(ing.amount) || 0,
          unit: ing.unit,
          calories: parseFloat(ing.calories) || 0,
          sortOrder: 0,
        }));

      if (recipeId) {
        const existing = await getWithIngredients(recipeId);
        if (existing) {
          await update({ ...existing, ...recipeData }, ingredientData);
        }
      } else {
        await add(recipeData, ingredientData);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="Recipe name"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, selectedCategoryId === cat.id && styles.categoryChipActive]}
              onPress={() => setSelectedCategoryId(cat.id)}
            >
              <Text style={styles.categoryChipText}>{cat.emoji} {cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
          <Text style={styles.imageBtnText}>
            {imageUri ? 'Change Photo' : 'Add Photo'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>About</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Short description of the recipe..."
          placeholderTextColor={colors.textSecondary}
          multiline
          value={about}
          onChangeText={setAbout}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.label}>Ingredients</Text>
          <Text style={styles.runningTotal}>{Math.round(runningTotal)} kcal total</Text>
        </View>

        {ingredients.map((ing, i) => (
          <View key={i} style={{ zIndex: ingredients.length - i }}>
            <IngredientRow
              ingredient={ing}
              onChange={updated => updateIngredient(i, updated)}
              onRemove={() => removeIngredient(i)}
            />
          </View>
        ))}
        <TouchableOpacity style={styles.addIngBtn} onPress={addIngredient}>
          <Text style={styles.addIngText}>+ Add Ingredient</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Steps (one per line)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="1. Preheat oven to 180C\n2. Mix dry ingredients..."
          placeholderTextColor={colors.textSecondary}
          multiline
          value={steps}
          onChangeText={setSteps}
        />

        <Text style={styles.sectionTitle}>Calorie Calculator</Text>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Yield Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 12"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={yieldAmount}
              onChangeText={setYieldAmount}
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Yield Unit</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. muffins"
              placeholderTextColor={colors.textSecondary}
              value={yieldUnit}
              onChangeText={setYieldUnit}
            />
          </View>
        </View>

        <Text style={styles.label}>Total Weight (grams)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 600"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          value={totalWeight}
          onChangeText={setTotalWeight}
        />

        {runningTotal > 0 && (
          <View style={styles.calcPreview}>
            <Text style={styles.calcText}>Total: {Math.round(runningTotal)} kcal</Text>
            {yieldAmount ? (
              <Text style={styles.calcText}>
                Per {yieldUnit || 'unit'}: {Math.round(runningTotal / parseFloat(yieldAmount))} kcal
              </Text>
            ) : null}
            {totalWeight ? (
              <Text style={styles.calcText}>
                Per 100g: {Math.round((runningTotal / parseFloat(totalWeight)) * 100)} kcal
              </Text>
            ) : null}
          </View>
        )}

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any additional notes..."
          placeholderTextColor={colors.textSecondary}
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Recipe'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: colors.text,
  },
  imageBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  imageBtnText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  runningTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.calorieOrange,
    marginTop: 12,
  },
  addIngBtn: {
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  addIngText: {
    color: colors.primary,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  calcPreview: {
    backgroundColor: colors.secondaryLight,
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
    gap: 4,
  },
  calcText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.calorieOrange,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
