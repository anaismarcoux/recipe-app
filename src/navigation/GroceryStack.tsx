import React from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GroceryScreen from '../screens/GroceryScreen';
import { colors } from '../constants/colors';

const Stack = createNativeStackNavigator();

export default function GroceryStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Stack.Screen
        name="GroceryList"
        component={GroceryScreen}
        options={{
          headerTitle: () => (
            <Text style={{ fontFamily: 'Pacifico_400Regular', fontSize: 24, color: colors.text }}>
              Grocery List
            </Text>
          ),
        }}
      />
    </Stack.Navigator>
  );
}
