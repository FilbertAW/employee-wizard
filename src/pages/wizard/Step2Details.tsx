import React, { useState, useEffect } from "react";
import { FileUpload } from "../../components/ui/FileUpload";
import { Select } from "../../components/ui/Select";
import { Autocomplete } from "../../components/ui/Autocomplete";
import { Textarea } from "../../components/ui/Textarea";
import { Button } from "../../components/ui/Button";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { api } from "../../services/api";
import { delay } from "../../utils/helpers";
import type {
  Details,
  EmploymentType,
  SubmitProgress,
  BasicInfo,
} from "../../types";
import "../../styles/Step2.css";

interface Step2Props {
  onSubmit: () => void;
  onBack?: () => void;
  onChange?: (data: Partial<Details>) => void;
  initialData?: Partial<Details>;
  basicInfo?: BasicInfo;
  showBackButton: boolean;
}

export const Step2Details: React.FC<Step2Props> = ({
  onSubmit,
  onBack,
  onChange,
  initialData,
  basicInfo,
  showBackButton,
}) => {
  const [formData, setFormData] = useState<Partial<Details>>({
    photo: initialData?.photo || "",
    employmentType: initialData?.employmentType || ("" as EmploymentType),
    officeLocation: initialData?.officeLocation || "",
    notes: initialData?.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState<SubmitProgress>({
    step: "idle",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when initialData changes
  useEffect(() => {
    const initialDataStr = JSON.stringify(initialData);
    const formDataStr = JSON.stringify(formData);

    if (initialData && initialDataStr !== formDataStr) {
      setFormData({
        photo: initialData.photo || "",
        employmentType: initialData.employmentType || ("" as EmploymentType),
        officeLocation: initialData.officeLocation || "",
        notes: initialData.notes || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const handleChange = (field: keyof Details, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange?.(newData);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.photo?.trim()) {
      newErrors.photo = "Photo is required";
    }

    if (!formData.employmentType) {
      newErrors.employmentType = "Employment type is required";
    }

    if (!formData.officeLocation?.trim()) {
      newErrors.officeLocation = "Office location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      if (basicInfo) {
        setProgress({ step: "basicInfo", message: "Submitting basicInfo..." });
        await delay(3000);
        await api.createBasicInfo(basicInfo);
      }

      setProgress({ step: "details", message: "Submitting details..." });
      await delay(3000);

      const detailsToSubmit: Details = {
        ...formData,
        employeeId: basicInfo?.employeeId || "N/A",
      } as Details;

      await api.createDetails(detailsToSubmit);

      setProgress({
        step: "complete",
        message: "All data processed successfully!",
      });

      setTimeout(() => {
        onSubmit();
      }, 1500);
    } catch (error) {
      console.error("Submit error:", error);
      setProgress({
        step: "error",
        message:
          error instanceof Error ? error.message : "Failed to submit data",
      });
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.photo?.trim() &&
    formData.employmentType &&
    formData.officeLocation?.trim();

  return (
    <div className='step2-container'>
      <h2>Step 2: Details</h2>

      <FileUpload
        label='Photo'
        value={formData.photo || ""}
        onChange={(base64) => handleChange("photo", base64)}
        error={errors.photo}
      />

      <Select
        label='Employment Type'
        value={formData.employmentType || ""}
        onChange={(e) =>
          handleChange("employmentType", e.target.value as EmploymentType)
        }
        options={["Full-time", "Part-time", "Contract", "Intern"]}
        error={errors.employmentType}
      />

      <Autocomplete
        label='Office Location'
        value={formData.officeLocation || ""}
        onChange={(value) => handleChange("officeLocation", value)}
        onSearch={(query) => api.searchLocations(query)}
        error={errors.officeLocation}
        placeholder='Search location'
      />

      <Textarea
        label='Notes'
        value={formData.notes || ""}
        onChange={(e) => handleChange("notes", e.target.value)}
        placeholder='Enter any additional notes'
        rows={4}
      />

      <ProgressBar progress={progress} />

      <div className='step2-actions'>
        {showBackButton && (
          <Button variant='secondary' onClick={onBack} disabled={isSubmitting}>
            Back
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={!isFormValid || isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
};
