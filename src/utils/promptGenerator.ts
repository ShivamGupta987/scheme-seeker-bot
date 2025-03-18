
import { FormData } from '../context/FormContext';

export const generatePrompt = (formData: FormData): string => {
  return `
    System: You are a government scheme eligibility assistant. Your task is to identify eligible government schemes based on the following user information.
    
    User Information:
    - State/UT: ${formData.state}
    - Gender: ${formData.gender}
    - Annual Income: ₹${formData.income}
    - Age: ${formData.age} years
    
    Please return only schemes that this person is likely eligible for based on the provided information.
    For each scheme, include:
    1. Name of the scheme
    2. Brief description (2-3 sentences)
    3. Eligibility criteria met by the user
    4. Category (Education, Health, Employment, Agriculture, etc.)
    5. Official website link
    
    Format your response as structured JSON in this format:
    {
      "schemes": [
        {
          "id": "unique-id",
          "name": "Scheme Name",
          "description": "Description of the scheme",
          "category": "Category Name",
          "eligibilityCriteria": ["Criterion 1", "Criterion 2"],
          "link": "https://scheme-website.gov"
        }
      ]
    }
  `;
};
