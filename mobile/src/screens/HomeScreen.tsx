import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuth} from '../context/AuthContext';
import {formatoCLP} from '../utils/format';
import type {RootStackParamList} from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const {user, cerrarSesion} = useAuth();
  const esAdmin = user?.role === 'admin';

  return (
    <View style={styles.container}>
      <View style={styles.tarjeta}>
        <Text style={styles.hola}>Hola, {user?.name}</Text>
        {esAdmin ? <Text style={styles.badge}>Administrador</Text> : null}
        <Text style={styles.etiqueta}>Saldo disponible</Text>
        <Text style={styles.saldo}>{formatoCLP(user?.current_balance)}</Text>
      </View>

      <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('Locales')}>
        <Text style={styles.botonTexto}>Ver locales</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('MisGastos')}>
        <Text style={styles.botonTexto}>Mis gastos</Text>
      </TouchableOpacity>

      <View style={styles.espacio} />

      <TouchableOpacity style={[styles.boton, styles.botonSalir]} onPress={cerrarSesion}>
        <Text style={styles.botonTexto}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f3f4f6', padding: 20},
  tarjeta: {backgroundColor: '#fff', borderRadius: 16, padding: 24, marginTop: 12, marginBottom: 20},
  hola: {fontSize: 24, fontWeight: '700', color: '#111827'},
  badge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: '#e7f6f0',
    color: '#1d9e75',
    fontWeight: '600',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
  etiqueta: {fontSize: 14, color: '#6b7280', marginTop: 20},
  saldo: {fontSize: 36, fontWeight: '700', color: '#1d9e75', marginTop: 4},
  boton: {backgroundColor: '#1d9e75', borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginBottom: 12},
  botonSalir: {backgroundColor: '#ef4444'},
  botonTexto: {color: '#fff', fontSize: 16, fontWeight: '600'},
  espacio: {flex: 1},
});
