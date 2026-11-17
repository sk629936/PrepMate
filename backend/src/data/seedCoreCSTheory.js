export const seedCoreCSTheory = [
  // 1. DBMS
  {
    title: 'Database Normalization and Functional Dependencies',
    subject: 'DBMS',
    topic: 'Normalization',
    type: 'text',
    summary: 'Comprehensive notes on 1NF, 2NF, 3NF, and BCNF with functional dependency definitions and candidate key resolution.',
    content: `# Database Normalization & Normal Forms

## 1. What is Normalization?
Normalization is a systematic database design technique to minimize data redundancy and eliminate insert, update, and delete anomalies.

### Common Anomalies
- **Insertion Anomaly:** Inability to insert a record without inserting unrelated data.
- **Update Anomaly:** Inconsistency caused by modifying redundant data in only one location.
- **Deletion Anomaly:** Accidental loss of unrelated data when deleting a record.

---

## 2. Functional Dependency (FD)
An attribute \`Y\` is functionally dependent on \`X\` (denoted \`X -> Y\`) if each value of \`X\` uniquely determines the value of \`Y\`.

---

## 3. Normal Forms Summary

| Normal Form | Rule Requirement | Dependency Eliminated |
|---|---|---|
| **1NF** | Atomic values only in attributes; no repeating groups. | Non-atomic arrays/multivalues |
| **2NF** | In 1NF + No partial dependencies on candidate keys. | Partial Dependency |
| **3NF** | In 2NF + No transitive dependencies of non-prime attributes on candidate keys. | Transitive Dependency |
| **BCNF** | For every functional dependency \`X -> Y\`, \`X\` must be a superkey. | All functional anomalies |

---

## 4. Key Takeaways for Placement Interviews
1. Always compute Candidate Keys first before determining the highest normal form.
2. 3NF allows \`X -> Y\` if \`X\` is superkey OR \`Y\` is prime attribute. BCNF strictly requires \`X\` to be a superkey.`,
    order: 1,
    isPublished: false,
  },
  {
    title: 'ACID Properties and Transaction Management',
    subject: 'DBMS',
    topic: 'Transactions',
    type: 'text',
    summary: 'Deep dive into Atomicity, Consistency, Isolation, and Durability, with concurrency anomalies and transaction states.',
    content: `# ACID Properties in Relational Databases

## 1. ACID Overview
A **Transaction** is a logical unit of work that contains one or more database operations. To ensure database integrity, every transaction must obey the ACID properties:

- **Atomicity (All or Nothing):** The entire transaction either commits successfully or rolls back completely. Managed by the *Recovery Management Component* using write-ahead logs.
- **Consistency:** Execution of a transaction in isolation preserves database invariants and constraints (foreign keys, check constraints).
- **Isolation:** Intermediate transaction states are invisible to other concurrent transactions. Managed by the *Concurrency Control Component* (locks, timestamps).
- **Durability:** Once committed, updates persist even across system crashes or power outages.

---

## 2. Concurrency Control & Anomalies
- **Dirty Read (Read Uncommitted):** Reading uncommitted modifications made by another active transaction.
- **Non-repeatable Read:** Re-reading the same row within a transaction produces different data because another transaction committed an update.
- **Phantom Read:** Re-executing a range query returns newly inserted rows committed by another transaction.

---

## 3. Standard SQL Isolation Levels

| Isolation Level | Dirty Read | Non-Repeatable Read | Phantom Read |
|---|---|---|---|
| **Read Uncommitted** | Allowed | Allowed | Allowed |
| **Read Committed** | Prevented | Allowed | Allowed |
| **Repeatable Read** | Prevented | Prevented | Allowed |
| **Serializable** | Prevented | Prevented | Prevented |`,
    order: 2,
    isPublished: false,
  },

  // 2. Operating Systems
  {
    title: 'Process Management and CPU Scheduling Algorithms',
    subject: 'Operating Systems',
    topic: 'Process Management',
    type: 'text',
    summary: 'Process Control Block (PCB), context switching, preemptive vs non-preemptive scheduling, and standard algorithms.',
    content: `# Process Management & CPU Scheduling

## 1. Process Concept
A process is a program in execution containing:
- **Text Section:** Program code
- **Stack:** Temporary data (function arguments, local variables)
- **Heap:** Dynamically allocated memory
- **Data Section:** Global and static variables

### Process States
\`New -> Ready <-> Running -> Terminated\` (with \`Waiting / Blocked\` transitions).

---

## 2. Process Control Block (PCB)
The OS maintains state information in the PCB:
1. Process ID (PID)
2. Program Counter (PC)
3. CPU registers
4. CPU scheduling information (priority)
5. Memory management information (page tables)
6. I/O status information

---

## 3. CPU Scheduling Metrics & Algorithms
- **Turnaround Time:** \`Completion Time - Arrival Time\`
- **Waiting Time:** \`Turnaround Time - Burst Time\`
- **Response Time:** Time from arrival to first CPU allocation.

### Standard Algorithms:
- **FCFS (First-Come First-Served):** Non-preemptive, suffers from the *Convoy Effect*.
- **SJF (Shortest Job First):** Provably optimal for minimum average waiting time. Preemptive version is **SRTF** (Shortest Remaining Time First).
- **Round Robin (RR):** Preemptive scheduling using a fixed *time quantum*.
- **Priority Scheduling:** Can cause starvation; solved using *Aging*.`,
    order: 1,
    isPublished: false,
  },
  {
    title: 'Deadlock Conditions, Prevention, and Banker’s Algorithm',
    subject: 'Operating Systems',
    topic: 'Deadlocks',
    type: 'text',
    summary: 'The 4 Coffman conditions, Resource Allocation Graphs (RAG), Deadlock avoidance, and safe state calculations.',
    content: `# Deadlocks in Operating Systems

## 1. Four Coffman Conditions
A deadlock can arise if and only if all four conditions hold simultaneously:
1. **Mutual Exclusion:** At least one resource is held in a non-shareable mode.
2. **Hold and Wait:** A process is holding at least one resource and requesting additional resources held by others.
3. **No Preemption:** Resources cannot be forcibly taken from a process; they must be released voluntarily.
4. **Circular Wait:** A set of processes \`{P0, P1, ..., Pn}\` exists such that \`P0\` waits for \`P1\`, \`P1\` waits for \`P2\`, and \`Pn\` waits for \`P0\`.

---

## 2. Handling Deadlocks
- **Deadlock Prevention:** Design protocols ensuring at least one Coffman condition cannot hold.
- **Deadlock Avoidance:** Dynamically evaluate resource allocation state using the **Banker's Algorithm**.
- **Deadlock Detection & Recovery:** Allow deadlock, detect cycle in Wait-For Graph, and terminate processes or preempt resources.
- **Ostrich Algorithm:** Ignore the problem if occurrence probability is minimal.`,
    order: 2,
    isPublished: false,
  },

  // 3. Computer Networks
  {
    title: 'OSI 7-Layer and TCP/IP Architecture Models',
    subject: 'Computer Networks',
    topic: 'Network Models',
    type: 'text',
    summary: 'Layer duties, encapsulation headers, PDUs, and protocol mappings across OSI and TCP/IP stacks.',
    content: `# Network Models: OSI 7-Layer and TCP/IP

## 1. OSI Layer Reference Model

1. **Application (Layer 7):** Network services to end-user applications (HTTP, DNS, SMTP, FTP).
2. **Presentation (Layer 6):** Data translation, encryption/decryption, compression (SSL/TLS, ASCII, JPEG).
3. **Session (Layer 5):** Establishes, manages, and terminates communication sessions between processes.
4. **Transport (Layer 4):** End-to-end communication, port addressing, segmentation, reliability (TCP, UDP). **PDU: Segment / Datagram**.
5. **Network (Layer 3):** Logical addressing and packet routing across networks (IPv4, IPv6, ICMP, OSPF, BGP). **PDU: Packet**.
6. **Data Link (Layer 2):** Physical addressing (MAC), node-to-node framing, error detection (Ethernet, Wi-Fi, ARP). **PDU: Frame**.
7. **Physical (Layer 1):** Bit transmission over physical medium (cables, radio waves, optical fibers). **PDU: Bit**.

---

## 2. TCP vs UDP Protocol Comparison

| Feature | TCP (Transmission Control Protocol) | UDP (User Datagram Protocol) |
|---|---|---|
| **Connection** | Connection-oriented (3-way handshake) | Connectionless |
| **Reliability** | Guaranteed delivery with ACKs & retransmissions | Best-effort delivery |
| **Ordering** | In-order packet delivery guaranteed | Packets may arrive out-of-order |
| **Header Size** | 20 to 60 bytes | 8 bytes |
| **Use Cases** | Web (HTTP/HTTPS), Email, File Transfer | Video Streaming, Gaming, DNS queries |`,
    order: 1,
    isPublished: false,
  },

  // 4. OOP
  {
    title: 'Core Object-Oriented Programming Principles & SOLID',
    subject: 'OOP',
    topic: 'OOP Concepts',
    type: 'text',
    summary: 'Encapsulation, Abstraction, Inheritance, Polymorphism, and clean architectural SOLID principles.',
    content: `# Core OOP Principles and SOLID Architecture

## 1. The Four Pillars of OOP
1. **Encapsulation:** Bundling data (state) and methods (behavior) within a class while restricting direct access to object internals via private/protected access modifiers.
2. **Abstraction:** Hiding complex implementation details and presenting only essential interfaces to users (interfaces, abstract classes).
3. **Inheritance:** Mechanism by which a new class derives properties and behaviors from an existing class to foster reusability.
4. **Polymorphism:** Ability of an entity to take multiple forms:
   - *Compile-time (Static):* Method overloading and operator overloading.
   - *Runtime (Dynamic):* Method overriding through virtual functions / interfaces.

---

## 2. SOLID Design Principles

- **S - Single Responsibility Principle (SRP):** A class should have one, and only one, reason to change.
- **O - Open/Closed Principle (OCP):** Software entities should be open for extension, but closed for modification.
- **L - Liskov Substitution Principle (LSP):** Subtypes must be substitutable for their base types without altering correctness.
- **I - Interface Segregation Principle (ISP):** Clients should not be forced to depend upon interfaces they do not use.
- **D - Dependency Inversion Principle (DIP):** High-level modules should depend on abstractions, not concrete implementations.`,
    order: 1,
    isPublished: false,
  },

  // 5. Software Engineering
  {
    title: 'Software Development Life Cycle (SDLC) and Agile Methodologies',
    subject: 'Software Engineering',
    topic: 'SDLC & Agile',
    type: 'text',
    summary: 'SDLC phases, Waterfall vs Agile Scrum comparison, sprints, user stories, and QA testing pyramids.',
    content: `# SDLC and Agile Methodologies

## 1. SDLC Phases
1. Requirement Analysis & Specification (SRS)
2. System & Architectural Design (HLD & LLD)
3. Implementation / Coding
4. Testing (Unit, Integration, System, Acceptance)
5. Deployment
6. Maintenance

---

## 2. Agile vs Waterfall
- **Waterfall:** Linear sequential model where requirements must be fixed upfront. Low flexibility for evolving requirements.
- **Agile Scrum:** Iterative incremental approach delivering working software in sprints (typically 2-4 weeks). Encourages continuous stakeholder collaboration.

---

## 3. Types of Software Testing
- **Unit Testing:** Testing individual components/functions in isolation.
- **Integration Testing:** Testing interactions between integrated units/modules.
- **Regression Testing:** Verifying existing features remain intact after code modifications.
- **End-to-End (E2E) Testing:** Testing user workflows from frontend to database.`,
    order: 1,
    isPublished: false,
  },

  // 6. SQL / Query Practice
  {
    title: 'Essential SQL Query Patterns: Joins, Aggregation & Window Functions',
    subject: 'SQL / Query Practice',
    topic: 'SQL Mastery',
    type: 'text',
    summary: 'Inner vs Outer Joins, GROUP BY vs HAVING, Subqueries, CTEs, and Window Functions (ROW_NUMBER, RANK, DENSE_RANK).',
    content: `# Essential SQL Patterns & Query Practice

## 1. Relational Joins
- **INNER JOIN:** Returns matching rows in both tables.
- **LEFT (OUTER) JOIN:** Returns all rows from the left table and matched rows from the right table.
- **RIGHT (OUTER) JOIN:** Returns all rows from the right table and matched rows from the left table.
- **FULL OUTER JOIN:** Returns rows when there is a match in either table.
- **CROSS JOIN:** Cartesian product of all rows.

---

## 2. Window Functions Cheat Sheet
\`\`\`sql
-- Ranking employees by salary per department
SELECT 
  employee_id,
  department_id,
  salary,
  ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS row_num,
  RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS salary_rank,
  DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS dense_salary_rank
FROM employees;
\`\`\`

- **ROW_NUMBER():** Assigns unique consecutive numbers (1, 2, 3, 4).
- **RANK():** Assigns identical rank to ties and skips subsequent numbers (1, 2, 2, 4).
- **DENSE_RANK():** Assigns identical rank to ties without skipping (1, 2, 2, 3).`,
    order: 1,
    isPublished: false,
  },

  // 7. Computer Architecture & Organization
  {
    title: 'Instruction Pipelining, Hazards, and Cache Memory Hierarchy',
    subject: 'Computer Architecture & Organization',
    topic: 'Pipelining & Memory',
    type: 'text',
    summary: 'Five-stage RISC pipeline, data/control/structural hazards, forwarding, cache mapping schemes, and hit/miss times.',
    content: `# Instruction Pipelining and Cache Architecture

## 1. Standard 5-Stage Instruction Pipeline
1. **IF (Instruction Fetch):** Read instruction from instruction memory via PC.
2. **ID (Instruction Decode / Register Read):** Decode opcode and read source registers.
3. **EX (Execute / Address Calculation):** ALU execution or effective memory address calculation.
4. **MEM (Memory Access):** Read or write data memory.
5. **WB (Write Back):** Write computed result back into destination register.

---

## 2. Pipeline Hazards
- **Structural Hazard:** Resource conflict where hardware cannot support multiple instructions simultaneously (e.g. single port memory).
- **Data Hazard:** Data dependencies across stages (Read-After-Write, Write-After-Read, Write-After-Write). Solved with *operand forwarding* or *pipeline stalls (bubbles)*.
- **Control Hazard (Branch Hazard):** Caused by conditional/unconditional branch instructions altering program flow. Solved with *branch prediction* and *delayed branching*.

---

## 3. Cache Mapping Schemes
- **Direct Mapped:** Each block has exactly one location in cache (\`Block mod CacheLines\`).
- **Fully Associative:** A block can reside in any line in cache.
- **N-Way Set Associative:** Cache is divided into sets, each with \`N\` lines.`,
    order: 1,
    isPublished: false,
  },

  // 8. Data Structures Fundamentals
  {
    title: 'Core Data Structures: Complexities, Trade-offs, and Applications',
    subject: 'Data Structures Fundamentals',
    topic: 'Data Structure Basics',
    type: 'text',
    summary: 'Time/space complexities for Arrays, Linked Lists, Stacks, Queues, Hash Tables, Trees, and Heaps.',
    content: `# Core Data Structures Reference Guide

## 1. Complexity Comparison Table

| Data Structure | Access (Avg) | Search (Avg) | Insertion (Avg) | Deletion (Avg) |
|---|---|---|---|---|
| **Array** | O(1) | O(N) | O(N) | O(N) |
| **Singly Linked List** | O(N) | O(N) | O(1) *(at head)* | O(1) *(at head)* |
| **Stack / Queue** | O(N) | O(N) | O(1) *(push/enqueue)* | O(1) *(pop/dequeue)* |
| **Hash Table** | N/A | O(1) | O(1) | O(1) |
| **Binary Search Tree** | O(log N) | O(log N) | O(log N) | O(log N) |
| **AVL / Red-Black Tree** | O(log N) | O(log N) | O(log N) | O(log N) |
| **Min/Max Heap** | O(1) *(peek)* | O(N) | O(log N) | O(log N) *(extract)* |

---

## 2. Essential Applications
- **Stack:** Function call stack, parenthesis matching, backtracking algorithms, undo/redo buffers.
- **Queue:** CPU scheduling, printer spooling, Breadth-First Search (BFS) graph traversal.
- **Hash Table:** Fast key-value lookups, symbol tables in compilers, memoization caches.
- **Heap / Priority Queue:** Dijkstra's shortest path, Prim's Minimum Spanning Tree, Huffman encoding.`,
    order: 1,
    isPublished: false,
  },
];
