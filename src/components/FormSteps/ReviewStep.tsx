
import React from 'react';
import { Button } from '@/components/ui/button';
import { useFormContext } from '../../context/FormContext';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ReviewStep: React.FC = () => {
  const { formData, setCurrentStep, fetchResults, isSubmitting } = useFormContext();
  
  const handleSubmit = async () => {
    await fetchResults();
    // No need to manually set current step - it's now handled in fetchResults
  };
  
  return (
    <div className="form-step animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold">Review Your Information</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Please check that all the information is correct.
        </p>
      </div>
      
      <div className="w-full bg-card border rounded-lg p-4 shadow-sm">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">State/UT</h3>
            <p className="mt-1">{formData.state}</p>
          </div>
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Gender</h3>
            <p className="mt-1">{formData.gender}</p>
          </div>
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Annual Income</h3>
            <p className="mt-1">₹{parseInt(formData.income).toLocaleString('en-IN')}</p>
          </div>
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Age</h3>
            <p className="mt-1">{formData.age} years</p>
          </div>
        </div>
      </div>
      
      <Alert className="mt-4 bg-amber-50 border-amber-200">
        <AlertDescription className="text-amber-800">
          If online schemes aren't available, the app will show relevant sample schemes based on your profile.
        </AlertDescription>
      </Alert>
      
      <div className="text-center mt-4">
        <p className="text-sm text-muted-foreground">
          Need to make a change? Click back to edit your information.
        </p>
      </div>
      
      <div className="flex justify-between w-full mt-6">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(4)}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finding Schemes
            </>
          ) : (
            'Find Eligible Schemes'
          )}
        </Button>
      </div>
    </div>
  );
};

export default ReviewStep;
