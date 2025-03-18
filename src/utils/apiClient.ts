
import { parseClaudeResponse } from './responseParser';
import { generateDynamicFallbackSchemes } from './fallbackSchemes';
import { ApiResponse } from './types';

// Function to get the proxy URL based on the environment
const getProxyUrl = () => {
  // Use actual Supabase function URL in production, or localhost in development
  const isProduction = window.location.hostname !== 'localhost';
  const supabaseProjectId = 'kcebmynrcqkyyxfzsjrf'; // You may need to update this with your actual Supabase project ID
  
  if (isProduction) {
    // Using the Supabase Edge Function URL based on your project ID
    return `https://${supabaseProjectId}.supabase.co/functions/v1/claude-proxy`;
  } else {
    // For local development
    return 'http://localhost:54321/functions/v1/claude-proxy';
  }
};

export const callClaudeAPI = async (prompt: string, apiKey: string): Promise<ApiResponse> => {
  try {
    console.log('Calling Claude API via proxy with user data...');
    
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
    
    // Try using fetch with our proxy
    try {
      const proxyUrl = getProxyUrl();
      console.log(`Using proxy URL: ${proxyUrl}`);
      
      const response = await fetch(proxyUrl, {
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
        
        const parsedData = parseClaudeResponse(content);
        
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
      console.error('Error with proxy fetch approach:', error);
      throw error; // Rethrow to be caught by the outer try/catch
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
