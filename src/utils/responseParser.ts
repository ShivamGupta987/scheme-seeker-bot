
export const parseClauseResponse = (content: string): any => {
  try {
    // Try to extract JSON if it's within a code block
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                      content.match(/```\n([\s\S]*?)\n```/) ||
                      content.match(/{[\s\S]*?}/);
                              
    const jsonStr = jsonMatch ? jsonMatch[0].replace(/```json\n|```\n|```/g, '') : content;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    throw new Error('Failed to parse schemes from Claude response');
  }
};
