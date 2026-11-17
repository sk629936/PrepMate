import DSAProblem from '../models/DSAProblem.js';
import { problems as initialProblems } from './dsaProblems.js';

/**
 * Seed DSA Problems from existing 44 problem catalog into MongoDB if empty.
 * Guarantees all 44 original problems and LeetCode URLs remain 100% intact.
 */
export async function seedDSAProblemsIfEmpty() {
  try {
    const count = await DSAProblem.countDocuments();
    if (count === 0) {
      console.log('Seeding initial 44 DSA problems into MongoDB...');
      const docsToInsert = initialProblems.map((p, index) => ({
        id: p.id,
        title: p.title,
        topic: p.topic,
        difficulty: p.difficulty,
        leetcodeUrl: p.leetcodeUrl,
        order: index + 1,
        isPublished: true,
        isActive: true,
        statement: p.statement || '',
        examples: p.examples || [],
        constraints: p.constraints || [],
      }));

      await DSAProblem.insertMany(docsToInsert);
      console.log(`Successfully seeded ${docsToInsert.length} DSA problems.`);
    }
  } catch (error) {
    console.error('Error auto-seeding DSA problems:', error.message);
  }
}

export default seedDSAProblemsIfEmpty;
