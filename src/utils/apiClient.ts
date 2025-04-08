
import { parseClauseResponse } from './responseParser';
import { generateDynamicFallbackSchemes } from './fallbackSchemes';
import { ApiResponse } from './types';

// Function to get the proxy URL based on the environment with robust error handling
const getProxyUrl = () => {
  // Determine the correct Supabase project ID
  const supabaseProjectId = 'kcebmynrcqkyyxfzsjrf'; // Your Supabase project ID
  
  // Use the actual hostname to determine if we're in production or not
  const isProduction = !(window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1');
  
  if (isProduction) {
    // For production, try multiple variations of the URL for robustness
    return {
      primary: `https://${supabaseProjectId}.supabase.co/functions/v1/claude-proxy`,
      fallback: `https://${supabaseProjectId}.functions.supabase.co/claude-proxy`
    };
  } else {
    // For local development
    return {
      primary: 'http://localhost:54321/functions/v1/claude-proxy',
      fallback: null
    };
  }
};

// Function to check if a URL is accessible
const checkUrlAccessibility = async (url) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout
    
    const response = await fetch(url, {
      method: 'OPTIONS',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' }
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn(`URL ${url} is not accessible:`, error);
    return false;
  }
};

export const callClaudeAPI = async (prompt: string, apiKey: string): Promise<ApiResponse> => {
  try {
    console.log('Calling Claude API via proxy with user data...');
    
    // Create the request data using the latest Claude 3.5 model
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
      system: "You are a government scheme eligibility expert. Return only valid JSON with schemes that match the criteria. Include detailed information about each scheme including eligibility, benefits, application process, and website links."
    };
    
    // Get URL options
    const urlOptions = getProxyUrl();
    console.log(`Using primary proxy URL: ${urlOptions.primary}`);
    
    // Try using the primary URL first
    try {
      console.log('Sending request to Claude API with prompt:', prompt);
      
      // Make the request to the proxy
      const response = await fetch(urlOptions.primary, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API request failed with status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log('Claude API response received via proxy:', data);
      
      // Extract JSON from Claude's response
      let schemes = [];
      try {
        // Extract JSON from Claude's response, which is in the content of the first message
        const content = data.content[0].text;
        
        const parsedData = parseClauseResponse(content);
        
        schemes = parsedData.schemes || [];
        console.log('Successfully parsed schemes from Claude response:', schemes);
        
        return {
          success: true,
          data: { schemes }
        };
      } catch (error) {
        console.error('Error parsing Claude response:', error);
        throw new Error('Failed to parse schemes from Claude response');
      }
    } catch (error) {
      console.error('Error with primary proxy URL:', error);
      
      // Try fallback URL if available
      if (urlOptions.fallback) {
        console.log(`Trying fallback proxy URL: ${urlOptions.fallback}`);
        
        try {
          const response = await fetch(urlOptions.fallback, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey
            },
            body: JSON.stringify(requestData)
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API request failed with status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
          }
          
          const data = await response.json();
          console.log('Claude API response received via fallback proxy:', data);
          
          // Extract JSON from Claude's response
          let schemes = [];
          try {
            // Extract JSON from Claude's response, which is in the content of the first message
            const content = data.content[0].text;
            
            const parsedData = parseClauseResponse(content);
            
            schemes = parsedData.schemes || [];
            console.log('Successfully parsed schemes from Claude response:', schemes);
            
            return {
              success: true,
              data: { schemes }
            };
          } catch (error) {
            console.error('Error parsing Claude response from fallback:', error);
            throw new Error('Failed to parse schemes from Claude response');
          }
        } catch (fallbackError) {
          console.error('Error with fallback proxy URL:', fallbackError);
          throw fallbackError; // Rethrow to be caught by the outer try/catch
        }
      } else {
        throw error; // No fallback available, rethrow the original error
      }
    }
  } catch (error) {
    console.error('Error in callClaudeAPI:', error);
    
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
