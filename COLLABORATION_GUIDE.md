# Collaboration Guide

## Purpose

This repository now has two priorities, in this order:

1. Web-hosted service build
2. Separate local single-file build

The team must not mix those two tracks during day-to-day work.

## Roles

### Codex

Primary role:

- Idea validation
- Market research
- Product planning
- Marketing strategy
- Policy and operating rules
- Collaboration guardrails

Codex owns these document areas by default:

- `COLLABORATION_GUIDE.md`
- `README.md`
- `docs/GO_TO_MARKET_STRATEGY.md`
- `docs/PMF_HYPOTHESES.md`
- `docs/ROADMAP.md`
- `docs/EXECUTION_BACKLOG.md`
- product/market/policy notes in Markdown

Codex should not directly change release-critical UI behavior unless explicitly reassigned.

### Claude

Primary role:

- Design
- Frontend development
- QA execution

Claude owns these implementation areas by default:

- `comparer_dev_qa.html`
- `dev-assets/**`
- visual design changes
- interaction logic
- QA fixes tied to implementation

Claude should treat `index.html` and `assets/**` as release targets, not day-to-day development files.

### Proposed extra role: Release Integrator

This role is required because someone must own the `dev -> prod` promotion step.

Rules:

- Only one active Release Integrator at a time
- Default owner: Claude for technical promotion, user for final approval
- Codex defines the release checklist and gate criteria

Release Integrator responsibilities:

- Promote approved `dev` changes into production files
- Confirm references and paths still work on static hosting
- Keep production and local build boundaries intact

## File Ownership

### Production files

- `index.html`
- `assets/css/comparer.css`
- `assets/js/parse-exr.js`
- `assets/js/comparer-app.js`

Rules:

- Do not use these as active experimentation files
- Update only after QA signoff on the dev build
- Production sync should be done in a single intentional pass

### Dev and QA files

- `comparer_dev_qa.html`
- `dev-assets/css/comparer.css`
- `dev-assets/js/parse-exr.js`
- `dev-assets/js/comparer-app.js`

Rules:

- All feature work starts here
- All UI experiments happen here
- QA is executed against this build first

### Local single-file build

- `local-single-file/comparer_local_singlefile.html`

Rules:

- Separate product track
- Keep it downloadable and self-contained
- Do not block web-hosted service work for local-build improvements
- Port changes into this file only when intentionally maintaining the local build

### Historical backups

- `comparer_v1.6_260416.html`
- `legacy/**`

Rules:

- Preserve as references
- Do not treat as active implementation targets

## Branch Rules

- Never work directly on `main`
- Use separate branches per person and task
- Recommended branch names:
  - `codex/<topic>`
  - `claude/<topic>`
  - `release/<date-or-topic>`

## Working Rules

- Codex decides positioning, roadmap priority, policy, documentation direction, and release gates
- Claude decides implementation details, design execution, and QA fixes inside the dev build
- If a change affects both product policy and implementation, Codex defines intent first and Claude implements second
- If a file has a clear owner, the other agent should not modify it unless reassigned
- If a cross-cutting change is unavoidable, document the handoff in the commit or PR summary

## Promotion Flow

1. Implement in `comparer_dev_qa.html` and `dev-assets/**`
2. Run QA on the dev build
3. Freeze scope for the release candidate
4. Promote the approved result into `index.html` and `assets/**`
5. Smoke test the production build
6. Push only after the promotion pass is complete

## Non-Negotiables

- `index.html` is the production entry, not the sandbox
- `comparer_dev_qa.html` is the active feature-development entry
- `local-single-file/**` is a separate maintenance track
- One person owns release promotion at a time
- Policy decisions and implementation decisions should not be merged into one undocumented edit
