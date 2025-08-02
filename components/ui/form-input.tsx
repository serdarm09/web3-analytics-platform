'use client';

import React from 'react';
import { PremiumInput } from './premium-input';
import { AlertCircle } from 'lucide-react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, className, required, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <PremiumInput
          ref={ref}
          className={`${className || ''} ${error ? 'border-red-500 focus:ring-red-500/20' : ''}`}
          required={required}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';