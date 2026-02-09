
import React from 'react';

interface FormSectionProps {
  title: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, required, children }) => {
  return (
    <section className="bg-white p-5 mb-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center mb-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h2>
        {required && <span className="ml-1 text-red-500 font-bold">*</span>}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
};

export default FormSection;
