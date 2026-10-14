import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavorite } from '../redux/favoritesSlice';
import { Ionicons } from '@expo/vector-icons';

export default function MarketScreen({ navigation }) {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const dispatch = useDispatch();
  const favorites = useSelector(state => state.favorites.items);

  const fetchCoins = () => {
    setLoading(true);
    setError(false);
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=1')
      .then(res => {
        if (!res.ok) throw new Error('Rate limit');
        return res.json();
      })
      .then(data => {
        setCoins(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCoins();
  }, []);

  const renderItem = ({ item }) => {
    const isFavorite = favorites.some(fav => fav.id === item.id);

    return (
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
          <Ionicons 
            name={isFavorite ? "star" : "star-outline"} 
            size={24} 
            color={isFavorite ? "#FCD34D" : "#94A3B8"} 
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="warning-outline" size={48} color="#EF4444" style={{ marginBottom: 16 }} />
        <Text style={styles.errorText}>Забагато запитів до сервера.</Text>
        <Text style={styles.errorSubText}>Зачекайте хвилину і спробуйте ще раз.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCoins}>
          <Text style={styles.retryText}>Оновити</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={coins}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  center: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1E293B', alignItems: 'center' },
  image: { width: 40, height: 40, marginRight: 12 },
  info: { flex: 1 },
  name: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  symbol: { color: '#94A3B8', fontSize: 14 },
  priceContainer: { alignItems: 'flex-end', marginRight: 16 },
  price: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  change: { fontSize: 14 },
  starButton: { padding: 4 },
  errorText: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  errorSubText: { color: '#94A3B8', fontSize: 14, textAlign: 'center', marginBottom: 24 },
  retryButton: { backgroundColor: '#38BDF8', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryText: { color: '#0F172A', fontWeight: 'bold', fontSize: 16 }
});