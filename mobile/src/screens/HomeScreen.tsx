import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {formatoCLP} from '../utils/format';

export default function HomeScreen() {
  const {user, cerrarSesion} = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.tarjeta}>
        <Text style={styles.hola}>Hola, {user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.filaRol}>
          <Text style={styles.etiqueta}>Rol</Text>
          <Text style={styles.rol}>{user?.role === 'admin' ? 'Administrador' : 'Estudiante'}</Text>
        </View>

        <Text style={styles.etiquetaSaldo}>Saldo disponible</Text>
        <Text style={styles.saldo}>{formatoCLP(user?.current_balance)}</Text>
      </View>

      <TouchableOpacity style={styles.boton} onPress={cerrarSesion} accessibilityRole="button">
        <Text style={styles.botonTexto}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f3f4f6', padding: 20, justifyContent: 'space-between'},
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
  },
  hola: {fontSize: 24, fontWeight: '700', color: '#111827'},
  email: {fontSize: 14, color: '#6b7280', marginTop: 2},
  filaRol: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18},
  etiqueta: {fontSize: 14, color: '#6b7280'},
  rol: {fontSize: 14, fontWeight: '600', color: '#1d9e75'},
  etiquetaSaldo: {fontSize: 14, color: '#6b7280', marginTop: 24},
  saldo: {fontSize: 36, fontWeight: '700', color: '#1d9e75', marginTop: 4},
  boton: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  botonTexto: {color: '#fff', fontSize: 16, fontWeight: '600'},
});
