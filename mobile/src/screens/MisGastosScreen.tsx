import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {deleteExpense, Expense, ExpensesResumen, getExpenses} from '../api/expenses';
import {useAuth} from '../context/AuthContext';
import {formatoCLP} from '../utils/format';
import type {ApiError} from '../api/client';

export default function MisGastosScreen() {
  const {token, refrescarUsuario} = useAuth();
  const [gastos, setGastos] = useState<Expense[]>([]);
  const [resumen, setResumen] = useState<ExpensesResumen | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    if (!token) {
      return;
    }
    setCargando(true);
    setError(null);
    try {
      const data = await getExpenses(token);
      setGastos(data.expenses);
      setResumen(data.summary);
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setCargando(false);
    }
  }, [token]);

  // Recarga cada vez que la pantalla toma foco, para reflejar los consumos
  // recién registrados.
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  // Borra un gasto tras confirmar. Al eliminarlo, el saldo del mes sube, así
  // que se recarga la lista y se refresca el usuario (para el saldo del Home).
  function confirmarEliminar(item: Expense) {
    Alert.alert(
      'Eliminar gasto',
      `¿Eliminar "${item.description ?? 'Consumo'}" por ${formatoCLP(item.amount)}?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {text: 'Eliminar', style: 'destructive', onPress: () => eliminar(item)},
      ],
    );
  }

  async function eliminar(item: Expense) {
    if (!token) {
      return;
    }
    setEliminando(item.id);
    try {
      await deleteExpense(token, item.id);
      await cargar();
      await refrescarUsuario();
    } catch (e) {
      Alert.alert('No se pudo eliminar', (e as ApiError).message);
    } finally {
      setEliminando(null);
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
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.lista}
      data={gastos}
      keyExtractor={i => String(i.id)}
      ListHeaderComponent={
        resumen ? (
          <View style={styles.resumen}>
            <Text style={styles.etiqueta}>Saldo disponible</Text>
            <Text style={styles.saldo}>{formatoCLP(resumen.saldo_actual)}</Text>
            <Text style={styles.gastado}>
              Gastado este mes: {formatoCLP(resumen.total_gastado)}
            </Text>
          </View>
        ) : undefined
      }
      ListEmptyComponent={<Text style={styles.vacio}>No has registrado gastos este mes.</Text>}
      renderItem={({item}) => (
        <View style={styles.gasto}>
          <View style={styles.gastoInfo}>
            <Text style={styles.gastoDesc}>{item.description ?? 'Consumo'}</Text>
            <Text style={styles.fecha}>{item.spent_on}</Text>
          </View>
          <Text style={styles.monto}>-{formatoCLP(item.amount)}</Text>
          <TouchableOpacity
            style={styles.eliminar}
            disabled={eliminando === item.id}
            onPress={() => confirmarEliminar(item)}>
            {eliminando === item.id ? (
              <ActivityIndicator color="#ef4444" size="small" />
            ) : (
              <Text style={styles.eliminarTexto}>Eliminar</Text>
            )}
          </TouchableOpacity>
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
  saldo: {fontSize: 32, fontWeight: '700', color: '#1d9e75', marginTop: 2},
  gastado: {fontSize: 13, color: '#6b7280', marginTop: 8},
  gasto: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  gastoInfo: {flex: 1},
  gastoDesc: {fontSize: 15, fontWeight: '500', color: '#111827'},
  fecha: {fontSize: 12, color: '#9ca3af', marginTop: 2},
  monto: {fontSize: 15, fontWeight: '700', color: '#ef4444'},
  eliminar: {marginLeft: 12, paddingVertical: 6, paddingHorizontal: 8, minWidth: 64, alignItems: 'center'},
  eliminarTexto: {color: '#ef4444', fontWeight: '600', fontSize: 13},
  vacio: {textAlign: 'center', color: '#6b7280', marginTop: 20},
  error: {color: '#b91c1c', textAlign: 'center'},
});
