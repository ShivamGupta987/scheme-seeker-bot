
import React from 'react';
import { Button } from '@/components/ui/button';
import { useFormContext } from '../../context/FormContext';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const GenderStep: React.FC = () => {
  const { formData, updateFormData, setCurrentStep } = useFormContext();
  
  const handleContinue = () => {
    if (formData.gender) {
      setCurrentStep(3);
    }
  };
  
  return (
    <div className="form-step animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold">What is your gender?</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Some schemes are targeted at specific genders.
        </p>
      </div>
      
      <div className="form-control">
        <RadioGroup 
          value={formData.gender} 
          onValueChange={(value) => updateFormData('gender', value)}
          className="flex flex-col space-y-3"
        >
          {['Male', 'Female', 'Other', 'Prefer not to say'].map((gender) => (
            <div key={gender} className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50 transition-colors">
              <RadioGroupItem value={gender} id={gender} />
              <Label htmlFor={gender} className="flex-grow cursor-pointer">{gender}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      <div className="flex justify-between w-full mt-6">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(1)}
        >
          Back
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={!formData.gender}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default GenderStep;
