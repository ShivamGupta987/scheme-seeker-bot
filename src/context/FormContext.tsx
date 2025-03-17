
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type FormData = {
  state: string;
  gender: string;
  income: string;
  age: string;
};

export type Results = {
  schemes: Scheme[];
  loading: boolean;
  error: string | null;
};

export type Scheme = {
  id: string;
  name: string;
  description: string;
  category: string;
  eligibilityCriteria: string[];
  link: string;
};

interface FormContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  formData: FormData;
  updateFormData: (key: keyof FormData, value: string) => void;
  results: Results;
  setResults: React.Dispatch<React.SetStateAction<Results>>;
  fetchResults: () => Promise<void>;
  isSubmitting: boolean;
  resetForm: () => void;
}

const defaultFormData: FormData = {
  state: '',
  gender: '',
  income: '',
  age: '',
};

const defaultResults: Results = {
  schemes: [],
  loading: false,
  error: null,
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [results, setResults] = useState<Results>(defaultResults);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (key: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setResults(defaultResults);
    setCurrentStep(0);
  };

  // This function would call the Claude API
  const fetchResults = async () => {
    try {
      setIsSubmitting(true);
      setResults(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API call with mock data for now
      // In a real implementation, this would call the Claude API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data
      const mockSchemes: Scheme[] = [
        {
          id: '1',
          name: 'PM Kisan Samman Nidhi',
          description: 'Income support program that provides farmers with up to ₹6,000 per year as minimum income support.',
          category: 'Agriculture',
          eligibilityCriteria: ['Small and marginal farmers', 'Land ownership under 2 hectares'],
          link: 'https://pmkisan.gov.in/'
        },
        {
          id: '2',
          name: 'Ayushman Bharat',
          description: 'Health insurance scheme providing coverage up to ₹5 lakhs per family per year for secondary and tertiary care hospitalization.',
          category: 'Health',
          eligibilityCriteria: ['Income below poverty line', 'No existing health coverage'],
          link: 'https://pmjay.gov.in/'
        },
        {
          id: '3',
          name: 'PM Awas Yojana',
          description: 'Housing scheme aimed at providing housing for all in urban areas by 2022.',
          category: 'Housing',
          eligibilityCriteria: ['Urban resident', 'No existing property ownership'],
          link: 'https://pmaymis.gov.in/'
        }
      ];
      
      setResults({
        schemes: mockSchemes,
        loading: false,
        error: null
      });
    } catch (error) {
      setResults(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch eligible schemes. Please try again.'
      }));
      console.error('Error fetching results:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        formData,
        updateFormData,
        results,
        setResults,
        fetchResults,
        isSubmitting,
        resetForm
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = (): FormContextType => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};
