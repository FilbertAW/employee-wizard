import React from 'react';
import '../../styles/Textarea.css';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, ...props }) => {
  return (
    <div className="textarea-wrapper">
      <label className="textarea-label">{label}</label>
      <textarea className={`textarea ${error ? 'textarea-error' : ''}`} {...props} />
      {error && <span className="textarea-error-message">{error}</span>}
    </div>
  );
};
