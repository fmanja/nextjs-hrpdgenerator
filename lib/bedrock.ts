/**
 * AWS Bedrock Client Configuration
 * This file sets up the Bedrock Runtime client for invoking Claude models
 */

import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';

// Validate that required environment variables are present
const validateEnvVars = () => {
  // During build time, skip validation (env vars will be checked at runtime)
  // NEXT_PHASE is set during Next.js build process
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }

  // Check if using IAM role (only AWS_REGION required)
  const usingIAMRole = !process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_SECRET_ACCESS_KEY;
  
  if (usingIAMRole) {
    // Only validate AWS_REGION when using IAM role
    if (!process.env.AWS_REGION) {
      throw new Error(
        'Missing required environment variable: AWS_REGION. ' +
        'Please check your .env.local file or ensure IAM role is configured.'
      );
    }
  } else {
    // Validate all credentials when using access keys
    const required = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'];
    const missing = required.filter((varName) => !process.env[varName]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}. ` +
        'Please check your .env.local file.'
      );
    }
  }
};

// Create Bedrock client with lazy validation
const createBedrockClient = (): BedrockRuntimeClient => {
  // Validate environment variables (skipped during build)
  validateEnvVars();

  // Check if using IAM role (credentials will be auto-resolved from instance metadata)
  const usingIAMRole = !process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_SECRET_ACCESS_KEY;

  return new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'us-east-1',
    ...(usingIAMRole
      ? {} // SDK will use IAM role credentials from instance metadata
      : {
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          },
        }),
  });
};

// Lazy initialization - only create client when actually used (at runtime)
let bedrockClientInstance: BedrockRuntimeClient | null = null;

const getBedrockClient = (): BedrockRuntimeClient => {
  if (!bedrockClientInstance) {
    bedrockClientInstance = createBedrockClient();
  }
  return bedrockClientInstance;
};

// Export the Bedrock client (lazy initialization via Proxy)
// This allows the module to be imported during build without requiring env vars
export const bedrockClient = new Proxy({} as BedrockRuntimeClient, {
  get(_target, prop, receiver) {
    const client = getBedrockClient();
    const value = Reflect.get(client, prop, receiver);
    // Bind methods to maintain correct 'this' context
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

// Export the model ID for easy access
export const BEDROCK_MODEL_ID = process.env.BEDROCK_MODEL_ID ||
  'anthropic.claude-3-5-sonnet-20241022-v2:0';

// Export configuration helper
export const getBedrockConfig = () => ({
  modelId: BEDROCK_MODEL_ID,
  region: process.env.AWS_REGION || 'us-east-1',
});
