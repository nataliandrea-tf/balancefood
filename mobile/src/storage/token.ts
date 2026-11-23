import * as Keychain from 'react-native-keychain';

// El token se guarda en el almacenamiento seguro del sistema (Keystore en
// Android, Keychain en iOS), no en texto plano, como exige la tarea.
const SERVICE = 'balancefood.auth';

export async function saveToken(token: string): Promise<void> {
  await Keychain.setGenericPassword('auth', token, {service: SERVICE});
}

export async function getToken(): Promise<string | null> {
  const credenciales = await Keychain.getGenericPassword({service: SERVICE});
  return credenciales ? credenciales.password : null;
}

export async function clearToken(): Promise<void> {
  await Keychain.resetGenericPassword({service: SERVICE});
}
