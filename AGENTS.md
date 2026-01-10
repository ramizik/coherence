You are an AI agent assisting with development of a **hackathon project**.

## Context & Objective
We are building a **demo-first, impressive MVP** under extreme time constraints.
- Build time is very limited (≈24 hours of active development)
- Success is defined by:
  - A working live demo
  - Clear AI-driven value
  - Stability under demo conditions
- This is not a production system

Optimize for **clarity, speed, and visible impact** over perfection.


## Global Constraints
- Prefer simple, reliable implementations
- Avoid overengineering and speculative features
- If a feature does not improve the demo or MVP quality, recommend cutting it
- Assume multiple contributors (human + AI) are working in parallel

## Modular Development Rules (MANDATORY)

The project must be built in a **modular, decomposed way**:

- Separate folders/files by **distinct responsibility**
- Each module should:
  - Do one thing
  - Have a clear input/output contract
  - Be understandable in isolation
- Avoid large “god files”
- Prefer composition over tight coupling

Modules must be easy to:
- Replace
- Stub
- Debug independently

## Core Design Principles (Enforced)

### 1. Principle of Least Astonishment (POLA)
Code should behave exactly as a reasonable reader expects.
- Avoid clever tricks
- Avoid hidden side effects
- Prefer boring, obvious logic

### 2. Keep It Simple, Stupid (KISS)
- Choose the simplest solution that works
- Fewer abstractions > more abstractions
- Fewer dependencies > more dependencies

If something requires explanation, it’s probably too complex.

### 3. You Ain’t Gonna Need It (YAGNI)
- Do not add functionality “just in case”
- Do not generalize prematurely
- Build only what is required for:
  - Core workflow
  - Demo success

Future ideas go in comments, not code.

### 4. Explicit Semantics
- Numeric values must be **explicitly labeled**
- No unlabeled value runs
- Parameters must be named and self-describing

### 5. Mono Low-End Is an Emergent Property
(Design constraint principle)

Do not rely on single “magic switches” to enforce global behavior.
Instead:
- Achieve desired system properties through **combined constraints**
- Let correctness emerge from:
  - Clear module boundaries
  - Explicit assumptions
  - Simple rules applied consistently

This applies broadly to system behavior, not just audio concepts.

## Collaboration Rules (Human + AI)

- Write code that another developer can understand in seconds
- Prefer readable naming over short naming
- Leave brief comments where intent is non-obvious
- Avoid hidden global state

If a decision trades speed vs clarity:
- Choose **clarity** unless speed is absolutely critical for the demo

## Final Guideline
The goal is not elegance.
The goal is a **working, understandable, demo-stable system** that looks intentional.

If something increases risk without increasing demo impact, recommend against it.


## Documentation Policy

Do **NOT** generate new documentation `.md` files after every task.
Only create documentation at **milestones** and **only when I explicitly prompt for it**.
All documentation must be stored in 'documentation' folder

### Code Style

- **PEP 8:** Follow PEP 8 style guidelines for Python code
- **Type Hints:** Use type hints to improve code readability and maintainability
- **Docstrings:** Write clear and concise docstrings for all functions and classes
- **Comments:** Use comments to explain complex or non-obvious code
- **Line Length:** Limit line length to 120 characters

### Error Handling

- **Error Handling:** Use exceptions to handle errors. Provide informative error messages.
- **Logging:** Use the `logging` module for structured logging.
- **Repair Logging:** During the repair process, log all changes made to the data. The repair function must return a report with a list of changes.
- **Warning vs. Error:** Soft rule violations generate warnings (logged but don't fail validation). Hard rule violations generate errors that fail validation.
- Prefer explicit error messages over silent fallbacks

## "Role" mental models (map to existing Claude agents available in .claude/agents folder)

Use these specializations as needed (even if Cursor doesn't literally "switch agents"):

- architect-reviewer: sanity-check structure, boundaries, and long-term maintainability.
- backend-developer: API/data model/auth/server logic; validate error handling and contracts.
- frontend-developer: page composition, state management, UX, responsive behavior.
- fullstack-developer: end-to-end features spanning client and server; API routes, server actions, data fetching patterns, and frontend-backend integration.
- react-specialist: component architecture, hooks, memoization, React best practices.
- typescript-pro: types, generics, inference, avoiding unsafe casts.
- ui-designer: layout, spacing, typography, a11y, and shadcn-consistent UI.
- code-reviewer: PR-level feedback; keep suggestions actionable and prioritized.