import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {getRestaurants, Restaurant} from '../api/restaurants';
import {useAuth} from '../context/AuthContext';
import type {ApiError} from '../api/client';
import type {RootStackParamList} from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Locales'>;

export default function LocalesScreen() {
  const navigation = useNavigation<Nav>();
  const {token} = useAuth();
  const [locales, setLocales] = useState<Restaurant[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setLocales(await getRestaurants(token));
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

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
        <TouchableOpacity onPress={cargar}>
          <Text style={styles.reintentar}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.lista}
      data={locales}
      keyExtractor={item => String(item.id)}
      ListEmptyComponent={<Text style={styles.vacio}>No hay locales todavía.</Text>}
      renderItem={({item}) => (
        <TouchableOpacity
          style={styles.tarjeta}
          onPress={() =>
            navigation.navigate('LocalDetalle', {restaurantId: item.id, nombre: item.name})
          }>
          <Text style={styles.nombre}>{item.name}</Text>
          <Text style={styles.meta}>
            {item.category} · {item.campus}
          </Text>
          {item.description ? (
            <Text style={styles.desc} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  centro: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24},
  lista: {padding: 16},
  tarjeta: {backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12},
  nombre: {fontSize: 17, fontWeight: '600', color: '#111827'},
  meta: {fontSize: 13, color: '#1d9e75', marginTop: 2},
  desc: {fontSize: 13, color: '#6b7280', marginTop: 6},
  vacio: {textAlign: 'center', color: '#6b7280', marginTop: 40},
  error: {color: '#b91c1c', textAlign: 'center', marginBottom: 12},
  reintentar: {color: '#1d9e75', fontWeight: '600'},
});
