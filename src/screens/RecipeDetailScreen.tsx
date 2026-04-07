import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, Alert, TouchableOpacity, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { useRecipeStore } from '../store/recipeStore';
import { RecipeWithIngredients } from '../types';
import CalorieSummary from '../components/CalorieSummary';
import { toFraction } from '../utils/calorieCalculator';

export default function RecipeDetailScreen({ route, navigation }: any) {
  const { recipeId } = route.params;
  const { getWithIngredients, remove } = useRecipeStore();
  const [recipe, setRecipe] = useState<RecipeWithIngredients | null>(null);

  useFocusEffect(
    useCallback(() => {
      getWithIngredients(recipeId).then(setRecipe);
    }, [recipeId])
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleEdit} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
            <Text style={[styles.headerBtnText, { color: colors.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [recipe]);

  const handleEdit = () => {
    if (recipe) {
      navigation.navigate('AddEditRecipe', { recipeId: recipe.id });
    }
  };

  const handleDelete = async () => {
    if (!recipe) return;
    if (Platform.OS === 'web') {
      if (confirm(`Delete "${recipe.title}"?`)) {
        await remove(recipe.id);
        navigation.goBack();
      }
    } else {
      Alert.alert('Delete Recipe', `Delete "${recipe.title}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await remove(recipe.id);
            navigation.goBack();
          },
        },
      ]);
    }
  };

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const steps = recipe.steps.split('\n').filter(s => s.trim());

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {recipe.imageUri ? (
        <Image source={{ uri: recipe.imageUri }} style={styles.heroImage} />
      ) : (
        <View style={styles.heroPlaceholder}>
          <Text style={styles.placeholderEmoji}>🍽️</Text>
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.title}>{recipe.title}</Text>

        {recipe.about ? (
          <Text style={styles.aboutText}>{recipe.about}</Text>
        ) : null}

        {recipe.yieldAmount != null && (
          <Text style={styles.meta}>
            Makes: {recipe.yieldAmount} {recipe.yieldUnit || 'servings'}
          </Text>
        )}

        {recipe.ingredients.length > 0 && (() => {
          let lastGroup: string | null = null;
          return (
            <>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              {recipe.ingredients.map((ing, i) => {
                const showGroup = ing.groupName && ing.groupName !== lastGroup;
                lastGroup = ing.groupName;
                const amountPart = ing.amount > 0 ? `${toFraction(ing.amount)} ${ing.unit}` : '';
                const prepPart = ing.prep ? `, ${ing.prep}` : '';
                const gramsPart = ing.grams && ing.unit !== 'g' ? `(${ing.grams}g)` : '';
                const label = [amountPart, ing.name].filter(Boolean).join(' ') + prepPart + (gramsPart ? ` ${gramsPart}` : '');
                return (
                  <React.Fragment key={ing.id}>
                    {showGroup && (
                      <Text style={styles.groupHeader}>{ing.groupName}</Text>
                    )}
                    <View style={styles.ingredientRow}>
                      <Text style={styles.ingredientText}>{label}</Text>
                      <Text style={styles.ingredientCal}>{ing.calories} kcal</Text>
                    </View>
                  </React.Fragment>
                );
              })}
            </>
          );
        })()}

        {steps.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Steps</Text>
            {steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <Text style={styles.stepNumber}>{i + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </>
        )}

        {recipe.notes ? (
          <>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{recipe.notes}</Text>
          </>
        ) : null}

        <CalorieSummary
          ingredients={recipe.ingredients}
          yieldAmount={recipe.yieldAmount}
          yieldUnit={recipe.yieldUnit}
          totalWeightGrams={recipe.totalWeightGrams}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.textSecondary,
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  heroPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 60,
  },
  body: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  meta: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  groupHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 12,
    marginBottom: 4,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ingredientText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  ingredientCal: {
    fontSize: 14,
    color: colors.calorieOrange,
    fontWeight: '600',
    marginLeft: 12,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '700',
    fontSize: 14,
    marginRight: 12,
    overflow: 'hidden',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  notesText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerBtn: {
    paddingHorizontal: 8,
  },
  headerBtnText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});
