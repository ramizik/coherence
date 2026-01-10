You are assisting with development during a **time-constrained hackathon**.

## Core Constraints
- Goal: build an **impressive, demo-ready MVP fast**
- Time is severely limited (≈24 hours of actual build time)
- Optimize for:
  - Speed of implementation
  - Demo stability
  - Visible functionality
- Do NOT optimize for:
  - Perfect architecture
  - Long-term scalability
  - Overengineering

If a solution is slower but “cleaner”, prefer the **faster, simpler** option.

## Development Principles

### 1. Fast, Practical Engineering
- Favor minimal, working solutions
- Avoid abstractions unless they save time immediately
- Keep the system easy to reason about under demo pressure
- Prefer monolith-style layouts over microservices

### 2. Test-Driven Development (Lightweight)
- Use **test-first or test-alongside** development when feasible
- All tests must live under: tests/
- Tests should:
- Validate core logic
- Catch obvious breakages
- Be fast to write and run
- Avoid exhaustive test coverage — focus on **critical paths only**

## Tech Stack (Fixed)

### Frontend
- React
- Node.js
- Tailwind CSS

### Backend
- Python
- FastAPI
- Gemini (multimodal LLM: text / image / video)

### Database
- MongoDB
- Used for both standard storage and **vector search** when needed

## AI / Sponsor Tooling (Potential Use)
You may reference or propose integration of these tools if relevant:

- TwelveLabs (video understanding & search)
- Deepgram (real-time speech-to-text)
- ElevenLabs (text-to-speech / voice)
- MongoDB Vector Search
- Snowflake Data Cloud
- Solana (only if it provides real, demo-visible value)

Do NOT force usage of sponsor tools unless they clearly improve:
- Demo impact
- Speed of development
- Judge-visible intelligence

## Guidance Style
When assisting:
- Be concise and direct
- Prefer small code snippets over large boilerplate
- Explain tradeoffs briefly
- If something is risky or slow, say so and suggest a simpler alternative

If a feature does not improve the demo or MVP quality, recommend cutting it.

## Non-Negotiable Design Principles
See AGENTS.md for detailed principles.


## Documentation Policy (Important)

Do **NOT** generate new documentation `.md` files after every task.
Only create documentation at **milestones** and **only when I explicitly prompt for it**.
All documentation must be stored in 'documentation' folder

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

## Subagent usage

Use Claude Code subagents from `.claude/agents/` when it improves quality or parallelizes work; pick the smallest set of agents needed for the task. The project contains these agents:

- architect-reviewer
- backend-developer
- code-reviewer
- frontend-developer
- fullstack-developer
- react-specialist
- typescript-pro
- ui-designer

Guidelines:

- Use `architect-reviewer` for big refactors, routing/data boundaries, and maintainability checks.
- Use `frontend-developer` + `ui-designer` for UI/UX, page layout, and responsive behavior.
- Use `fullstack-developer` for end-to-end features spanning client and server; API routes, server actions, data fetching patterns, and frontend-backend integration.
- Use `react-specialist` for component patterns, hooks, state, and performance pitfalls.
- Use `typescript-pro` whenever adding/changing types, API contracts, or complex props.
- Use `backend-developer` for server/API/data/auth logic and error-handling.
- Use `code-reviewer` at the end for a "PR review" pass before final output.

## Finding library/API documentation

Always use context7 when I need code generation, setup or configuration steps, or
library/API documentation. This means you should automatically use the Context7 MCP
tools to resolve library id and get library docs without me having to explicitly ask.