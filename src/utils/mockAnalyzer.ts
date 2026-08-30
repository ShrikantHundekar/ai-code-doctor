import type { Language, ReviewResult } from '../types';
import { getMockReviewForLanguage } from '../data/mockData';

export async function analyzeCode(_code: string, language: Language): Promise<ReviewResult> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return getMockReviewForLanguage(language);
}
