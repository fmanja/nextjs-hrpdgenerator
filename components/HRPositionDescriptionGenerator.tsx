'use client';

import React, { useState, FormEvent, ChangeEvent } from 'react';
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
      // Update the step indicator to show progress
      const stepCircle = document.querySelector('circle[cx="350"]');
      if (stepCircle) {
        stepCircle.setAttribute('fill', '#ff9900');
      }

    } catch (error: any) {
      console.error('Error details:', error);
      alert(`Error generating description: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="hr-generator-container">
      <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
        {/* Background */}
        <rect width="800" height="800" fill="#f5f5f5"/>

        {/* Top Navigation Bar */}
        <rect x="0" y="0" width="800" height="60" fill="#232f3e"/>
        <text x="30" y="38" fontFamily="Arial" fontSize="22" fill="white">HR Position Description Generator</text>
        <rect x="650" y="15" width="120" height="30" rx="15" fill="#ff9900"/>
        <text x="710" y="37" fontFamily="Arial" fontSize="16" fill="white" textAnchor="middle">Sign Out</text>

        {/* Left Sidebar */}
        <rect x="0" y="60" width="200" height="740" fill="#eaeaea"/>
        <rect x="20" y="90" width="160" height="40" rx="5" fill="#d1d1d1"/>
        <text x="100" y="115" fontFamily="Arial" fontSize="14" fill="#333" textAnchor="middle">Dashboard</text>
        <rect x="20" y="140" width="160" height="40" rx="5" fill="#ff9900"/>
        <text x="100" y="165" fontFamily="Arial" fontSize="14" fill="white" textAnchor="middle">Generate PD</text>
        <rect x="20" y="190" width="160" height="40" rx="5" fill="#d1d1d1"/>
        <text x="100" y="215" fontFamily="Arial" fontSize="14" fill="#333" textAnchor="middle">Upload Template</text>
        <rect x="20" y="240" width="160" height="40" rx="5" fill="#d1d1d1"/>
        <text x="100" y="265" fontFamily="Arial" fontSize="14" fill="#333" textAnchor="middle">PD Library</text>
        <rect x="20" y="290" width="160" height="40" rx="5" fill="#d1d1d1"/>
        <text x="100" y="315" fontFamily="Arial" fontSize="14" fill="#333" textAnchor="middle">Settings</text>

        {/* Main Content Area */}
        <rect x="210" y="70" width="580" height="720" fill="white" rx="5"/>
        <text x="240" y="110" fontFamily="Arial" fontSize="24" fill="#333">Generate Position Description</text>

        {/* Step indicators */}
        <circle cx="270" cy="150" r="20" fill="#ff9900"/>
        <text x="270" y="155" fontFamily="Arial" fontSize="16" fill="white" textAnchor="middle">1</text>
        <line x1="290" y1="150" x2="330" y2="150" stroke="#d1d1d1" strokeWidth="2"/>
        <circle cx="350" cy="150" r="20" fill="#d1d1d1"/>
        <text x="350" y="155" fontFamily="Arial" fontSize="16" fill="white" textAnchor="middle">2</text>
        <line x1="370" y1="150" x2="410" y2="150" stroke="#d1d1d1" strokeWidth="2"/>
        <circle cx="430" cy="150" r="20" fill="#d1d1d1"/>
        <text x="430" y="155" fontFamily="Arial" fontSize="16" fill="white" textAnchor="middle">3</text>

        <text x="270" y="190" fontFamily="Arial" fontSize="16" fill="#333" textAnchor="middle">Define</text>
        <text x="350" y="190" fontFamily="Arial" fontSize="16" fill="#333" textAnchor="middle">Generate</text>
        <text x="430" y="190" fontFamily="Arial" fontSize="16" fill="#333" textAnchor="middle">Finalize</text>

        {/* Form Area */}
        <foreignObject x="240" y="230" width="500" height="600">
          <form onSubmit={handleSubmit} style={{ fontFamily: 'Arial' }}>
            <label style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>Position Details</label>

            <div style={{ marginTop: '20px' }}>
              <label style={{ fontSize: '14px', color: '#333' }}>Job Title</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                placeholder="Senior Software Engineer"
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 10px',
                  marginTop: '5px',
                  border: '1px solid #d1d1d1',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9'
                }}
              />
            </div>

            <div style={{ marginTop: '20px' }}>
              <label style={{ fontSize: '14px', color: '#333' }}>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="Engineering"
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 10px',
                  marginTop: '5px',
                  border: '1px solid #d1d1d1',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9'
                }}
              />
            </div>

            <div style={{ marginTop: '20px' }}>
              <label style={{ fontSize: '14px', color: '#333' }}>Experience Level</label>
              <input
                type="text"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleInputChange}
                placeholder="5+ years"
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 10px',
                  marginTop: '5px',
                  border: '1px solid #d1d1d1',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '20px',
                width: '100%',
                height: '50px',
                backgroundColor: isLoading ? '#cccccc' : '#ff9900',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              {isLoading ? 'Generating...' : 'Generate Description'}
            </button>
          </form>
        </foreignObject>
      </svg>

      {generatedDescription && (
        <div style={{
          position: 'relative',
          margin: '20px auto',
          padding: '20px',
          maxWidth: '780px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 1
        }}>
          <h3 style={{
            marginBottom: '15px',
            color: '#232f3e',
            borderBottom: '2px solid #ff9900',
            paddingBottom: '10px',
            fontSize: '18px',
            fontFamily: 'Arial'
          }}>
            Generated Position Description
          </h3>
          <div style={{
            whiteSpace: 'pre-wrap',
            fontFamily: 'Arial',
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#333',
            backgroundColor: '#f9f9f9',
            padding: '15px',
            borderRadius: '4px',
            border: '1px solid #d1d1d1',
            marginBottom: '15px'
          }}>
            {generatedDescription}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
          }}>
            <button
              onClick={() => {navigator.clipboard.writeText(generatedDescription)}}
              style={{
                padding: '8px 15px',
                backgroundColor: '#232f3e',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>Copy to Clipboard</span>
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          <div style={{
            textAlign: 'center',
            color: '#232f3e'
          }}>
            <div>Generating description...</div>
            <div style={{ marginTop: '10px', fontSize: '12px' }}>This may take a few seconds</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRPositionDescriptionGenerator;
