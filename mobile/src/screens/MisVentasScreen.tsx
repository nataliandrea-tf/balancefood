import React, {useCallback, useState} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {getVentas, Venta} from '../api/restaurants';
import {useAuth} from '../context/AuthContext';
import {formatoCLP} from '../utils/format';
import type {ApiError} from '../api/client';

// Pantalla del locatario: muestra los consumos que los estudiantes
// registraron en los platos de sus locales (sus ventas) y el total.
export default function MisVentasScreen() {
  const {token} = useAuth();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!token) {
      return;
    }
    setCargando(true);
    setError(null);
    try {
      const data = await getVentas(token);
      setVentas(data.ventas);
      setTotal(data.total);
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setCargando(false);
    }
  }, [token]);

  // Recarga al tomar foco para reflejar ventas nuevas.
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#1d9e75" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centro}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.lista}
      data={ventas}
      keyExtractor={i => String(i.id)}
      ListHeaderComponent={
        <View style={styles.resumen}>
          <Text style={styles.etiqueta}>Total vendido</Text>
          <Text style={styles.total}>{formatoCLP(total)}</Text>
          <Text style={styles.sub}>{ventas.length} consumo(s) registrado(s)</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.vacio}>Aún no hay ventas en tu local.</Text>}
      renderItem={({item}) => (
        <View style={styles.venta}>
          <View style={styles.ventaInfo}>
            <Text style={styles.plato}>{item.plato ?? 'Consumo'}</Text>
            <Text style={styles.fecha}>{item.spent_on}</Text>
          </View>
          <Text style={styles.monto}>{formatoCLP(item.amount)}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  centro: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24},
  lista: {padding: 16},
  resumen: {backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 16},
  etiqueta: {fontSize: 14, color: '#6b7280'},
  total: {fontSize: 32, fontWeight: '700', color: '#1d9e75', marginTop: 2},
  sub: {fontSize: 13, color: '#6b7280', marginTop: 8},
  venta: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ventaInfo: {flex: 1},
  plato: {fontSize: 15, fontWeight: '600', color: '#111827'},
  fecha: {fontSize: 12, color: '#9ca3af', marginTop: 2},
  monto: {fontSize: 15, fontWeight: '700', color: '#1d9e75'},
  vacio: {textAlign: 'center', color: '#6b7280', marginTop: 20},
  error: {color: '#b91c1c', textAlign: 'center'},
});
