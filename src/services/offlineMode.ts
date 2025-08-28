// MODO OFFLINE Y FALLBACK PARA FIREBASE
export class OfflineMode {
  
  // Detectar si hay conexión a Firebase
  static async isFirebaseAvailable(): Promise<boolean> {
    try {
      // Test simple de conectividad
      const response = await fetch('https://firestore.googleapis.com/', {
        method: 'HEAD',
        mode: 'no-cors',
        timeout: 5000
      });
      return true;
    } catch {
      console.warn("⚠️ Firebase no disponible - usando modo offline");
      return false;
    }
  }
  
  // Guardar datos localmente cuando Firebase falla
  static saveToLocalStorage(key: string, data: any): void {
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
        synced: false
      }));
      console.log("💾 Datos guardados localmente:", key);
    } catch (error) {
      console.error("❌ Error guardando localmente:", error);
    }
  }
  
  // Recuperar datos locales
  static getFromLocalStorage(key: string): any {
    try {
      const stored = localStorage.getItem(`offline_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.data;
      }
      return null;
    } catch (error) {
      console.error("❌ Error recuperando datos locales:", error);
      return null;
    }
  }
  
  // Sincronizar datos pendientes cuando Firebase esté disponible
  static async syncPendingData(): Promise<void> {
    const firebaseAvailable = await this.isFirebaseAvailable();
    if (!firebaseAvailable) return;
    
    console.log("🔄 Sincronizando datos offline...");
    
    // Obtener todas las claves offline
    const offlineKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('offline_') && !key.includes('synced'));
    
    for (const key of offlineKeys) {
      try {
        const data = this.getFromLocalStorage(key.replace('offline_', ''));
        if (data) {
          // Aquí iría la lógica de sincronización específica
          console.log("📤 Sincronizando:", key);
          // Marcar como sincronizado
          localStorage.removeItem(key);
        }
      } catch (error) {
        console.error("❌ Error sincronizando:", key, error);
      }
    }
  }
  
  // Limpiar datos offline antiguos (más de 7 días)
  static cleanOldOfflineData(): void {
    const now = Date.now();
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    Object.keys(localStorage)
      .filter(key => key.startsWith('offline_'))
      .forEach(key => {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.timestamp < weekAgo) {
              localStorage.removeItem(key);
              console.log("🧹 Limpiado dato offline antiguo:", key);
            }
          }
        } catch (error) {
          // Si no se puede parsear, eliminar
          localStorage.removeItem(key);
        }
      });
  }
}

// Inicializar modo offline
OfflineMode.cleanOldOfflineData();

// Intentar sincronizar cada 5 minutos
setInterval(() => {
  OfflineMode.syncPendingData();
}, 5 * 60 * 1000);