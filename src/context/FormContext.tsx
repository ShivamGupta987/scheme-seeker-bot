
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { generatePrompt, callClaudeAPI } from '../utils/apiService';

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
};

// Try to load API key from localStorage
const getSavedApiKey = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('claudeApiKey') || '';
  }
  return '';
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [results, setResults] = useState<Results>(defaultResults);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claudeApiKey, setClaudeApiKey] = useState(getSavedApiKey);

  // Save API key to localStorage when it changes
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

  // This function will call the Claude API
  const fetchResults = async () => {
    try {
      setIsSubmitting(true);
      setResults(prev => ({ ...prev, loading: true, error: null }));
      
      if (!claudeApiKey) {
        throw new Error('Claude API key is required. Please add your API key in the settings.');
      }
      
      const prompt = generatePrompt(formData);
      const response = await callClaudeAPI(prompt, claudeApiKey);
      
      if (response.success) {
        setResults({
          schemes: response.data.schemes,
          loading: false,
          error: null
        });
      } else {
        throw new Error(response.error || 'Failed to fetch eligible schemes');
      }
    } catch (error) {
      setResults(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch eligible schemes. Please try again.'
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
