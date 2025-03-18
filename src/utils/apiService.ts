import { FormData } from '../context/FormContext';
import { supabase } from '../integrations/supabase/client';

// Define a proper return type for the API service
export type ApiResponse = {
  success: boolean;
  data?: { schemes: any[] };
  error?: string;
};

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

// Fallback schemes in case API fails
const fallbackSchemes = [
  {
    id: "pm-kisan",
    name: "PM-KISAN",
    description: "Pradhan Mantri Kisan Samman Nidhi provides income support to farmers. Eligible farmers receive up to ₹6,000 per year in three equal installments.",
    category: "Agriculture",
    eligibilityCriteria: ["Small and marginal farmer", "Income below threshold"],
    link: "https://pmkisan.gov.in/"
  },
  {
    id: "pmjay",
    name: "Ayushman Bharat (PM-JAY)",
    description: "Provides health insurance coverage of ₹5 lakh per family per year for secondary and tertiary care hospitalization. Covers poor and vulnerable families identified through socio-economic criteria.",
    category: "Health",
    eligibilityCriteria: ["Income below poverty line", "No existing health coverage"],
    link: "https://pmjay.gov.in/"
  },
  {
    id: "pmuy",
    name: "Pradhan Mantri Ujjwala Yojana",
    description: "Provides LPG connections to women from below poverty line households. Aims to replace unclean cooking fuels with clean and efficient LPG.",
    category: "Energy",
    eligibilityCriteria: ["Below poverty line household", "No existing LPG connection"],
    link: "https://pmuy.gov.in/"
  }
];

export const callClaudeAPI = async (prompt: string, apiKey: string): Promise<ApiResponse> => {
  try {
    console.log('Calling Claude API with user data...');
    
    // Create the request data
    const requestData = {
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4000,
      temperature: 0.5,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      system: "You are a government scheme eligibility expert. Return only valid JSON with schemes that match the criteria."
    };
    
    // Try using XMLHttpRequest as an alternative to fetch to avoid CORS issues
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://api.anthropic.com/v1/messages', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('x-api-key', apiKey);
      xhr.setRequestHeader('anthropic-version', '2023-06-01');
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            console.log('Claude API response received:', data);
            
            // Extract JSON from Claude's response
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
              console.log('Successfully parsed schemes from Claude response:', schemes);
              
              resolve({
                success: true,
                data: { schemes }
              });
            } catch (error) {
              console.error('Error parsing Claude response:', error);
              reject(new Error('Failed to parse schemes from Claude response'));
            }
          } catch (error) {
            console.error('Error parsing JSON response:', error);
            reject(new Error('Failed to parse API response'));
          }
        } else {
          console.error('API request failed with status:', xhr.status);
          reject(new Error(`API request failed with status: ${xhr.status}`));
        }
      };
      
      xhr.onerror = function() {
        console.error('Network error occurred');
        
        // Network error, try one more approach with a proxy if XMLHttpRequest fails
        console.log('Trying alternative approach...');
        tryFetchWithTimeout(prompt, apiKey)
          .then(resolve)
          .catch(error => {
            console.error('All API approaches failed:', error);
            
            // Return fallback data with error information
            resolve({
              success: true, // Still returning success:true so UI shows fallback schemes
              data: { schemes: generateDynamicFallbackSchemes(prompt) },
              error: error instanceof Error ? 
                `Could not fetch real schemes: ${error.message}. Showing sample schemes instead.` : 
                'Could not fetch real schemes. Showing sample schemes instead.'
            });
          });
      };
      
      xhr.send(JSON.stringify(requestData));
    });
  } catch (error) {
    console.error('Error in initial try/catch of callClaudeAPI:', error);
    
    // Return fallback data with error information
    return {
      success: true, // Still returning success:true so UI shows fallback schemes
      data: { schemes: generateDynamicFallbackSchemes(prompt) },
      error: error instanceof Error ? 
        `Could not fetch real schemes: ${error.message}. Showing sample schemes instead.` : 
        'Could not fetch real schemes. Showing sample schemes instead.'
    };
  }
};

