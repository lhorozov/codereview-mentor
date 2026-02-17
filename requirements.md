## **CodeReview Mentor**

**Time Suggestion:** 6-8 hours focused work

**Tech Stack:**

- Next.js (App Router)
- TypeScript
- tRPC (API implementation)
- Prisma + SQLite (Database)
- Zod validation
- Vercel AI SDK (Streaming)
- Tailwind + shadcn/ui (UI)

### **Objective**

Create a web app where developers can submit code snippets and receive streaming AI feedback through a single technical reviewer persona. Focus on a polished core experience over feature completeness.

### **Core Requirements**

### **1. Code Submission System**

**Must Have:**

Code input textarea with:

Basic syntax highlighting (choose **ONE** language: JS/TS/Python)

Language selection dropdown (minimum 3 options)

Submission history stored in database:

List of past submissions (code preview + truncated feedback)

Detailed view of individual submission

**Technical Implementation:**

1 tRPC router for code submissions

Prisma schema with:

model Submission {
id        String @id @default(cuid())
code      String
language  String
feedback  String
createdAt DateTime @default(now())
}

### **2. AI Review System**

**Must Have:**

- Implement **ONE** focused technical persona (e.g. "Security Specialist" `specialty`) using:
    - Vercel AI SDK's streaming capabilities
    - System prompt enforcing persona's technical focus
    - Basic stop conditions (max tokens = 450)
- Streaming UI with:
    - Real-time feedback display
    - Loading states
    - Error handling for failed generations

**Example Prompt Structure:**

"Act as a senior {specialty} engineer. Analyze this {language} code for {specialty} issues.
Format response as:

1. Brief summary (1 sentence)
2. Key findings (bulleted list)
3. Most critical recommendation
Avoid markdown. Be technical but concise."

### **3. Technical Implementation**

**Essential Requirements:**

- Implement these tRPC endpoints:
    1. `submissions.create` (Create new code submission)
    2. `submissions.getAll` (List recent submissions)
    3. `ai.generateFeedback` (Streaming AI response)
- Zod validation for:
    - Code submissions (min 30 chars, max 500 chars)
    - Language selection (predefined allowlist)
- Error handling for:
    - AI API failures (clear user notification)
    - Database errors
    - Invalid submissions

### **4. UI Requirements**

**Focus Areas:**

- Main page with:
    - Code input form
    - Real-time feedback stream display
    - Submission history sidebar
- Use shadcn/ui components for:
    - Button
    - Textarea
    - Card (submissions list)
    - Skeleton (loading states)
- Mobile-responsive layout

## **Bonus Features (Optional)**

Choose **ONE**:

1. Basic Syntax Validation:
    - Detect mismatched brackets in code input
    - Visual indicator for invalid syntax
2. Feedback Reactions:
    - Add thumbs up/down to saved feedback
    - Persist reactions in database
3. Shared Review Link:
    - Generate view-only URLs for submissions
    - Public page without auth

### **Evaluation Criteria**

| Category | Key Considerations |
| --- | --- |
| Core Functionality | Working E2E flow (submit → AI response → history) |
| Code Quality | Type safety, proper abstractions, clean structure |
| Streaming UX | Smooth feedback display with loading states |
| Error Handling | Graceful failure recovery & user feedback |
| Technical Choices | Appropriate SDK/stack usage |
| Documentation | Clear README with setup & key decisions |
|  |  |

## **Submission Requirements**

1. Deployed prototype (Vercel preferred)
2. GitHub/GitLab repo containing:
    - Complete source code
    - `prisma/schema.prisma`
    - `README.md` with:
        - Setup instructions
        - Key technical decisions
        - Known limitations
3. (Optional) Short Loom demo video (~2 min)