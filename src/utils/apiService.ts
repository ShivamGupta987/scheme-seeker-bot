
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

export const callClaudeAPI = async (prompt: string, apiKey: string) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        temperature: 0.5,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        system: "You are a government scheme eligibility expert. Return only valid JSON with schemes that match the criteria."
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Parse Claude's response to extract the JSON
    let schemes = [];
    try {
      // Extract JSON from Claude's response, which is in the content of the first message
      const content = data.content[0].text;
      
      // Try to extract JSON if it's within a code block
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                         content.match(/```\n([\s\S]*?)\n```/) ||
                         content.match(/{[\s\S]*?}/);
                         
      const jsonStr = jsonMatch ? jsonMatch[0].replace(/```json\n|```\n|```/g, '') : content;
      const parsedData = JSON.parse(jsonStr);
      
      schemes = parsedData.schemes || [];
    } catch (error) {
      console.error('Error parsing Claude response:', error);
      throw new Error('Failed to parse schemes from Claude response');
    }

    return {
      success: true,
      data: { schemes }
    };
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return {
      success: false,
      error: error.message || 'Failed to get eligible schemes'
    };
  }
};

// Utility to create a PDF from results (to be implemented)
export const generatePDF = (data: any) => {
  console.log('PDF generation would happen here with data:', data);
  // Implementation would use a library like jsPDF
  alert('PDF download functionality would be implemented here');
};
