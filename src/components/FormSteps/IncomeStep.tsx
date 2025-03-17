
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFormContext } from '../../context/FormContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const IncomeStep: React.FC = () => {
  const { formData, updateFormData, setCurrentStep } = useFormContext();
  const [error, setError] = useState('');
  
  const validateIncome = (value: string) => {
    if (!value.trim()) {
      setError('Income is required');
      return false;
    }
    
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) {
      setError('Please enter a valid income amount');
      return false;
    }
    
    setError('');
    return true;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    updateFormData('income', value);
    validateIncome(value);
  };
  
  const handleContinue = () => {
    if (validateIncome(formData.income)) {
      setCurrentStep(4);
    }
  };
  
  return (
    <div className="form-step animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold">What is your annual income?</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Many schemes have income eligibility criteria.
        </p>
      </div>
      
      <div className="form-control">
        <Label htmlFor="income">Annual Income (in ₹)</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-muted-foreground">₹</span>
          </div>
          <Input
            id="income"
            type="text"
            inputMode="numeric"
            value={formData.income}
            onChange={handleChange}
            placeholder="0"
            className="pl-7"
          />
        </div>
        {error && <p className="text-destructive text-sm mt-1">{error}</p>}
      </div>
      
      <div className="flex justify-between w-full mt-6">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(2)}
        >
          Back
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={!formData.income || !!error}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default IncomeStep;
