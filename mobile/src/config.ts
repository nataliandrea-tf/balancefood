import {API_URL as ENV_API_URL} from '@env';

// URL base de la API REST. Se configura mediante una variable de entorno
// (archivo .env, leído por react-native-dotenv), no escrita en el código.
// El valor por defecto es la API desplegada, como respaldo.
export const API_URL = ENV_API_URL || 'https://apibalancefood.frubilarz.cl/api/v1';
