/**
 * API Route: Generate Job Description
 * POST /api/generate-description
 *
 * This route receives job details and uses AWS Bedrock (Claude) to generate
 * a professional job description.
 */

import { NextRequest, NextResponse } from 'next/server';
import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { bedrockClient, BEDROCK_MODEL_ID } from '@/lib/bedrock';
import type {
  GenerateDescriptionRequest,
  GenerateDescriptionResponse,
  BedrockClaudeRequest,
  BedrockClaudeResponse,
} from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body: GenerateDescriptionRequest = await request.json();
    const { jobTitle, department, experienceLevel } = body;

    // Validate input
    if (!jobTitle || !department || !experienceLevel) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: jobTitle, department, or experienceLevel',
        },
        { status: 400 }
      );
    }

    // Construct the prompt for Claude
    const systemPrompt = "You are an experienced HR professional who creates clear, professional job descriptions.";

    const userPrompt = `Create a professional job description for the following position:

Job Title: ${jobTitle}
Department: ${department}
Experience Level: ${experienceLevel}

Please structure the job description with the following sections:

1. About the Role
2. Key Responsibilities (5-7 bullet points)
3. Required Qualifications
4. Preferred Qualifications
5. Benefits and Perks

Make it professional, clear, and compelling.`;

    // Prepare the Bedrock request body for Claude
    const bedrockRequest: BedrockClaudeRequest = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    };

    // Invoke the Claude model via Bedrock
    const command = new InvokeModelCommand({
      modelId: BEDROCK_MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(bedrockRequest),
    });

    console.log('Invoking Bedrock model:', BEDROCK_MODEL_ID);
    const response = await bedrockClient.send(command);

    // Parse the response
    const responseBody = JSON.parse(
      new TextDecoder().decode(response.body)
    ) as BedrockClaudeResponse;

    // Extract the generated text
    const generatedDescription = responseBody.content[0]?.text || '';

    if (!generatedDescription) {
      throw new Error('No description generated from Bedrock');
    }

    // Log token usage for monitoring
    console.log('Token usage:', {
      input: responseBody.usage.input_tokens,
      output: responseBody.usage.output_tokens,
      total: responseBody.usage.input_tokens + responseBody.usage.output_tokens,
    });

    // Return the successful response
    const result: GenerateDescriptionResponse = {
      success: true,
      description: generatedDescription,
    };

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('Error generating job description:', error);

    // Handle specific AWS errors
    if (error.name === 'ResourceNotFoundException') {
      return NextResponse.json(
        {
          success: false,
          error: 'The specified Bedrock model was not found. Please check your model ID configuration.',
        },
        { status: 500 }
      );
    }

    if (error.name === 'AccessDeniedException') {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied to Bedrock. Please check your AWS credentials and permissions.',
        },
        { status: 500 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate job description. Please try again.',
      },
      { status: 500 }
    );
  }
}

// Disable caching for this API route
export const dynamic = 'force-dynamic';
