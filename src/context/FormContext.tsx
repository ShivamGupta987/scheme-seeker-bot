
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { generatePrompt, callClaudeAPI, ApiResponse } from '../utils/apiService';
import { toast } from '../hooks/use-toast';

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
  usedFallback: boolean;
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
  claudeApiKey: string;
  setClaudeApiKey: (key: string) => void;
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
  usedFallback: false,
};

const DEFAULT_API_KEY = "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";

const getSavedApiKey = () => {
  if (typeof window !== 'undefined') {
    const savedKey = localStorage.getItem('claudeApiKey');
    return savedKey || DEFAULT_API_KEY;
  }
  return DEFAULT_API_KEY;
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [results, setResults] = useState<Results>(defaultResults);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claudeApiKey, setClaudeApiKey] = useState(getSavedApiKey);

  React.useEffect(() => {
    if (claudeApiKey) {
      localStorage.setItem('claudeApiKey', claudeApiKey);
    }
  }, [claudeApiKey]);

  const updateFormData = (key: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setResults(defaultResults);
    setCurrentStep(0);
  };

  const fetchResults = async () => {
    try {
      setIsSubmitting(true);
      setResults(prev => ({ ...prev, loading: true, error: null, usedFallback: false }));
      
      if (!claudeApiKey) {
        throw new Error('Claude API key is required. Please add your API key in the settings.');
      }
      
      console.log('Generating prompt with form data:', formData);
      const prompt = generatePrompt(formData);
      console.log('Calling Claude API with key length:', claudeApiKey.length);
      
      const response: ApiResponse = await callClaudeAPI(prompt, claudeApiKey);
      console.log('Received API response:', response);
      
      if (response.success && response.data) {
        const usedFallback = !!response.error;
        
        setResults({
          schemes: response.data.schemes,
          loading: false,
          error: response.error || null,
          usedFallback
        });
        
        setCurrentStep(6);
        
        if (usedFallback) {
          toast({
            title: "Notice",
            description: response.error || "Using sample schemes. Real-time data unavailable.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success!",
            description: "Found eligible schemes based on your information.",
            variant: "default",
          });
        }
      } else {
        throw new Error(response.error || 'Failed to fetch eligible schemes');
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch eligible schemes. Please try again.",
        variant: "destructive",
      });
      
      setResults(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch eligible schemes. Please try again.',
        usedFallback: false
      }));
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
        resetForm,
        claudeApiKey,
        setClaudeApiKey
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
