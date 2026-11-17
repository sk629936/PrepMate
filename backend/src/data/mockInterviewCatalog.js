/**
 * Mock Interview Catalog & Constants
 *
 * Defines interview types, difficulty levels, supported topics for
 * Technical and HR tracks, and allowed question counts.
 */

export const INTERVIEW_TYPES = ['technical', 'hr', 'mixed'];

export const TECHNICAL_TOPICS = [
  'Programming',
  'Web Development',
  'DBMS',
  'Operating Systems',
  'Computer Networks',
  'OOP',
];

export const HR_TOPICS = [
  'Introduction',
  'Strengths',
  'Weaknesses',
  'Career Goals',
  'Behavioral Questions',
  'Teamwork',
  'Communication',
  'Problem Solving',
];

export const ALL_INTERVIEW_TOPICS = [...TECHNICAL_TOPICS, ...HR_TOPICS];

export const MOCK_INTERVIEW_DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Mixed'];

export const MOCK_QUESTION_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export const MOCK_QUESTION_COUNTS = [5, 10, 15, 20];

export const MOCK_SESSION_STATUSES = ['generated', 'in_progress', 'completed', 'abandoned'];
