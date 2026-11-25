import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  createMenuItem,
  getMisLocales,
  getRestaurant,
  MenuItem,
  Restaurant,
} from '../api/restaurants';
import {useAuth} from '../context/AuthContext';
import {formatoCLP} from '../utils/format';
import type {ApiError} from '../api/client';

// Pantalla del locatario: muestra su local y su carta, y permite agregar
// platos. La API solo deja crear platos en un local propio (por eso esta
// pantalla se ofrece únicamente a usuarios con rol locatario).
export default function MiLocalScreen() {
  const {token} = useAuth();
  const [local, setLocal] = useState<Restaurant | null>(null);
  const [platos, setPlatos] = useState<MenuItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Campos del formulario de nuevo plato.
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    if (!token) {
      return;
    }
    setCargando(true);
    setError(null);
    try {
      const locales = await getMisLocales(token);
      if (locales.length === 0) {
        setLocal(null);
        return;
      }
      const miLocal = locales[0];
      setLocal(miLocal);
      const conMenu = await getRestaurant(miLocal.id, token);
      setPlatos(conMenu.menu_items);
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function agregarPlato() {
    if (!token || !local) {
      return;
    }
    const monto = parseInt(precio, 10);
    if (!nombre.trim() || !Number.isFinite(monto) || monto <= 0) {
      Alert.alert('Datos incompletos', 'Ingresa un nombre y un precio mayor a 0.');
      return;
    }
    setGuardando(true);
    try {
      await createMenuItem(token, local.id, {name: nombre.trim(), price: monto});
      setNombre('');
      setPrecio('');
      await cargar();
      Alert.alert('Plato agregado', `${nombre.trim()} se agregó a la carta.`);
    } catch (e) {
      Alert.alert('No se pudo agregar', (e as ApiError).message);
    } finally {
      setGuardando(false);
    }
  }

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

  if (!local) {
    return (
      <View style={styles.centro}>
        <Text style={styles.vacio}>No tienes un local asignado todavía.</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.lista}
      data={platos}
      keyExtractor={i => String(i.id)}
      ListHeaderComponent={
        <View>
          <View style={styles.cabecera}>
            <Text style={styles.nombreLocal}>{local.name}</Text>
            <Text style={styles.meta}>
              {local.category} · {local.campus}
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitulo}>Agregar plato</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre del plato"
              placeholderTextColor="#9ca3af"
              value={nombre}
              onChangeText={setNombre}
            />
            <TextInput
              style={styles.input}
              placeholder="Precio (CLP)"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
              value={precio}
              onChangeText={setPrecio}
            />
            <TouchableOpacity
              style={[styles.boton, guardando && styles.botonDeshabilitado]}
              onPress={agregarPlato}
              disabled={guardando}>
              {guardando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.botonTexto}>Agregar a la carta</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitulo}>Carta actual</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.vacio}>Tu local aún no tiene platos.</Text>}
      renderItem={({item}) => (
        <View style={styles.plato}>
          <Text style={styles.platoNombre}>{item.name}</Text>
          <Text style={styles.precio}>{formatoCLP(item.price)}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  centro: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24},
  lista: {padding: 16},
  cabecera: {marginBottom: 16},
  nombreLocal: {fontSize: 22, fontWeight: '700', color: '#111827'},
  meta: {fontSize: 14, color: '#1d9e75', fontWeight: '600', marginTop: 2},
  form: {backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20},
  formTitulo: {fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12},
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 12,
  },
  boton: {backgroundColor: '#1d9e75', borderRadius: 10, paddingVertical: 14, alignItems: 'center'},
  botonDeshabilitado: {opacity: 0.6},
  botonTexto: {color: '#fff', fontSize: 16, fontWeight: '600'},
  subtitulo: {fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8},
  plato: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  platoNombre: {fontSize: 15, fontWeight: '600', color: '#111827', flex: 1, paddingRight: 12},
  precio: {fontSize: 15, fontWeight: '700', color: '#1d9e75'},
  vacio: {textAlign: 'center', color: '#6b7280', marginTop: 20},
  error: {color: '#b91c1c', textAlign: 'center', marginBottom: 12},
  reintentar: {color: '#1d9e75', fontWeight: '600'},
});
