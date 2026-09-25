// User model placeholder
// Schema will be created in Phase 6: MongoDB & Authentication

export const userModelPlaceholder = `
User Schema Structure:
- _id: ObjectId
- fullName: String (required)
- email: String (required, unique)
- password: String (hashed, required)
- college: String
- degree: String
- graduationYear: Number
- targetRole: String
- skills: [String]
- role: Enum ['student', 'admin']
- isEmailVerified: Boolean
- createdAt: Date
- updatedAt: Date
`;
