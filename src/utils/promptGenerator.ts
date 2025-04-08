
import { FormData } from '../context/FormContext';

export const generatePrompt = (formData: FormData): string => {
  return `
    System: You are a specialized government scheme eligibility assistant with expert knowledge of all Indian government schemes. Your task is to identify eligible government schemes based on the following user information.
    
    User Information:
    - State/UT: ${formData.state}
    - Gender: ${formData.gender}
    - Annual Income: ₹${formData.income}
    - Age: ${formData.age} years
    
    Please return schemes that this person is likely eligible for based on the provided information.
    For each scheme, include:
    1. Name of the scheme (official name)
    2. Detailed description (3-4 sentences explaining the benefits and purpose)
    3. Specific eligibility criteria matched by the user
    4. Category (Education, Health, Employment, Agriculture, Housing, Financial Inclusion, etc.)
    5. Official website link
    6. Application process details
    
    Format your response as structured JSON in this format:
    {
      "schemes": [
        {
          "id": "unique-id",
          "name": "Scheme Name",
          "description": "Detailed description of the scheme",
          "category": "Category Name",
          "eligibilityCriteria": ["Criterion 1", "Criterion 2", "Criterion 3"],
          "link": "https://scheme-website.gov",
          "applicationProcess": "Brief details about how to apply"
        }
      ]
    }
    
    Ensure the response is valid JSON. Include at least 3-5 schemes if eligible. If no schemes match exactly, include schemes that most closely match the profile.
  `;
};
