
import React, { useState } from 'react';
import { useFormContext } from '../context/FormContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { X, Check, AlertCircle } from 'lucide-react';

interface ApiKeyInputProps {
  onClose: () => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onClose }) => {
  const { claudeApiKey, setClaudeApiKey } = useFormContext();
  const [inputKey, setInputKey] = useState(claudeApiKey);

  // Updated default API key to use the provided key for Claude 3.5
  const defaultApiKey = "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";

  const handleSave = () => {
    setClaudeApiKey(inputKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const useDefaultKey = () => {
    setInputKey(defaultApiKey);
    setClaudeApiKey(defaultApiKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Claude API Settings</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Add your Claude API key to enable scheme eligibility results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Claude API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your Claude API key"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
              />
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={useDefaultKey}
            >
              Use Preset API Key
            </Button>
            
            <div className="flex items-start p-3 text-sm bg-amber-50 border border-amber-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-amber-800">
                <p>Your API key is stored locally in your browser and never sent to our servers.</p>
                <p className="mt-1">You can get a Claude API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Anthropic's website</a>.</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!inputKey}>
            {isSaved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Saved
              </>
            ) : 'Save API Key'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ApiKeyInput;
