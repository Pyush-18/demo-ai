import React from 'react';
import { Check } from 'lucide-react';

const Step = ({ number, label, isCompleted, isActive }) => {
  return (
    <div className="flex items-center flex-col sm:flex-row text-center sm:text-left">
      <div className={`
        flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold transition-all duration-300 flex-shrink-0
        ${isCompleted ? 'bg-v-accent border-v-accent text-white' : ''}
        ${isActive ? 'bg-v-accent border-v-accent text-white' : ''}
        ${!isCompleted && !isActive ? 'bg-transparent border-v-text-secondary/50 text-v-text-secondary' : ''}
      `}>
        {isCompleted ? <Check size={18} className="animate-pop-in" /> : number}
      </div>
      <span className={`mt-2 sm:mt-0 sm:ml-3 font-semibold text-sm whitespace-nowrap ${isActive ? 'text-v-text-primary' : 'text-v-text-secondary'}`}>
        {label}
      </span>
    </div>
  );
};

export const Stepper = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Personal Info' },
    { number: 2, label: 'Company Info' },
    { number: 3, label: 'Verify Email' },
  ];

  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <Step
            number={step.number}
            label={step.label}
            isCompleted={step.number < currentStep}
            isActive={step.number === currentStep}
          />
          {index < steps.length - 1 && (
            <div className={`
              flex-grow h-0.5 mx-2 sm:mx-4
              ${step.number < currentStep ? 'bg-v-accent' : 'bg-v-text-secondary/30'}
            `}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
