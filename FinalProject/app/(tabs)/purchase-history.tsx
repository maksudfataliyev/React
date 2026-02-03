import React, { useState, useCallback } from "react";
import { 
  View, Text, StyleSheet, FlatList, Pressable, 
  SafeAreaView, Platform, StatusBar, Image, Modal, ScrollView 
} from "react-native";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from "../contexts/ThemeContext";
import { orderService } from "../utils/OrderService";
import { OrderItem } from "../constants/order-history";

export default function PurchaseHistory() {
  const router = useRouter();
  const { theme } = useTheme();
  
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadOrders = async () => {
        const userData = await AsyncStorage.getItem("currentUser");
        const id = userData ? JSON.parse(userData).id || JSON.parse(userData).email : 'guest';
        const history = await orderService.getOrders(id);
        setOrders(history);
      };
      loadOrders();
    }, [])
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Completed: "#4CD964",
    };
    return colors[status] || theme.textMuted;
  };

  const renderOrder = ({ item }: { item: OrderItem }) => (
    <Pressable 
      style={[styles.orderCard, { backgroundColor: theme.card }]} 
      onPress={() => { setSelectedOrder(item); setShowDetails(true); }}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      
      <View style={styles.cardInfo}>
        <View style={styles.rowBetween}>
          <Text style={[styles.primaryText, { color: theme.text }]} numberOfLines={1}>
            {item.products[0]?.name || "Order"}
          </Text>
          <Text style={[styles.priceText, { color: theme.primary }]}>
            ${item.total.toFixed(2)}
          </Text>
        </View>

        <Text style={[styles.secondaryText, { color: theme.textMuted }]}>
          {item.date} • {item.id}
        </Text>

        <View style={styles.rowBetween}>
          <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.navbar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.navTitle, { color: theme.text }]}>Orders</Text>
        <View style={styles.spacer} />
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={showDetails} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.background }]}>
            
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Order Details</Text>
              <Pressable onPress={() => setShowDetails(false)}>
                <Ionicons name="close-circle" size={32} color={theme.textMuted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[styles.detailBlock, { backgroundColor: theme.card }]}>
                <InfoRow label="Order ID" value={selectedOrder?.id} theme={theme} />
                <InfoRow label="Date" value={selectedOrder?.date} theme={theme} />
                <InfoRow 
                  label="Status" 
                  value={selectedOrder?.status} 
                  theme={theme} 
                  color={getStatusColor(selectedOrder?.status || "")} 
                />
              </View>

              <View style={[styles.detailBlock, { backgroundColor: theme.card }]}>
                {selectedOrder?.products.map((prod, index) => (
                  <View key={index} style={styles.productItem}>
                    <Text style={{ color: theme.text, flex: 1 }}>{prod.quantity}x {prod.name}</Text>
                    <Text style={{ color: theme.text, fontWeight: '700' }}>
                      ${(prod.price * prod.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={[styles.detailBlock, { backgroundColor: theme.card }]}>
                <InfoRow label="Subtotal" value={`$${selectedOrder?.subtotal.toFixed(2)}`} theme={theme} />
                <InfoRow label="Delivery Fee" value={`$${selectedOrder?.deliveryFee.toFixed(2)}`} theme={theme} />
                <View style={styles.divider} />
                <View style={styles.rowBetween}>
                  <Text style={[styles.totalLabel, { color: theme.text }]}>Total</Text>
                  <Text style={[styles.totalAmount, { color: theme.primary }]}>
                    ${selectedOrder?.total.toFixed(2)}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value, theme, color }: any) => (
  <View style={styles.infoRow}>
    <Text style={{ color: theme.textMuted }}>{label}</Text>
    <Text style={{ color: color || theme.text, fontWeight: '700' }}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  listPadding: {
    padding: 16,
  },
  spacer: {
    width: 40,
  },
  iconBtn: {
    padding: 8,
  },

  /* Order Card */
  orderCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: 85,
    height: 85,
    borderRadius: 15,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '700',
    flex: 0.8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryText: {
    fontSize: 12,
    marginVertical: 4,
  },

  /* Status Badge */
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '85%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  detailBlock: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150,150,150,0.2)',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '800',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '900',
  },
});