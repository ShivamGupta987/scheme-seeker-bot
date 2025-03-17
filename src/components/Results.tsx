import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFormContext } from '../context/FormContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, RefreshCw, ExternalLink, Filter, AlertTriangle } from 'lucide-react';
import { generatePDF } from '../utils/apiService';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Results: React.FC = () => {
  const { results, resetForm, formData } = useFormContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  if (results.loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-semibold">Finding eligible schemes</h2>
        <p className="text-muted-foreground">This may take a moment...</p>
      </div>
    );
  }
  
  if (results.error && !results.schemes.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
        <div className="mb-4 text-destructive">
          <svg
            className="h-12 w-12 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold">Error Finding Schemes</h2>
        <p className="text-muted-foreground mb-6">{results.error}</p>
        <Button onClick={resetForm}>Try Again</Button>
      </div>
    );
  }
  
  // Get unique categories
  const categories = ['all', ...Array.from(new Set(results.schemes.map(scheme => scheme.category)))];
  
  // Filter schemes by search term and category
  const filteredSchemes = results.schemes.filter(scheme => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          scheme.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || scheme.category === activeCategory;
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Your Eligible Schemes</h1>
        <p className="text-muted-foreground">
          Based on your information, we found {results.schemes.length} schemes you may be eligible for.
        </p>
      </div>
      
      {results.usedFallback && results.error && (
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            {results.error}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div className="w-full md:w-auto space-y-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by category</span>
          </div>
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="grid grid-flow-col auto-cols-max gap-1 overflow-x-auto max-w-full mb-2 p-1 h-auto">
              {categories.map(category => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="px-3 py-1.5 capitalize whitespace-nowrap"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="w-full md:w-64">
          <Input
            type="search"
            placeholder="Search schemes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      
      {filteredSchemes.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">No schemes found matching your filters.</p>
          <Button variant="link" onClick={() => {
            setSearchTerm('');
            setActiveCategory('all');
          }}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSchemes.map((scheme) => (
            <Card key={scheme.id} className="w-full overflow-hidden hover:shadow-md transition-shadow card-hover">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="mb-2">{scheme.category}</Badge>
                    <CardTitle>{scheme.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <CardDescription className="text-foreground/80 mb-4">
                  {scheme.description}
                </CardDescription>
                <div className="bg-muted/30 p-3 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Eligibility Criteria</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {scheme.eligibilityCriteria.map((criteria, index) => (
                      <li key={index}>{criteria}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" asChild className="w-full">
                  <a href={scheme.link} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    Visit Official Website
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
        <Button 
          variant="outline" 
          className="w-full md:w-auto"
          onClick={() => generatePDF(results.schemes)}
        >
          <Download className="mr-2 h-4 w-4" />
          Download Results as PDF
        </Button>
        <Button 
          className="w-full md:w-auto"
          onClick={resetForm}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Start Over
        </Button>
      </div>
      
      <Separator className="my-8" />
      
      <div className="text-center text-sm text-muted-foreground">
        <p>These results are based on the information you provided:</p>
        <p className="mt-2">
          State: {formData.state} | 
          Gender: {formData.gender} | 
          Income: ₹{parseInt(formData.income).toLocaleString('en-IN')} | 
          Age: {formData.age} years
        </p>
      </div>
    </div>
  );
};

export default Results;
