import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  Home, 
  Layers, 
  Package, 
  User as UserIcon,
  ShoppingBag
} from 'lucide-react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { CartScreen } from '../screens/CartScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { OrderDetailScreen } from '../screens/OrderDetailScreen';
import { PaymentUploadScreen } from '../screens/PaymentUploadScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Beranda"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Katalog"
        component={ProductsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Layers size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Pesanan"
        component={OrdersScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Package size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <UserIcon size={22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="PaymentUpload" component={PaymentUploadScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
