import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Step1BasicInfo } from "./Step1BasicInfo";
import { Step2Details } from "./Step2Details";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useDebounce } from "../../hooks/useDebounce";
import type { BasicInfo, Details, Role, DraftData } from "../../types";
import "../../styles/Wizard.css";

export const Wizard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleFromUrl = (searchParams.get("role") || "admin") as Role;

  const [currentRole, setCurrentRole] = useState<Role>(roleFromUrl);
  const [currentStep, setCurrentStep] = useState(roleFromUrl === "ops" ? 2 : 1);

  const draftKey = `draft_${currentRole}`;

  const [basicInfo, setBasicInfo] = useState<BasicInfo | undefined>(undefined);
  const [details, setDetails] = useState<Partial<Details>>({});
  const skipSaveRef = useRef(false);
  const [formKey, setFormKey] = useState(0);

  const [, , clearDraft] = useLocalStorage<DraftData>(draftKey, {});

  useEffect(() => {
    skipSaveRef.current = true;
    try {
      const item = window.localStorage.getItem(draftKey);
      const savedDraft = item ? JSON.parse(item) : {};
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBasicInfo(savedDraft.basicInfo as BasicInfo | undefined);
      setDetails(savedDraft.details || {});
    } catch {
      setBasicInfo(undefined);
      setDetails({});
    }

    const timer = setTimeout(() => {
      skipSaveRef.current = false;
    }, 600);

    return () => clearTimeout(timer);
  }, [draftKey]);

  const debouncedBasicInfo = useDebounce(basicInfo, 500);
  const debouncedDetails = useDebounce(details, 500);

  useEffect(() => {
    if (
      !skipSaveRef.current &&
      (debouncedBasicInfo || Object.keys(debouncedDetails).length > 0)
    ) {
      const currentDraftKey = `draft_${currentRole}`;
      window.localStorage.setItem(
        currentDraftKey,
        JSON.stringify({
          basicInfo: debouncedBasicInfo,
          details: debouncedDetails,
          timestamp: Date.now(),
        }),
      );
    }
  }, [debouncedBasicInfo, debouncedDetails, currentRole]);

  const handleRoleChange = (role: Role) => {
    skipSaveRef.current = true;
    setCurrentRole(role);
    setCurrentStep(role === "ops" ? 2 : 1);
    navigate(`/wizard?role=${role}`, { replace: true });
  };

  const handleStep1Next = (data: BasicInfo) => {
    setBasicInfo(data);
    setCurrentStep(2);
  };

  const handleStep1Change = (data: Partial<BasicInfo>) => {
    setBasicInfo((prev) => ({ ...prev, ...data } as BasicInfo));
  };

  const handleStep2Change = (data: Partial<Details>) => {
    setDetails((prev) => ({ ...prev, ...data }));
  };

  const handleStep2Back = () => {
    setCurrentStep(1);
  };

  const handleSubmitComplete = () => {
    clearDraft();
    navigate("/employees", { replace: true });
  };

  const handleClearDraft = () => {
    clearDraft();
    setBasicInfo(undefined);
    setDetails({});
    setFormKey((prev) => prev + 1);
  };

  return (
    <div className='wizard-container'>
      <div className='wizard-content'>
        <div className='wizard-header'>
          <h1>Employee Wizard</h1>

          <div className='wizard-header-controls'>
            <div className='role-selector'>
              <label>Select Role:</label>
              <select
                value={currentRole}
                onChange={(e) => handleRoleChange(e.target.value as Role)}>
                <option value='admin'>Admin</option>
                <option value='ops'>Ops</option>
              </select>
            </div>
            <button className='clear-draft-button' onClick={handleClearDraft}>
              Clear Draft
            </button>
          </div>
        </div>

        {currentStep === 1 && currentRole === "admin" && (
          <Step1BasicInfo
            key={formKey}
            onNext={handleStep1Next}
            onChange={handleStep1Change}
            initialData={basicInfo}
          />
        )}

        {currentStep === 2 && (
          <Step2Details
            key={formKey}
            onSubmit={handleSubmitComplete}
            onBack={handleStep2Back}
            onChange={handleStep2Change}
            initialData={details}
            basicInfo={basicInfo}
            showBackButton={currentRole === "admin"}
          />
        )}
      </div>
    </div>
  );
};
