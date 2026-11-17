export const CORE_CS_SUBJECTS_LIST = [
  {
    id: 'DBMS',
    name: 'DBMS',
    fullName: 'Database Management Systems',
    description: 'Relational database fundamentals, SQL queries, Normalization, ACID transaction properties, and Indexing.',
    tag: 'Database & SQL',
    topics: ['Normalization', 'Transactions', 'Indexing', 'Concurrency Control', 'Relational Algebra', 'ER Modeling'],
  },
  {
    id: 'Operating Systems',
    name: 'Operating Systems',
    fullName: 'Operating Systems',
    description: 'Process management, CPU scheduling, Deadlocks, Synchronization, Virtual Memory, and File Systems.',
    tag: 'System Core',
    topics: ['Process Management', 'CPU Scheduling', 'Deadlocks', 'Process Synchronization', 'Virtual Memory', 'Paging'],
  },
  {
    id: 'Computer Networks',
    name: 'Computer Networks',
    fullName: 'Computer Networks',
    description: 'OSI 7-layer model, TCP/IP architecture, Subnetting, Transport protocols, DNS, and Network Security.',
    tag: 'Networking',
    topics: ['OSI Model', 'TCP/IP', 'Subnetting', 'Application Protocols', 'Routing', 'Flow & Error Control'],
  },
  {
    id: 'OOP',
    name: 'OOP',
    fullName: 'Object-Oriented Programming',
    description: 'Encapsulation, Polymorphism, Inheritance, Abstraction, and SOLID Object-Oriented Design principles.',
    tag: 'Software Design',
    topics: ['Encapsulation', 'Polymorphism', 'Inheritance', 'Abstraction', 'SOLID Principles', 'Design Patterns'],
  },
  {
    id: 'Software Engineering',
    name: 'Software Engineering',
    fullName: 'Software Engineering',
    description: 'SDLC models, Agile and Scrum methodologies, Software Testing types, Requirements, and Quality Assurance.',
    tag: 'Development Lifecycle',
    topics: ['SDLC Models', 'Agile & Scrum', 'Software Testing', 'Design Patterns', 'System Design Basics'],
  },
  {
    id: 'SQL / Query Practice',
    name: 'SQL / Query Practice',
    fullName: 'SQL / Query Practice',
    description: 'Complex Joins, Aggregation with GROUP BY / HAVING, Subqueries, Window Functions, and DDL/DML.',
    tag: 'Queries & Data',
    topics: ['Joins', 'Aggregation & Filtering', 'Window Functions', 'Subqueries', 'DDL vs DML', 'Indexing in SQL'],
  },
  {
    id: 'Computer Architecture & Organization',
    name: 'Computer Architecture & Organization',
    fullName: 'Computer Architecture & Organization',
    description: 'Instruction Pipelining, Hazards, Cache Memory hierarchy, Instruction formats, and RISC vs CISC.',
    tag: 'Hardware Architecture',
    topics: ['Pipelining', 'Cache Memory', 'Pipeline Hazards', 'Instruction Formats', 'Memory Hierarchy'],
  },
  {
    id: 'Data Structures Fundamentals',
    name: 'Data Structures Fundamentals',
    fullName: 'Data Structures Fundamentals',
    description: 'Time and space complexity, Linear data structures, Trees, Heaps, Hashing, and Graph representations.',
    tag: 'Algorithms & Data',
    topics: ['Complexity Analysis', 'Stacks & Queues', 'Trees', 'Graphs & Queues', 'Heaps', 'Hash Tables'],
  },
];

export const getSubjectMeta = (subjectName) => {
  if (!subjectName) return null;
  const decoded = decodeURIComponent(subjectName).trim();
  return (
    CORE_CS_SUBJECTS_LIST.find(
      (s) => s.name.toLowerCase() === decoded.toLowerCase() || s.id.toLowerCase() === decoded.toLowerCase()
    ) || {
      id: decoded,
      name: decoded,
      fullName: decoded,
      description: 'Core Computer Science preparation topic.',
      tag: 'Core CS',
      topics: [],
    }
  );
};
