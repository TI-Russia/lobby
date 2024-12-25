import NodeCache from "node-cache";

// Синглтон для кэша
class Cache {
  private static instance: Cache;
  private cache: NodeCache;

  private constructor() {
    this.cache = new NodeCache({ stdTTL: 3600 }); // 1 час
  }

  public static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  public get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  public set<T>(key: string, value: T): void {
    this.cache.set(key, value);
  }
}

export const globalCache = Cache.getInstance();