// Try fetch with a timeout
const tryFetchWithTimeout = async (prompt: string, apiKey: string, timeout = 10000): Promise<ApiResponse> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 4000,
        temperature: 0.5,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        system: "You are a government scheme eligibility expert. Return only valid JSON with schemes that match the criteria."
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Claude API response received from fetch with timeout:', data);
    
    // Parse Claude's response to extract the JSON
    let schemes = [];
    try {
      // Extract JSON from Claude's response
      const content = data.content[0].text;
      
      // Try to extract JSON if it's within a code block
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                       content.match(/```\n([\s\S]*?)\n```/) ||
                       content.match(/{[\s\S]*?}/);
                       
      const jsonStr = jsonMatch ? jsonMatch[0].replace(/```json\n|```\n|```/g, '') : content;
      const parsedData = JSON.parse(jsonStr);
      
      schemes = parsedData.schemes || [];
      console.log('Successfully parsed schemes from fetch with timeout:', schemes);
    } catch (error) {
      console.error('Error parsing Claude response:', error);
      throw new Error('Failed to parse schemes from Claude response');
    }
    
    return {
      success: true,
      data: { schemes }
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Generate dynamic fallback schemes based on the user's input data
const generateDynamicFallbackSchemes = (prompt: string) => {
  // Extract state from prompt
  const stateMatch = prompt.match(/State\/UT:\s*([^\n]+)/);
  const state = stateMatch ? stateMatch[1].trim() : "India";
  
  // Extract income from prompt
  const incomeMatch = prompt.match(/Income:\s*₹([^\n]+)/);
  const income = incomeMatch ? parseInt(incomeMatch[1].replace(/,/g, '')) : 0;
  
  // Extract age from prompt
  const ageMatch = prompt.match(/Age:\s*(\d+)/);
  const age = ageMatch ? parseInt(ageMatch[1]) : 30;
  
  // Extract gender from prompt
  const genderMatch = prompt.match(/Gender:\s*([^\n]+)/);
  const gender = genderMatch ? genderMatch[1].trim() : "Any";
  
  // Copy the base fallback schemes
  const dynamicSchemes = [...fallbackSchemes];
  
  // Add state-specific scheme if known state
  if (state === "Maharashtra") {
    dynamicSchemes.push({
      id: "maha-awas-yojana",
      name: "Maharashtra Awas Yojana",
      description: "Housing scheme for low-income residents of Maharashtra. Provides affordable housing and subsidies for construction.",
      category: "Housing",
      eligibilityCriteria: ["Maharashtra resident", "Income below threshold"],
      link: "https://housing.maharashtra.gov.in/"
    });
  }
  
  // Add age-specific schemes
  if (age < 30) {
    dynamicSchemes.push({
      id: "skill-india",
      name: "Skill India Mission (PMKVY)",
      description: "Offers free skill training to youth to enhance employability. Includes certification and placement assistance.",
      category: "Education",
      eligibilityCriteria: ["Age below 35 years", "Looking for skill development"],
      link: "https://pmkvyofficial.org/"
    });
  }
  
  if (age > 60) {
    dynamicSchemes.push({
      id: "pm-vaya-vandana",
      name: "Pradhan Mantri Vaya Vandana Yojana",
      description: "Pension scheme for senior citizens providing assured returns. Offers financial security through regular pension payments.",
      category: "Senior Benefits",
      eligibilityCriteria: ["Age above 60 years"],
      link: "https://licindia.in/Products/Pension-Plans/Pradhan-Mantri-Vaya-Vandana-Yojana"
    });
  }
  
  // Add income-specific schemes
  if (income < 300000) {
    dynamicSchemes.push({
      id: "pm-svanidhi",
      name: "PM SVANidhi",
      description: "Provides affordable loans to street vendors. Helps with working capital needs and digital transactions.",
      category: "Microfinance",
      eligibilityCriteria: ["Street vendor or small business owner", "Low income"],
      link: "https://pmsvanidhi.mohua.gov.in/"
    });
  }
  
  return dynamicSchemes;
};

// Utility to create a PDF from results (to be implemented)
export const generatePDF = (data: any) => {
  console.log('PDF generation would happen here with data:', data);
  // Implementation would use a library like jsPDF
  alert('PDF download functionality would be implemented here');
};
