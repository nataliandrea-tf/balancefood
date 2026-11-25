import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, View} from 'react-native';
import {AdminUser, getUsers} from '../api/admin';
import {useAuth} from '../context/AuthContext';
import type {ApiError} from '../api/client';

// Pantalla de administración: solo se navega a ella desde Home cuando el
// usuario es admin. Además, la API responde 403 si un no-admin la consulta,
// y ese caso se muestra con un mensaje claro.
export default function UsuariosScreen() {
  const {token} = useAuth();
  const [usuarios, setUsuarios] = useState<AdminUser[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!token) {
      return;
    }
    setCargando(true);
    setError(null);
    try {
      setUsuarios(await getUsers(token));
    } catch (e) {
      const err = e as ApiError;
      setError(
        err.status === 403
          ? 'No tienes permiso para ver esta sección.'
          : err.message,
      );
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
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.lista}
      data={usuarios}
      keyExtractor={u => String(u.id)}
      ListEmptyComponent={<Text style={styles.vacio}>No hay usuarios.</Text>}
      renderItem={({item}) => (
        <View style={styles.fila}>
          <View style={styles.info}>
            <Text style={styles.nombre}>{item.name}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </View>
          <Text style={[styles.rol, item.role === 'admin' && styles.rolAdmin]}>
            {item.role === 'admin' ? 'Admin' : 'Estudiante'}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  centro: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24},
  lista: {padding: 16},
  fila: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {flex: 1},
  nombre: {fontSize: 15, fontWeight: '600', color: '#111827'},
  email: {fontSize: 13, color: '#6b7280', marginTop: 2},
  rol: {fontSize: 12, fontWeight: '600', color: '#6b7280'},
  rolAdmin: {color: '#1d9e75'},
  vacio: {textAlign: 'center', color: '#6b7280', marginTop: 20},
  error: {color: '#b91c1c', textAlign: 'center'},
});
