/**
 * Centralized Aptitude Taxonomy Catalog
 *
 * Defines categories, chapters, and topics based on standard major IT/service/product-company placement assessment patterns.
 */

export const QUANTITATIVE_CHAPTERS = [
  'Number System',
  'HCF and LCM',
  'Simplification',
  'Divisibility',
  'Averages',
  'Percentages',
  'Ratio and Proportion',
  'Partnership',
  'Profit and Loss',
  'Discount',
  'Simple Interest',
  'Compound Interest',
  'Problems on Ages',
  'Mixture and Allegation',
  'Time and Work',
  'Pipes and Cisterns',
  'Time, Speed and Distance',
  'Boats and Streams',
  'Problems on Trains',
  'Linear Equations',
  'Quadratic Equations',
  'Algebraic Expressions',
  'Progressions',
  'Geometry',
  'Mensuration 2D',
  'Mensuration 3D',
  'Permutation and Combination',
  'Probability',
  'Data Interpretation',
  'Data Sufficiency',
];

export const LOGICAL_CHAPTERS = [
  'Number Series',
  'Alphabet Series',
  'Alphanumeric Series',
  'Coding-Decoding',
  'Blood Relations',
  'Direction Sense',
  'Analogy',
  'Classification',
  'Ranking and Order',
  'Syllogism',
  'Statement and Conclusion',
  'Statement and Assumption',
  'Statement and Argument',
  'Logical Deduction',
  'Seating Arrangement',
  'Puzzles',
  'Venn Diagrams',
  'Data Sufficiency',
  'Clocks',
  'Calendars',
  'Non-Verbal Reasoning',
];

export const VERBAL_CHAPTERS = [
  'Reading Comprehension',
  'Vocabulary',
  'Synonyms',
  'Antonyms',
  'One Word Substitution',
  'Sentence Completion',
  'Fill in the Blanks',
  'Error Detection',
  'Sentence Correction',
  'Sentence Improvement',
  'Para Jumbles',
  'Para Completion',
  'Sentence Rearrangement',
  'Grammar',
  'Tenses',
  'Articles',
  'Prepositions',
  'Subject-Verb Agreement',
  'Active and Passive Voice',
  'Direct and Indirect Speech',
  'Idioms and Phrases',
  'Word Usage',
];

export const CATEGORIES = [
  {
    id: 'quant',
    name: 'Quantitative Aptitude',
    description: 'Arithmetic, Algebra, Geometry, Data Interpretation & Quantitative Reasoning placement problems.',
    chaptersCount: QUANTITATIVE_CHAPTERS.length,
    chapters: QUANTITATIVE_CHAPTERS,
  },
  {
    id: 'logical',
    name: 'Logical Reasoning',
    description: 'Analytical reasoning, pattern recognition, arrangements, syllogisms & logical deduction.',
    chaptersCount: LOGICAL_CHAPTERS.length,
    chapters: LOGICAL_CHAPTERS,
  },
  {
    id: 'verbal',
    name: 'Verbal Ability',
    description: 'Reading comprehension, grammar rules, vocabulary, sentence correction & para jumbles.',
    chaptersCount: VERBAL_CHAPTERS.length,
    chapters: VERBAL_CHAPTERS,
  },
];

export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];
