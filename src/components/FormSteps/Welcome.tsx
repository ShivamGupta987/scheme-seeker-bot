
import React from 'react';
import { Button } from '@/components/ui/button';
import { useFormContext } from '../../context/FormContext';

const Welcome: React.FC = () => {
  const { setCurrentStep } = useFormContext();
  
  return (
    <div className="form-step animate-fade-in">
      <div className="mb-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Government Scheme Finder</h1>
        <p className="mt-2 text-muted-foreground max-w-md">
          Find government schemes you're eligible for by answering a few simple questions about yourself.
        </p>
      </div>
      
      <div className="space-y-4 w-full">
        <div className="p-4 border rounded-lg bg-muted/50">
          <h3 className="font-medium">How it works</h3>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              <span>Answer a few questions about yourself</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <span>We'll find government schemes you might be eligible for</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <span>View and save your personalized results</span>
            </li>
          </ul>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium">Privacy Note</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your information is only used to find eligible schemes and is not stored or shared.
          </p>
        </div>
      </div>
      
      <Button 
        onClick={() => setCurrentStep(1)} 
        className="w-full mt-6"
      >
        Get Started
      </Button>
    </div>
  );
};

export default Welcome;
