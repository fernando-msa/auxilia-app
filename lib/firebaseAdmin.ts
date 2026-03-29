/**
 * Placeholder para operações server-side.
 *
 * Neste ambiente, a instalação de `firebase-admin` está bloqueada por política de rede,
 * então este arquivo exporta uma função de orientação até que o pacote possa ser instalado.
 */

export function getAdminDb() {
  throw new Error(
    "firebase-admin não está disponível neste ambiente. Instale a dependência e configure FIREBASE_ADMIN_* para habilitar operações server-side.",
  );
}
