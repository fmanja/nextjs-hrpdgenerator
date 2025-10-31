/**
 * AWS Bedrock Client Configuration
 * This file sets up the Bedrock Runtime client for invoking Claude models
 */

import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';

// Validate that required environment variables are present
const validateEnvVars = () => {
  const required = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'];
  const missing = required.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      'Please check your .env.local file.'
    );
  }
};

// Validate environment variables on module load
validateEnvVars();

// Create and export the Bedrock Runtime client
export const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Export the model ID for easy access
export const BEDROCK_MODEL_ID = process.env.BEDROCK_MODEL_ID ||
  'anthropic.claude-3-5-sonnet-20241022-v2:0';

// Export configuration helper
export const getBedrockConfig = () => ({
  modelId: BEDROCK_MODEL_ID,
  region: process.env.AWS_REGION!,
});
