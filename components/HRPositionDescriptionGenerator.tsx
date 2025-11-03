'use client';

import React, { useState, FormEvent, ChangeEvent } from 'react';
import { FileText, Home, Upload, BookOpen, Settings, Copy, Check } from 'lucide-react';
import { ThemeToggleCompact } from '@/components/ui/theme-toggle';
import type {
  JobDescriptionFormData,
  GenerateDescriptionResponse
} from '@/types';

const HRPositionDescriptionGenerator: React.FC = () => {
  const [formData, setFormData] = useState<JobDescriptionFormData>({
    jobTitle: '',
    department: '',
    experienceLevel: ''
  });
  const [generatedDescription, setGeneratedDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Handle input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.jobTitle || !formData.department || !formData.experienceLevel) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setCurrentStep(2);

    try {
      console.log('Making API call to backend server...');
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle: formData.jobTitle,
          department: formData.department,
          experienceLevel: formData.experienceLevel
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Backend API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const data: GenerateDescriptionResponse = await response.json();

      if (!data.success || !data.description) {
        console.error('Invalid API response:', data);
        throw new Error(data.error || 'Invalid response format from server');
      }

      setGeneratedDescription(data.description);
      setCurrentStep(3);

    } catch (error: any) {
      console.error('Error details:', error);
      alert(`Error generating description: ${error.message}`);
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedDescription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const steps = [
    { number: 1, label: 'Define' },
    { number: 2, label: 'Generate' },
    { number: 3, label: 'Finalize' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
            <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">AI Position Description Generator</h1>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
              <a
                href="#"
                className="w-full flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <Home className="mr-3 h-5 w-5" />
                Dashboard
              </a>
              <a
                href="#"
                className="w-full flex items-center px-2 py-2 text-sm font-medium rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              >
                <FileText className="mr-3 h-5 w-5" />
                Generate PD
              </a>
              <a
                href="#"
                className="w-full flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <Upload className="mr-3 h-5 w-5" />
                Upload Template
              </a>
              <a
                href="#"
                className="w-full flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <BookOpen className="mr-3 h-5 w-5" />
                PD Library
              </a>
              <a
                href="#"
                className="w-full flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </a>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex-1">
          {/* Top bar */}
          <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex flex-1 items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Generate Position Description</h2>
              </div>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <ThemeToggleCompact />
            </div>
          </div>

          {/* Page content */}
          <main className="py-6">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              {/* Step indicators */}
              <div className="mb-8">
                <div className="flex items-center justify-center">
                  {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-colors ${
                            currentStep >= step.number
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {step.number}
                        </div>
                        <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {step.label}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`h-0.5 w-16 mx-2 mt-[-20px] ${
                            currentStep > step.number
                              ? 'bg-primary'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Form Card */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Position Details</h3>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        id="jobTitle"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        placeholder="Senior Software Engineer"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        placeholder="Engineering"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Experience Level
                      </label>
                      <input
                        type="text"
                        id="experienceLevel"
                        name="experienceLevel"
                        value={formData.experienceLevel}
                        onChange={handleInputChange}
                        placeholder="5+ years"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Generating...' : 'Generate Description'}
                  </button>
                </form>
              </div>

              {/* Generated Description Card */}
              {generatedDescription && (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Generated Position Description
                    </h3>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                      {generatedDescription}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Generating description...
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This may take a few seconds
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRPositionDescriptionGenerator;
