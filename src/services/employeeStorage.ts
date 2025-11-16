import type { BasicInfo, Details } from '../types';

const EMPLOYEES_KEY = 'employee-wizard-employees';
const PENDING_BASIC_INFO_KEY = 'employee-wizard-pending-basic-info';

interface StoredEmployee {
  basicInfo: BasicInfo;
  details: Details;
}

export const employeeStorage = {
  getAll(): StoredEmployee[] {
    try {
      const stored = localStorage.getItem(EMPLOYEES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  },

  add(basicInfo: BasicInfo, details: Details): void {
    try {
      const employees = this.getAll();
      employees.push({ basicInfo, details });
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  addDetailsOnly(details: Details): void {
    try {
      const employees = this.getAll();
      const opsBasicInfo: BasicInfo = {
        employeeId: details.employeeId,
        fullName: 'N/A',
        email: 'N/A',
        department: 'N/A',
        role: 'Ops',
      };
      employees.push({ basicInfo: opsBasicInfo, details });
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  setPendingBasicInfo(basicInfo: BasicInfo): void {
    try {
      localStorage.setItem(PENDING_BASIC_INFO_KEY, JSON.stringify(basicInfo));
    } catch (error) {
      console.error('Error storing pending basic info:', error);
    }
  },

  getPendingBasicInfo(): BasicInfo | null {
    try {
      const stored = localStorage.getItem(PENDING_BASIC_INFO_KEY);
      if (stored) {
        localStorage.removeItem(PENDING_BASIC_INFO_KEY);
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  getAllBasicInfo(): BasicInfo[] {
    return this.getAll().map(emp => emp.basicInfo);
  },

  getAllDetails(): Details[] {
    return this.getAll().map(emp => emp.details);
  },

  clear(): void {
    try {
      localStorage.removeItem(EMPLOYEES_KEY);
      localStorage.removeItem(PENDING_BASIC_INFO_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};
