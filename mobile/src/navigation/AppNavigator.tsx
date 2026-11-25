import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuth} from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import LocalesScreen from '../screens/LocalesScreen';
import LocalDetalleScreen from '../screens/LocalDetalleScreen';
import MisGastosScreen from '../screens/MisGastosScreen';
import UsuariosScreen from '../screens/UsuariosScreen';
import MiLocalScreen from '../screens/MiLocalScreen';
import MisVentasScreen from '../screens/MisVentasScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Locales: undefined;
  LocalDetalle: {restaurantId: number; nombre: string};
  MisGastos: undefined;
  Usuarios: undefined;
  MiLocal: undefined;
  MisVentas: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const colorHeader = '#1d9e75';

export default function AppNavigator() {
  const {user, cargando} = useAuth();

  // Mientras se revisa si había una sesión guardada, mostramos un spinner.
  if (cargando) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={colorHeader} />
      </View>
    );
  }

  // La navegación depende del estado de sesión: con usuario, las pantallas de
  // la app; sin usuario, el login.
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: colorHeader},
          headerTintColor: '#fff',
          headerTitleStyle: {fontWeight: '700'},
        }}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{title: 'BalanceFood'}} />
            <Stack.Screen name="Locales" component={LocalesScreen} options={{title: 'Locales'}} />
            <Stack.Screen
              name="LocalDetalle"
              component={LocalDetalleScreen}
              options={({route}) => ({title: route.params.nombre})}
            />
            <Stack.Screen name="MisGastos" component={MisGastosScreen} options={{title: 'Mis gastos'}} />
            <Stack.Screen name="Usuarios" component={UsuariosScreen} options={{title: 'Usuarios'}} />
            <Stack.Screen name="MiLocal" component={MiLocalScreen} options={{title: 'Mi local'}} />
            <Stack.Screen name="MisVentas" component={MisVentasScreen} options={{title: 'Mis ventas'}} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
