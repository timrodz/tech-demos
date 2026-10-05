# tech-demos

A collection of hyper-specific technical demonstrations built with modern web technologies.

## What's inside

This is a Turborepo monorepo using Bun for package management. Each demo lives in `apps/` and focuses on a single, well-defined technical scenario—no boilerplate, no unnecessary dependencies.

## Running demos

From the repository root:

```bash
# Install dependencies
bun install

# Run a specific demo (e.g., demo-1)
bun run demo-1
```

Each demo includes its own README with technical details and rationale.

## Adding new demos

1. Create a new directory in `apps/` (e.g., `apps/demo-2`)
2. Add a `package.json` with the demo's dependencies
3. Implement the demo (keep it minimal and focused)
4. Add a detailed README explaining what, why, and how
5. Add a script in the root `package.json`: `"demo-2": "cd apps/demo-2 && bun run dev"`
6. Update `SHIPPED_DEMOS.md` with an entry for the new demo

## Shipped demos

See [SHIPPED_DEMOS.md](./SHIPPED_DEMOS.md) for the full list of demos with dates and descriptions.

## Structure

```
tech-demos/
├── apps/
│   └── demo-1/          # First demo: vgpu UV gradient shader
├── package.json         # Root workspace config
├── turbo.json          # Turborepo config
├── README.md           # This file
└── SHIPPED_DEMOS.md    # Record of shipped demos
```

## Requirements

- Bun >= 1.0
- Node.js >= 18 (for compatibility)
- Modern browser with WebGPU support (for WebGPU demos)

## Development philosophy

Each demo should:
- Focus on one specific technical scenario
- Use minimal dependencies
- Include comprehensive documentation
- Be independently runnable
- Compile and work on first try
