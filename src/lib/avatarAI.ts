// Avatar AI Processing Module
// This module provides the abstraction layer for AI avatar generation
// In production, this would integrate with actual AI services for:
// - 3D avatar generation from photos
// - Style transfer and customization
// - Text-based refinement using natural language

import { supabase } from '@/integrations/supabase/client';

export interface AvatarOptions {
  category?: string;
  baseDoll?: string;
  background?: string;
  size?: string;
  material?: string;
  peopleCount?: number;
}

export interface AvatarResult {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  notes: string[];
  category?: string;
  baseDoll?: string;
  background?: string;
  peopleCount?: number;
  createdAt: Date;
}

async function requestAvatarGeneration(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('generate-avatar', { body });
  if (error) {
    const context = (error as { context?: unknown }).context;
    if (context instanceof Response) {
      const responseBody = await context.clone().json().catch(() => null);
      if (typeof responseBody?.error === 'string') throw new Error(responseBody.error);
    }
    throw new Error(error.message || 'Avatar generation failed.');
  }
  if (!data || typeof data.imageUrl !== 'string') {
    throw new Error('The generation service returned an invalid response.');
  }
  return data as { imageUrl: string };
}

/**
 * Process an uploaded photo into a 3D avatar using Replicate's Flux Kontext Pro
 * 
 * @param file - The uploaded photo file
 * @param options - Avatar generation options (category, style, etc.)
 * @returns Promise resolving to the generated avatar result
 */
export async function processAvatar(
  file: File,
  options: AvatarOptions
): Promise<AvatarResult> {
  try {
    // Convert file to base64 data URL for Replicate
    const imageUrl = await fileToDataURL(file);
    
    // Determine if multiple people based on category
    const isMultiplePeople = options.category === 'multiple';

    // Call edge function to generate avatar
    const data = await requestAvatarGeneration({
      imageUrl,
      isMultiplePeople,
      peopleCount: options.peopleCount,
    });
    
    return {
      id: `avatar-${Date.now()}`,
      imageUrl: data.imageUrl,
      thumbnailUrl: data.imageUrl,
      notes: ['AI-generated 3D chibi avatar'],
      category: options.category,
      baseDoll: options.baseDoll,
      background: options.background,
      peopleCount: options.peopleCount,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('Avatar processing error:', error);
    throw error;
  }
}

/**
 * Convert a File to a data URL
 */
async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Refine an existing avatar based on text prompts
 * 
 * @param previousResult - The current avatar to refine
 * @param textPrompt - Natural language description of desired changes
 * @returns Promise resolving to the refined avatar result
 */
export async function refineAvatar(
  previousResult: AvatarResult,
  textPrompt: string
): Promise<AvatarResult> {
  try {
    // Determine if multiple people based on category
    const isMultiplePeople = previousResult.category === 'multiple';

    // Call edge function with custom prompt modification
    const data = await requestAvatarGeneration({
      imageUrl: previousResult.imageUrl,
      isMultiplePeople,
      customPrompt: textPrompt,
      peopleCount: previousResult.peopleCount,
    });
    
    return {
      ...previousResult,
      imageUrl: data.imageUrl,
      thumbnailUrl: data.imageUrl,
      notes: [...previousResult.notes, `Refinement: ${textPrompt}`],
    };
  } catch (error) {
    console.error('Avatar refinement error:', error);
    throw error;
  }
}

/**
 * Generate a 3D model file for printing
 * 
 * INTEGRATION POINT: This would generate an actual 3D model file (.stl, .obj, etc.)
 * In production:
 * 1. Convert the 2D avatar into a 3D mesh
 * 2. Apply size and material constraints
 * 3. Optimize for 3D printing
 * 4. Return downloadable 3D model file
 * 
 * @param avatarResult - The avatar to convert to 3D
 * @param options - 3D printing options (size, material)
 * @returns Promise resolving to 3D model file URL
 */
export async function generate3DModel(
  avatarResult: AvatarResult,
  options: AvatarOptions
): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // MOCK: Return a placeholder URL
  // In production, return actual .stl or .obj file download URL
  return 'mock-3d-model.stl';
}
