import type { BasicInfo, Details } from '../types';

const EMPLOYEES_KEY = 'employee-wizard-employees';
const PENDING_BASIC_INFO_KEY = 'employee-wizard-pending-basic-info';

interface StoredEmployee {
  basicInfo: BasicInfo;
  details: Details;
}

export const employeeStorage = {
  // Get all stored employees
  getAll(): StoredEmployee[] {
    try {
      const stored = localStorage.getItem(EMPLOYEES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  // Add a new employee
  add(basicInfo: BasicInfo, details: Details): void {
    try {
      const employees = this.getAll();
      employees.push({ basicInfo, details });
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
      console.log('[employeeStorage] Stored employee:', { basicInfo, details });
      console.log('[employeeStorage] Total employees in storage:', employees.length);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  // Store pending basic info temporarily (used when createBasicInfo succeeds but we don't have details yet)
  setPendingBasicInfo(basicInfo: BasicInfo): void {
    try {
      localStorage.setItem(PENDING_BASIC_INFO_KEY, JSON.stringify(basicInfo));
    } catch (error) {
      console.error('Error storing pending basic info:', error);
    }
  },

  // Get and clear pending basic info
  getPendingBasicInfo(): BasicInfo | null {
    try {
      const stored = localStorage.getItem(PENDING_BASIC_INFO_KEY);
      if (stored) {
        localStorage.removeItem(PENDING_BASIC_INFO_KEY);
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('Error reading pending basic info:', error);
      return null;
    }
  },

  // Get all basic info records
  getAllBasicInfo(): BasicInfo[] {
    const result = this.getAll().map(emp => emp.basicInfo);
    console.log('[employeeStorage] getAllBasicInfo returning:', result.length, 'items');
    return result;
  },

  // Get all details records
  getAllDetails(): Details[] {
    const result = this.getAll().map(emp => emp.details);
    console.log('[employeeStorage] getAllDetails returning:', result.length, 'items');
    return result;
  },

  // Clear all stored employees
  clear(): void {
    try {
      localStorage.removeItem(EMPLOYEES_KEY);
      localStorage.removeItem(PENDING_BASIC_INFO_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};
