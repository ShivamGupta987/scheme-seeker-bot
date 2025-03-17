
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFormContext } from '../../context/FormContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const AgeStep: React.FC = () => {
  const { formData, updateFormData, setCurrentStep } = useFormContext();
  const [error, setError] = useState('');
  
  const validateAge = (value: string) => {
    if (!value.trim()) {
      setError('Age is required');
      return false;
    }
    
    const numValue = Number(value);
    if (isNaN(numValue) || numValue <= 0 || numValue > 120) {
      setError('Please enter a valid age between 1 and 120');
      return false;
    }
    
    setError('');
    return true;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    updateFormData('age', value);
    validateAge(value);
  };
  
  const handleContinue = () => {
    if (validateAge(formData.age)) {
      setCurrentStep(5);
    }
  };
  
  return (
    <div className="form-step animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold">How old are you?</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Many schemes are age-specific.
        </p>
      </div>
      
      <div className="form-control">
        <Label htmlFor="age">Your Age (in years)</Label>
        <Input
          id="age"
          type="text"
          inputMode="numeric"
          value={formData.age}
          onChange={handleChange}
          placeholder="0"
          className="w-full"
        />
        {error && <p className="text-destructive text-sm mt-1">{error}</p>}
      </div>
      
      <div className="flex justify-between w-full mt-6">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(3)}
        >
          Back
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={!formData.age || !!error}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default AgeStep;
