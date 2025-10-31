/**
 * TypeScript interfaces for HR Position Description Generator
 */

// Form data structure
export interface JobDescriptionFormData {
  jobTitle: string;
  department: string;
  experienceLevel: string;
}

// API Request payload
export interface GenerateDescriptionRequest {
  jobTitle: string;
  department: string;
  experienceLevel: string;
}

// API Response payload
export interface GenerateDescriptionResponse {
  description: string;
  success: boolean;
  error?: string;
}

// API Error response
export interface ApiErrorResponse {
  error: string;
  success: false;
}

// Bedrock configuration
export interface BedrockConfig {
  region: string;
  modelId: string;
}

// Claude message structure for Bedrock
export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Bedrock request body for Claude
export interface BedrockClaudeRequest {
  anthropic_version: string;
  max_tokens: number;
  temperature: number;
  messages: ClaudeMessage[];
  system?: string;
}

// Bedrock response structure
export interface BedrockClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: null | string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}
