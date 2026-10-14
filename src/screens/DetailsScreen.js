import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavorite } from '../redux/favoritesSlice';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

export default function DetailsScreen({ route }) {
  const { coin } = route.params;
  const dispatch = useDispatch();
  const favorites = useSelector(state => state.favorites.items);
  
  const isFavorite = favorites.some(item => item.id === coin.id);

  const [prices, setPrices] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [timeframe, setTimeframe] = useState('7');
  const [chartError, setChartError] = useState(false);

  const timeframes = [
    { label: '24H', value: '1' },
    { label: '7D', value: '7' },
    { label: '30D', value: '30' },
    { label: '1Y', value: '365' }
  ];

  useEffect(() => {
    setLoadingChart(true);
    setChartError(false);
    fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=${timeframe}`)
      .then(res => {
        if (!res.ok) throw new Error('Rate limit');
        return res.json();
      })
      .then(data => {
        if (data.prices) {
          const step = Math.max(1, Math.floor(data.prices.length / 30));
          const formattedPrices = data.prices
            .filter((_, index) => index % step === 0)
            .map(item => item[1]);
          setPrices(formattedPrices);
        }
        setLoadingChart(false);
      })
      .catch(() => {
        setChartError(true);
        setLoadingChart(false);
      });
  }, [coin.id, timeframe]);

  let chartColor = coin.price_change_percentage_24h >= 0 ? "rgba(74, 222, 128, 1)" : "rgba(248, 113, 113, 1)";
  
  if (prices.length > 0) {
    chartColor = prices[prices.length - 1] >= prices[0] ? "rgba(74, 222, 128, 1)" : "rgba(248, 113, 113, 1)";
  }
  
  let decimals = 0;
  if (coin.current_price < 0.01) decimals = 6;
  else if (coin.current_price < 1) decimals = 4;
  else if (coin.current_price < 100) decimals = 2;

  return (
    <ScrollView style={styles.container} bounces={false}>
      <View style={styles.header}>
        <Image source={{ uri: coin.image }} style={styles.image} />
        <View style={styles.titleContainer}>
          <Text style={styles.name}>{coin.name}</Text>
          <Text style={styles.symbol}>{coin.symbol.toUpperCase()}</Text>
        </View>
        <TouchableOpacity onPress={() => dispatch(toggleFavorite(coin))}>
          <Ionicons 
            name={isFavorite ? "star" : "star-outline"} 
            size={32} 
            color={isFavorite ? "#FCD34D" : "#94A3B8"} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Поточна ціна:</Text>
          <Text style={styles.statValue}>${coin.current_price}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Зміна (24h):</Text>
          <Text style={[styles.statValue, { color: coin.price_change_percentage_24h > 0 ? '#4ADE80' : '#F87171' }]}>
            {coin.price_change_percentage_24h?.toFixed(2)}%
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Капіталізація:</Text>
          <Text style={styles.statValue}>${coin.market_cap?.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.timeframeContainer}>
        {timeframes.map((tf) => (
          <TouchableOpacity 
            key={tf.value} 
            style={[styles.tfButton, timeframe === tf.value && styles.tfButtonActive]}
            onPress={() => setTimeframe(tf.value)}
          >
            <Text style={[styles.tfText, timeframe === tf.value && styles.tfTextActive]}>
              {tf.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {loadingChart ? (
        <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 40 }} />
      ) : chartError ? (
        <View style={styles.chartErrorContainer}>
          <Text style={styles.errorText}>Ліміт запитів вичерпано ⏳</Text>
          <Text style={styles.errorSubText}>Зачекайте пару хвилин</Text>
        </View>
      ) : prices.length > 0 ? (
        <LineChart
          data={{
            labels: [],
            datasets: [{ data: prices }]
          }}
          width={Dimensions.get("window").width - 40}
          height={220}
          yAxisLabel="$"
          withDots={false}
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLabels={false}
          chartConfig={{
            backgroundColor: "#1E293B",
            backgroundGradientFrom: "#1E293B",
            backgroundGradientTo: "#1E293B",
            decimalPlaces: decimals,
            color: () => chartColor,
            labelColor: () => "#94A3B8",
            style: { borderRadius: 12 },
          }}
          bezier
          style={styles.chart}
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  image: { width: 60, height: 60, marginRight: 16 },
  titleContainer: { flex: 1 },
  name: { color: '#F8FAFC', fontSize: 24, fontWeight: 'bold' },
  symbol: { color: '#94A3B8', fontSize: 16 },
  statsContainer: { width: '100%', backgroundColor: '#1E293B', borderRadius: 12, padding: 16, marginBottom: 20 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statLabel: { color: '#94A3B8', fontSize: 16 },
  statValue: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  timeframeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, backgroundColor: '#1E293B', borderRadius: 8, padding: 4 },
  tfButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  tfButtonActive: { backgroundColor: '#334155' },
  tfText: { color: '#94A3B8', fontSize: 14, fontWeight: 'bold' },
  tfTextActive: { color: '#38BDF8' },
  chart: { marginVertical: 8, borderRadius: 12 },
  chartErrorContainer: { alignItems: 'center', marginTop: 40 },
  errorText: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  errorSubText: { color: '#94A3B8', fontSize: 14 }
});