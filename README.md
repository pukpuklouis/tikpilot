# TikPilot

An AI-powered application that mimics human interaction on TikTok-like platforms, controlling multiple accounts via emulators, with a user-friendly frontend to manage setups.

## Monorepo Structure

```
tikpilot/
├── apps/
│   ├── frontend/     # React frontend
│   └── backend/      # Express backend
├── packages/
│   ├── shared/       # Shared utilities
│   └── types/        # Shared types
└── tools/
    └── scripts/      # Development tools
```

## Quick Start

1. Install dependencies:
```bash
pnpm install
```

2. Start development:
```bash
pnpm dev          # Frontend
pnpm dev:backend  # Backend
```

## Task Management

This project uses TaskMaster for development workflow management:

- `pnpm task list` - View all tasks and their status
- `pnpm task expand --id=<id>` - Break down complex tasks
- `pnpm task set-status --id=<id> --status=<status>` - Update task status
- `pnpm task analyze-complexity` - Analyze task complexity
- `pnpm task update --from=<id> --prompt="<text>"` - Update task descriptions

## Development Commands

- `pnpm build` - Build all packages
- `pnpm lint` - Run linting
- `pnpm test` - Run tests
- `pnpm clean` - Clean build artifacts

## Contributing Guidelines

1. No nested git repositories (enforced by pre-commit hook)
2. Add new packages to appropriate workspace directory:
   - New apps go in `apps/`
   - Shared code goes in `packages/`
   - Development tools go in `tools/`
3. Keep dependencies properly isolated between packages
4. Use workspace dependencies with `workspace:*` version
