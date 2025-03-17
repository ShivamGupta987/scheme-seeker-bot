
import React from 'react';
import { Check } from 'lucide-react';
import { useFormContext } from '../context/FormContext';

interface ProgressBarProps {
  steps: string[];
}

const ProgressBar: React.FC<ProgressBarProps> = ({ steps }) => {
  const { currentStep } = useFormContext();

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 px-4">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted transform -translate-y-1/2" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-primary transform -translate-y-1/2 transition-all duration-500 ease-in-out"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
        
        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isActive = currentStep >= index;
            const isComplete = currentStep > index;
            
            return (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300 ${
                    isActive 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'bg-background border-muted text-muted-foreground'
                  }`}
                >
                  {isComplete ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span 
                  className={`mt-2 text-xs font-medium transition-colors duration-200 ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
