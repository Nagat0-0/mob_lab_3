import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavorite } from '../redux/favoritesSlice';
import { Ionicons } from '@expo/vector-icons';

export default function FavoritesScreen({ navigation }) {
  const favorites = useSelector(state => state.favorites.items);
  const dispatch = useDispatch();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Details', { coin: item })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.symbol}>{item.symbol.toUpperCase()}</Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>${item.current_price}</Text>
        <Text style={[styles.change, { color: item.price_change_percentage_24h > 0 ? '#4ADE80' : '#F87171' }]}>
          {item.price_change_percentage_24h?.toFixed(2)}%
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.starButton} 
        onPress={() => dispatch(toggleFavorite(item))}
      >
        <Ionicons name="star" size={24} color="#FCD34D" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (favorites.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="star-outline" size={48} color="#334155" style={{ marginBottom: 16 }} />
        <Text style={styles.emptyText}>Ви ще не додали жодної монети</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  center: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16 },
  card: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1E293B', alignItems: 'center' },
  image: { width: 40, height: 40, marginRight: 12 },
  info: { flex: 1 },
  name: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  symbol: { color: '#94A3B8', fontSize: 14 },
  priceContainer: { alignItems: 'flex-end', marginRight: 16 },
  price: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  change: { fontSize: 14 },
  starButton: { padding: 4 }
});