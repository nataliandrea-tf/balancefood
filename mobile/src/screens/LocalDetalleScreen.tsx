import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useRoute, type RouteProp} from '@react-navigation/native';
import {getRestaurant, MenuItem, RestaurantConMenu} from '../api/restaurants';
import {createExpense} from '../api/expenses';
import {useAuth} from '../context/AuthContext';
import {fechaHoy, formatoCLP} from '../utils/format';
import type {ApiError} from '../api/client';
import type {RootStackParamList} from '../navigation/AppNavigator';

type Ruta = RouteProp<RootStackParamList, 'LocalDetalle'>;

export default function LocalDetalleScreen() {
  const {params} = useRoute<Ruta>();
  const {token, refrescarUsuario} = useAuth();
  const [local, setLocal] = useState<RestaurantConMenu | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrando, setRegistrando] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setLocal(await getRestaurant(params.restaurantId, token));
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setCargando(false);
    }
  }, [params.restaurantId, token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function registrar(item: MenuItem) {
    if (!token) {
      return;
    }
    setRegistrando(item.id);
    try {
      await createExpense(token, {
        amount: item.price,
        description: item.name,
        spent_on: fechaHoy(),
        menu_item_id: item.id,
      });
      await refrescarUsuario();
      Alert.alert('Consumo registrado', `${item.name} — ${formatoCLP(item.price)} se descontó de tu saldo.`);
    } catch (e) {
      Alert.alert('No se pudo registrar', (e as ApiError).message);
    } finally {
      setRegistrando(null);
    }
  }

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#1d9e75" />
      </View>
    );
  }

  if (error || !local) {
    return (
      <View style={styles.centro}>
        <Text style={styles.error}>{error ?? 'No se encontró el local.'}</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.lista}
      data={local.menu_items}
      keyExtractor={i => String(i.id)}
      ListHeaderComponent={
        <View style={styles.cabecera}>
          <Text style={styles.meta}>
            {local.category} · {local.campus}
          </Text>
          <Text style={styles.direccion}>{local.address}</Text>
          {local.description ? <Text style={styles.descripcion}>{local.description}</Text> : null}
          <Text style={styles.subtitulo}>Carta</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.vacio}>Este local no tiene platos cargados.</Text>}
      renderItem={({item}) => (
        <View style={styles.plato}>
          <View style={styles.platoInfo}>
            <Text style={styles.platoNombre}>{item.name}</Text>
            {item.description ? <Text style={styles.platoDesc}>{item.description}</Text> : null}
            <Text style={styles.precio}>{formatoCLP(item.price)}</Text>
          </View>
          {item.available ? (
            <TouchableOpacity
              style={styles.botonRegistrar}
              disabled={registrando === item.id}
              onPress={() => registrar(item)}>
              {registrando === item.id ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.botonRegistrarTexto}>Registrar</Text>
              )}
            </TouchableOpacity>
          ) : (
            <Text style={styles.noDisponible}>No disponible</Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  centro: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24},
  lista: {padding: 16},
  cabecera: {marginBottom: 12},
  meta: {fontSize: 14, color: '#1d9e75', fontWeight: '600'},
  direccion: {fontSize: 13, color: '#6b7280', marginTop: 4},
  descripcion: {fontSize: 14, color: '#374151', marginTop: 8},
  subtitulo: {fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 20},
  plato: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  platoInfo: {flex: 1, paddingRight: 12},
  platoNombre: {fontSize: 16, fontWeight: '600', color: '#111827'},
  platoDesc: {fontSize: 13, color: '#6b7280', marginTop: 2},
  precio: {fontSize: 15, fontWeight: '700', color: '#1d9e75', marginTop: 6},
  botonRegistrar: {backgroundColor: '#1d9e75', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10},
  botonRegistrarTexto: {color: '#fff', fontWeight: '600'},
  noDisponible: {color: '#9ca3af', fontSize: 13, fontStyle: 'italic'},
  vacio: {textAlign: 'center', color: '#6b7280', marginTop: 20},
  error: {color: '#b91c1c', textAlign: 'center'},
});
