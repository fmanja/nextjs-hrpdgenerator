/**
 * Zod validation schemas for HR Position Description Generator
 */

import { z } from 'zod';
import { getOccupationalGroups, getSeriesByGroupCode } from './opm-data';

// Valid pay scale and grade options
const VALID_PAY_SCALE_GRADES = [
  'GS-1', 'GS-2', 'GS-3', 'GS-4', 'GS-5', 'GS-6', 'GS-7', 'GS-8', 'GS-9', 'GS-10',
  'GS-11', 'GS-12', 'GS-13', 'GS-14', 'GS-15',
  'SES',
  'ES-1', 'ES-2', 'ES-3', 'ES-4', 'ES-5', 'ES-6',
  'SL',
  'ST',
  'GM', 'GG', 'AD'
] as const;

// Get all valid job family codes
const getAllJobFamilyCodes = (): string[] => {
  return getOccupationalGroups().map(group => group.code);
};

// Get all valid series codes for a given job family
const getAllSeriesCodes = (jobFamily: string): string[] => {
  return getSeriesByGroupCode(jobFamily).map(series => series.code);
};

/**
 * Schema for job description form data
 */
export const jobDescriptionFormSchema = z.object({
  jobTitle: z
    .string()
    .min(1, 'Job title is required')
    .min(3, 'Job title must be at least 3 characters')
    .max(100, 'Job title must be less than 100 characters')
    .trim(),
  
  department: z
    .string()
    .min(1, 'Department is required')
    .min(2, 'Department must be at least 2 characters')
    .max(100, 'Department must be less than 100 characters')
    .trim(),
  
  payScaleGrade: z
    .enum(VALID_PAY_SCALE_GRADES, {
      errorMap: () => ({ message: 'Please select a valid pay scale and grade' })
    }),
  
  jobFamily: z
    .string()
    .min(1, 'Job family is required')
    .refine(
      (code) => getAllJobFamilyCodes().includes(code),
      { message: 'Please select a valid job family' }
    ),
  
  series: z
    .string()
    .min(1, 'Series is required'),
}).refine(
  (data) => {
    if (!data.jobFamily) return true; // jobFamily validation will catch this
    return getAllSeriesCodes(data.jobFamily).includes(data.series);
  },
  {
    message: 'Please select a valid series for the chosen job family',
    path: ['series'], // This will attach the error to the series field
  }
);

/**
 * Schema for API request payload
 */
export const generateDescriptionRequestSchema = z.object({
  jobTitle: z
    .string()
    .min(1, 'Job title is required')
    .min(3, 'Job title must be at least 3 characters')
    .max(100, 'Job title must be less than 100 characters')
    .trim(),
  
  department: z
    .string()
    .min(1, 'Department is required')
    .min(2, 'Department must be at least 2 characters')
    .max(100, 'Department must be less than 100 characters')
    .trim(),
  
  payScaleGrade: z
    .enum(VALID_PAY_SCALE_GRADES, {
      errorMap: () => ({ message: 'Invalid pay scale and grade' })
    }),
  
  jobFamily: z
    .string()
    .min(1, 'Job family is required')
    .refine(
      (code) => getAllJobFamilyCodes().includes(code),
      { message: 'Invalid job family code' }
    ),
  
  series: z
    .string()
    .min(1, 'Series is required'),
}).refine(
  (data) => {
    if (!data.jobFamily) return true; // jobFamily validation will catch this
    return getAllSeriesCodes(data.jobFamily).includes(data.series);
  },
  {
    message: 'Invalid series code for the selected job family',
    path: ['series'], // This will attach the error to the series field
  }
);

// Type inference from schemas
export type JobDescriptionFormData = z.infer<typeof jobDescriptionFormSchema>;
export type GenerateDescriptionRequest = z.infer<typeof generateDescriptionRequestSchema>;

