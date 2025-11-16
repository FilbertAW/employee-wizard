import React from 'react';
import '../../styles/Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '',
  ...props 
}) => {
  return (
    <button 
      className={`button button-${variant} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
