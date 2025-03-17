
import React from 'react';
import { Button } from '@/components/ui/button';
import { useFormContext } from '../../context/FormContext';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const StateStep: React.FC = () => {
  const { formData, updateFormData, setCurrentStep } = useFormContext();
  
  const handleContinue = () => {
    if (formData.state) {
      setCurrentStep(2);
    }
  };
  
  return (
    <div className="form-step animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold">Where are you located?</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Different states have different schemes available.
        </p>
      </div>
      
      <div className="form-control">
        <Label htmlFor="state">Select your State/UT</Label>
        <Select
          value={formData.state}
          onValueChange={(value) => updateFormData('state', value)}
        >
          <SelectTrigger id="state" className="w-full">
            <SelectValue placeholder="Select your state" />
          </SelectTrigger>
          <SelectContent>
            {indianStates.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-between w-full mt-6">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(0)}
        >
          Back
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={!formData.state}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default StateStep;
