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
import { generateDescriptionRequestSchema } from '@/lib/validation';
import type {
  GenerateDescriptionResponse,
  BedrockClaudeRequest,
  BedrockClaudeResponse,
} from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();

    // Validate input with Zod
    const validationResult = generateDescriptionRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: errors,
        },
        { status: 400 }
      );
    }

    const { jobTitle, department, payScaleGrade, jobFamily, series } = validationResult.data;

    // Construct the prompt for Claude
    const systemPrompt = "You are an experienced HR professional who creates clear, professional job descriptions for federal government positions. You understand federal pay scales, grade levels, and how they relate to position requirements and qualifications.";

    const userPrompt = `Create a professional federal government job description for the following position:

Job Title: ${jobTitle}
Department: ${department}
Pay Scale & Grade: ${payScaleGrade}
Job Family: ${jobFamily}
Series: ${series}

IMPORTANT: The pay scale and grade (${payScaleGrade}) is critical for determining the appropriate level of responsibility, required qualifications, and experience level. Ensure that:
- The job responsibilities match the pay scale/grade level
- Required qualifications are appropriate for the pay scale/grade
- Experience requirements align with the pay scale/grade expectations
- The position description reflects the appropriate level of complexity and responsibility for ${payScaleGrade}

Please structure the job description with the following sections:

1. About the Role
2. Key Responsibilities (5-7 bullet points appropriate for ${payScaleGrade})
3. Required Qualifications (must align with ${payScaleGrade} requirements)
4. Preferred Qualifications
5. Benefits and Perks

Make it professional, clear, and compelling. Ensure all qualifications and responsibilities are appropriate for a ${payScaleGrade} position.`;

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

    if (process.env.NODE_ENV === 'development') {
      console.log('Invoking Bedrock model:', BEDROCK_MODEL_ID);
    }
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

    // Log token usage for monitoring (always log in production for cost tracking)
    if (process.env.NODE_ENV === 'development') {
      console.log('Token usage:', {
        input: responseBody.usage.input_tokens,
        output: responseBody.usage.output_tokens,
        total: responseBody.usage.input_tokens + responseBody.usage.output_tokens,
      });
    }

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
