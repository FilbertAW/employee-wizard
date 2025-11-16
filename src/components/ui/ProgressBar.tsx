import React from "react";
import type { SubmitProgress } from "../../types";
import "../../styles/ProgressBar.css";

interface ProgressBarProps {
  progress: SubmitProgress;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const getProgressPercentage = () => {
    switch (progress.step) {
      case "idle":
        return 0;
      case "basicInfo":
        return 25;
      case "details":
        return 75;
      case "complete":
        return 100;
      case "error":
        return 0;
      default:
        return 0;
    }
  };

  const getIcon = (step: string) => {
    if (progress.step === "error") return "❌";
    if (step === "complete") return "🎉";

    switch (step) {
      case "basicInfo":
        return progress.step === "basicInfo"
          ? "⏳"
          : progress.step === "details" || progress.step === "complete"
          ? "✅"
          : "⏳";
      case "details":
        return progress.step === "details"
          ? "⏳"
          : progress.step === "complete"
          ? "✅"
          : "⏳";
      default:
        return "";
    }
  };

  if (progress.step === "idle") return null;

  return (
    <div className='progress-bar-container'>
      <div className='progress-bar'>
        <div
          className='progress-bar-fill'
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>
      <div className='progress-logs'>
        <div
          className={`progress-log ${
            progress.step === "basicInfo" ||
            progress.step === "details" ||
            progress.step === "complete"
              ? "active"
              : ""
          }`}>
          {getIcon("basicInfo")}{" "}
          {progress.step === "basicInfo"
            ? "Submitting basicInfo..."
            : "basicInfo saved!"}
        </div>
        {(progress.step === "details" || progress.step === "complete") && (
          <div
            className={`progress-log ${
              progress.step === "details" || progress.step === "complete"
                ? "active"
                : ""
            }`}>
            {getIcon("details")}{" "}
            {progress.step === "details"
              ? "Submitting details..."
              : "details saved!"}
          </div>
        )}
        {progress.step === "complete" && (
          <div className='progress-log active complete'>
            {getIcon("complete")} All data processed successfully!
          </div>
        )}
        {progress.step === "error" && (
          <div className='progress-log error'>❌ {progress.message}</div>
        )}
      </div>
    </div>
  );
};
