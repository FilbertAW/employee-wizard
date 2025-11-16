import type { BasicInfo } from "../types";

export const generateEmployeeId = (
  department: string,
  existingEmployees: BasicInfo[],
): string => {
  const deptCode = department.substring(0, 3).toUpperCase();
  const deptEmployees = existingEmployees.filter((emp) =>
    emp.employeeId.startsWith(deptCode),
  );

  const nextNumber = deptEmployees.length + 1;
  const sequence = String(nextNumber).padStart(3, "0");

  return `${deptCode}-${sequence}`;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
