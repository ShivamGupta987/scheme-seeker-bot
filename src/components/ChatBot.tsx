
import React, { useState } from 'react';
import { Welcome, StateStep, GenderStep, IncomeStep, AgeStep, ReviewStep } from './FormSteps';
import Results from './Results';
import ProgressBar from './ProgressBar';
import { useFormContext } from '../context/FormContext';
import ApiKeyInput from './ApiKeyInput';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ChatBot: React.FC = () => {
  const { currentStep } = useFormContext();
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  
  const steps = [
    "Welcome",
    "Location",
    "Gender",
    "Income",
    "Age",
    "Review",
    "Results"
  ];
  
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Welcome />;
      case 1:
        return <StateStep />;
      case 2:
        return <GenderStep />;
      case 3:
        return <IncomeStep />;
      case 4:
        return <AgeStep />;
      case 5:
        return <ReviewStep />;
      case 6:
        return <Results />;
      default:
        return <Welcome />;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-4xl glass-morphism rounded-xl border shadow-subtle p-6 md:p-8 relative">
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute top-4 right-4"
          onClick={() => setShowApiKeyInput(!showApiKeyInput)}
        >
          <Settings className="h-5 w-5" />
        </Button>
        
        {showApiKeyInput && <ApiKeyInput onClose={() => setShowApiKeyInput(false)} />}
        
        {currentStep < 6 && <ProgressBar steps={steps} />}
        <div className="flex items-center justify-center min-h-[400px]">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
