
import { parseClaudeResponse } from './responseParser';
import { generateDynamicFallbackSchemes } from './fallbackSchemes';
import { ApiResponse } from './types';

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
              
              const parsedData = parseClaudeResponse(content);
              
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
      
      const parsedData = parseClaudeResponse(content);
      
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
