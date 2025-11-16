import React, { useState, useEffect } from "react";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Autocomplete } from "../../components/ui/Autocomplete";
import { Button } from "../../components/ui/Button";
import { validateEmail, generateEmployeeId } from "../../utils/helpers";
import { api } from "../../services/api";
import type { BasicInfo, EmployeeRole } from "../../types";
import "../../styles/Step1.css";

interface Step1Props {
  onNext: (data: BasicInfo) => void;
  onChange?: (data: Partial<BasicInfo>) => void;
  initialData?: Partial<BasicInfo>;
}

export const Step1BasicInfo: React.FC<Step1Props> = ({
  onNext,
  onChange,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<BasicInfo>>({
    fullName: initialData?.fullName || "",
    email: initialData?.email || "",
    department: initialData?.department || "",
    role: initialData?.role || ("" as EmployeeRole),
    employeeId: initialData?.employeeId || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [employeeId, setEmployeeId] = useState(initialData?.employeeId || "");

  useEffect(() => {
    const initialDataStr = JSON.stringify(initialData);
    const formDataStr = JSON.stringify(formData);

    if (initialData && initialDataStr !== formDataStr) {
      setFormData({
        fullName: initialData.fullName || "",
        email: initialData.email || "",
        department: initialData.department || "",
        role: initialData.role || ("" as EmployeeRole),
        employeeId: initialData.employeeId || "",
      });
      setEmployeeId(initialData.employeeId || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  useEffect(() => {
    const generateId = async () => {
      if (formData.department && !formData.employeeId) {
        try {
          const existingEmployees = await api.getBasicInfo();
          const id = generateEmployeeId(
            formData.department,
            existingEmployees.data,
          );
          setEmployeeId(id);
          setFormData((prev) => ({ ...prev, employeeId: id }));
        } catch (error) {
          console.error('Error generating employee ID:', error);
        }
      }
    };
    generateId();
  }, [formData.department, formData.employeeId]);

  const handleChange = (field: keyof BasicInfo, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    // Notify parent immediately for draft saving
    onChange?.(newData);
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleEmailBlur = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (newErrors.email) {
      setErrors((prev) => ({ ...prev, email: newErrors.email }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName?.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.department?.trim()) {
      newErrors.department = "Department is required";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext(formData as BasicInfo);
    }
  };

  const isFormValid =
    formData.fullName?.trim() &&
    formData.email?.trim() &&
    validateEmail(formData.email || "") &&
    formData.department?.trim() &&
    formData.role &&
    employeeId;

  return (
    <div className='step1-container'>
      <h2>Step 1: Basic Information</h2>

      <Input
        label='Full Name'
        value={formData.fullName || ""}
        onChange={(e) => handleChange("fullName", e.target.value)}
        error={errors.fullName}
        placeholder='Enter full name'
      />

      <Input
        label='Email'
        type='email'
        value={formData.email || ""}
        onChange={(e) => handleChange("email", e.target.value)}
        onBlur={handleEmailBlur}
        error={errors.email}
        placeholder='Enter email'
      />

      <Autocomplete
        label='Department'
        value={formData.department || ""}
        onChange={(value) => handleChange("department", value)}
        onSearch={(query) => api.searchDepartments(query)}
        error={errors.department}
        placeholder='Search department'
      />

      <Select
        label='Role'
        value={formData.role || ""}
        onChange={(e) => handleChange("role", e.target.value as EmployeeRole)}
        options={["Ops", "Admin", "Engineer", "Finance"]}
        error={errors.role}
      />

      <Input
        label='Employee ID'
        value={employeeId}
        disabled
        readOnly
        placeholder='Auto-generated'
      />

      <div className='step1-actions'>
        <Button onClick={handleNext} disabled={!isFormValid}>
          Next
        </Button>
      </div>
    </div>
  );
};
