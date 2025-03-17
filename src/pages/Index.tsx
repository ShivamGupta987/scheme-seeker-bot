
import React from 'react';
import ChatBot from '../components/ChatBot';
import { FormProvider } from '../context/FormContext';

const Index = () => {
  return (
    <FormProvider>
      <ChatBot />
    </FormProvider>
  );
};

export default Index;
