import NodeCache from "node-cache";

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl?: number; // время жизни в миллисекундах
};

class Cache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, value: T, ttl?: number) {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Проверяем не истек ли TTL
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Очищаем устаревшие записи
  cleanup() {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const globalCache = new Cache();

// Запускаем очистку кэша каждый час
if (typeof window === "undefined") {
  // Только на сервере
  setInterval(() => {
    globalCache.cleanup();
  }, 60 * 60 * 1000);
}
