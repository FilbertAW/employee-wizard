import type { Department, Location, BasicInfo, Details } from '../types';
import { employeeStorage } from './employeeStorage';

const BASE_URL_STEP1 = 'http://localhost:4001';
const BASE_URL_STEP2 = 'http://localhost:4002';

const FALLBACK_DEPARTMENTS: Department[] = [
  { id: 1, name: 'Lending' },
  { id: 2, name: 'Funding' },
  { id: 3, name: 'Operations' },
  { id: 4, name: 'Engineering' }
];

const FALLBACK_LOCATIONS: Location[] = [
  { id: 1, name: 'Jakarta' },
  { id: 2, name: 'Depok' },
  { id: 3, name: 'Surabaya' }
];

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_DURATION = 5 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export const api = {
  async searchDepartments(query: string): Promise<Department[]> {
    const cacheKey = `departments:${query.toLowerCase()}`;
    const cached = getCached<Department[]>(cacheKey);
    if (cached) return cached;

    const allDepartments = await this.getAllDepartments();
    const filtered = allDepartments.filter(dept =>
      dept.name.toLowerCase().includes(query.toLowerCase())
    );
    setCache(cacheKey, filtered);
    return filtered;
  },

  async getAllDepartments(): Promise<Department[]> {
    const cacheKey = 'departments:all';
    const cached = getCached<Department[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${BASE_URL_STEP1}/departments`);
      if (!response.ok) throw new Error('Failed to fetch departments');
      const data = await response.json();
      setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('API unavailable, using fallback departments:', error);
      return FALLBACK_DEPARTMENTS;
    }
  },

  async searchLocations(query: string): Promise<Location[]> {
    const cacheKey = `locations:${query.toLowerCase()}`;
    const cached = getCached<Location[]>(cacheKey);
    if (cached) return cached;

    const allLocations = await this.getAllLocations();
    const filtered = allLocations.filter(loc =>
      loc.name.toLowerCase().includes(query.toLowerCase())
    );
    setCache(cacheKey, filtered);
    return filtered;
  },

  async getAllLocations(): Promise<Location[]> {
    const cacheKey = 'locations:all';
    const cached = getCached<Location[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${BASE_URL_STEP2}/locations`);
      if (!response.ok) throw new Error('Failed to fetch locations');
      const data = await response.json();
      setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('API unavailable, using fallback locations:', error);
      return FALLBACK_LOCATIONS;
    }
  },

  async getBasicInfo(page?: number, limit?: number): Promise<{ data: BasicInfo[], total: number }> {
    const cacheKey = `basicInfo:${page}:${limit}`;
    const cached = getCached<{ data: BasicInfo[], total: number }>(cacheKey);
    if (cached) return cached;

    try {
      let url = `${BASE_URL_STEP1}/basicInfo`;

      if (page && limit) {
        const start = (page - 1) * limit;
        const end = start + limit;
        url += `?_start=${start}&_end=${end}`;

        const [response, totalResponse] = await Promise.all([
          fetch(url),
          fetch(`${BASE_URL_STEP1}/basicInfo`)
        ]);

        if (!response.ok) throw new Error('Failed to fetch basic info');
        if (!totalResponse.ok) throw new Error('Failed to fetch total count');

        const data = await response.json();
        const totalData = await totalResponse.json();
        const result = { data, total: totalData.length };
        setCache(cacheKey, result);
        return result;
      } else {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch basic info');
        const data = await response.json();
        const result = { data, total: data.length };
        setCache(cacheKey, result);
        return result;
      }
    } catch (error) {
      console.error('API unavailable, using localStorage for basicInfo:', error);
      const data = employeeStorage.getAllBasicInfo();

      if (page && limit) {
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedData = data.slice(start, end);
        return { data: paginatedData, total: data.length };
      }

      return { data, total: data.length };
    }
  },

  async createBasicInfo(data: BasicInfo): Promise<BasicInfo> {
    try {
      const response = await fetch(`${BASE_URL_STEP1}/basicInfo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create basic info');
      cache.clear();
      return response.json();
    } catch (error) {
      cache.clear();
      employeeStorage.setPendingBasicInfo(data);
      return data;
    }
  },

  async getDetails(page?: number, limit?: number): Promise<{ data: Details[], total: number }> {
    const cacheKey = `details:${page}:${limit}`;
    const cached = getCached<{ data: Details[], total: number }>(cacheKey);
    if (cached) return cached;

    try {
      let url = `${BASE_URL_STEP2}/details`;

      if (page && limit) {
        const start = (page - 1) * limit;
        const end = start + limit;
        url += `?_start=${start}&_end=${end}`;

        const [response, totalResponse] = await Promise.all([
          fetch(url),
          fetch(`${BASE_URL_STEP2}/details`)
        ]);

        if (!response.ok) throw new Error('Failed to fetch details');
        if (!totalResponse.ok) throw new Error('Failed to fetch total count');

        const data = await response.json();
        const totalData = await totalResponse.json();
        const result = { data, total: totalData.length };
        setCache(cacheKey, result);
        return result;
      } else {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch details');
        const data = await response.json();
        const result = { data, total: data.length };
        setCache(cacheKey, result);
        return result;
      }
    } catch (error) {
      console.error('API unavailable, using localStorage for details:', error);
      const data = employeeStorage.getAllDetails();

      if (page && limit) {
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedData = data.slice(start, end);
        return { data: paginatedData, total: data.length };
      }

      return { data, total: data.length };
    }
  },

  async createDetails(data: Details): Promise<Details> {
    try {
      const response = await fetch(`${BASE_URL_STEP2}/details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create details');
      cache.clear();

      return response.json();
    } catch (error) {
      cache.clear();

      const basicInfo = employeeStorage.getPendingBasicInfo();

      if (basicInfo) {
        employeeStorage.add(basicInfo, data);
      } else {
        employeeStorage.addDetailsOnly(data);
      }

      return data;
    }
  },
};
