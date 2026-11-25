import React, {useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useAuth} from '../context/AuthContext';
import type {ApiError} from '../api/client';

export default function LoginScreen() {
  const {iniciarSesion} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit() {
    setError(null);
    if (!email.trim() || !password) {
      setError('Ingresa tu correo y contraseña.');
      return;
    }
    setEnviando(true);
    try {
      await iniciarSesion(email.trim(), password);
      // Al tener éxito, el AuthContext actualiza el usuario y la navegación
      // cambia sola a la pantalla principal.
    } catch (e) {
      setError((e as ApiError).message ?? 'No se pudo iniciar sesión.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.contenido}>
        <Text style={styles.titulo}>BalanceFood</Text>
        <Text style={styles.subtitulo}>Inicia sesión para ver tu saldo</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Correo"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.boton, enviando && styles.botonDeshabilitado]}
          onPress={onSubmit}
          disabled={enviando}
          accessibilityRole="button">
          {enviando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonTexto}>Entrar</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  contenido: {flex: 1, justifyContent: 'center', padding: 24},
  titulo: {fontSize: 32, fontWeight: '700', color: '#1d9e75', textAlign: 'center'},
  subtitulo: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 28,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 14,
  },
  boton: {
    backgroundColor: '#1d9e75',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  botonDeshabilitado: {opacity: 0.6},
  botonTexto: {color: '#fff', fontSize: 16, fontWeight: '600'},
  error: {
    color: '#b91c1c',
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    textAlign: 'center',
  },
});
