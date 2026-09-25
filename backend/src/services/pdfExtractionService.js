import { PDFParse } from 'pdf-parse';
import AptitudeQuestion from '../models/AptitudeQuestion.js';

/**
 * Service to parse raw text extracted from PDF and break it into candidate Aptitude Questions.
 * Questions imported via PDF are flagged with `needsReview: true` and `isPublished: false`.
 */

export const parsePdfContent = async (buffer) => {
  const pdfData = await pdfParse(buffer);
  const text = pdfData.text || '';

  if (!text.trim()) {
    throw new Error('No readable text could be extracted from the uploaded PDF.');
  }

  const rawQuestions = extractQuestionsFromText(text);
  const processedQuestions = [];

  for (const raw of rawQuestions) {
    // Check duplicate in database using normalized text
    const norm = raw.question
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const existingInDb = await AptitudeQuestion.findOne({ normalizedQuestion: norm });

    processedQuestions.push({
      ...raw,
      normalizedQuestion: norm,
      isPossibleDuplicate: Boolean(existingInDb),
      duplicateReason: existingInDb ? `Matches existing question ID: ${existingInDb._id}` : null,
      needsReview: true,
      isPublished: false,
      sourceType: 'pdf-import',
    });
  }

  return {
    totalExtracted: processedQuestions.length,
    questions: processedQuestions,
  };
};

/**
 * Heuristic regex-based extractor for multiple-choice questions in PDF text
 */
function extractQuestionsFromText(fullText) {
  // Normalize line endings
  const cleanText = fullText.replace(/\r\n/g, '\n');

  // Split by question number patterns like "Q1.", "1.", "Question 1:", "1)", etc.
  const questionBlocks = cleanText.split(/(?:\n|^)(?:Q(?:uestion)?\s*\d+[\.\:\)]|\d+[\.\)])\s+/i);

  const extracted = [];

  for (const block of questionBlocks) {
    if (!block || block.trim().length < 20) continue;

    // Try to find options A), B), C), D) or A., B., C., D. or (A), (B), (C), (D)
    const optionsMatch = [...block.matchAll(/(?:\n|^)(?:[\(\[]?([A-D])[\)\]\.]|\b([A-D])\))\s+(.*?)(?=\n(?:[\(\[]?[A-D][\)\]\.]|\b[A-D]\)|Answer|Explanation|\n\n|$))/gi)];

    let questionText = block;
    const options = [];
    let correctAnswerIndex = 0; // Default 0 for review screen verification
    let explanation = '';

    if (optionsMatch.length >= 4) {
      // We found options!
      const firstOptionIndex = optionsMatch[0].index;
      questionText = block.substring(0, firstOptionIndex).trim();

      // Take first 4 options
      for (let i = 0; i < 4; i++) {
        options.push(optionsMatch[i][3].trim());
      }

      // Check if answer is indicated in the block (e.g. "Answer: B" or "Ans: C")
      const ansMatch = block.match(/(?:Answer|Ans|Correct Option)\s*[:\-]?\s*[\(\[]?([A-D])[\)\]\.]?/i);
      if (ansMatch) {
        const letter = ansMatch[1].toUpperCase();
        correctAnswerIndex = ['A', 'B', 'C', 'D'].indexOf(letter);
        if (correctAnswerIndex === -1) correctAnswerIndex = 0;
      }

      // Check if explanation exists
      const expMatch = block.match(/(?:Explanation|Sol|Solution)\s*[:\-]?\s*([\s\S]+)$/i);
      if (expMatch) {
        explanation = expMatch[1].trim();
      }
    } else {
      // Options not cleanly separated by A-D regex, fallback line split
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      questionText = lines[0] || 'Extracted Question';
      for (let i = 1; i <= 4; i++) {
        options.push(lines[i] || `Option ${String.fromCharCode(64 + i)}`);
      }
    }

    // Default category/chapter fallback for review screen
    extracted.push({
      question: questionText.replace(/\s+/g, ' ').trim(),
      options: options.length === 4 ? options : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswerIndex: correctAnswerIndex >= 0 && correctAnswerIndex <= 3 ? correctAnswerIndex : 0,
      explanation: explanation || 'Imported via PDF. Explanation to be added during review.',
      category: 'Quantitative Aptitude',
      chapter: 'General Aptitude',
      topic: 'PDF Import',
      difficulty: 'Medium',
      patternTags: ['pdf-import'],
      companyPatternReferences: [],
    });
  }

  return extracted;
}
