export type Role = 'admin' | 'ops';

export type EmployeeRole = 'Ops' | 'Admin' | 'Engineer' | 'Finance';

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Intern';

export interface Department {
  id: number;
  name: string;
}

export interface Location {
  id: number;
  name: string;
}

export interface BasicInfo {
  id?: string;
  fullName: string;
  email: string;
  department: string;
  role: EmployeeRole;
  employeeId: string;
}

export interface Details {
  id?: string;
  employeeId: string;
  photo: string;
  employmentType: EmploymentType;
  officeLocation: string;
  notes: string;
}

export interface Employee {
  name: string;
  email: string;
  department: string;
  role: EmployeeRole;
  location: string;
  photo: string;
  employeeId: string;
}

export interface DraftData {
  basicInfo?: Partial<BasicInfo>;
  details?: Partial<Details>;
  timestamp?: number;
}

export interface SubmitProgress {
  step: 'idle' | 'basicInfo' | 'details' | 'complete' | 'error';
  message: string;
}
