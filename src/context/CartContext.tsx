import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = '@printwere_cart_items';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(CART_STORAGE_KEY).then((data) => {
      if (data) {
        try {
          setItems(JSON.parse(data));
        } catch {}
      }
    });
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
  };

  const addToCart = (newItem: CartItem) => {
    const existingIndex = items.findIndex(
      (it) =>
        it.productId === newItem.productId &&
        it.width === newItem.width &&
        it.height === newItem.height &&
        JSON.stringify(it.options || {}) === JSON.stringify(newItem.options || {})
    );

    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += newItem.quantity;
      saveCart(updated);
    } else {
      saveCart([...items, newItem]);
    }
  };

  const removeFromCart = (index: number) => {
    const updated = items.filter((_, idx) => idx !== index);
    saveCart(updated);
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    const updated = [...items];
    updated[index].quantity = quantity;
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const totalAmount = items.reduce((sum, item) => {
    let itemPrice = item.price;
    if (item.product?.priceType === 'M2' && item.width && item.height) {
      const area = item.width * item.height;
      itemPrice = item.price * area;
    }
    return sum + itemPrice * item.quantity;
  }, 0);

  const totalItems = items.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
