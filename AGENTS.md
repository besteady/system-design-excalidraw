# AGENTS.md

## Project Structure

Excalidraw is a **monorepo** with a clear separation between the core library and the application:

- **`packages/excalidraw/`** - Main React component library published to npm as `@excalidraw/excalidraw`
- **`excalidraw-app/`** - Full-featured web application (excalidraw.com) that uses the library
- **`packages/`** - Core packages: `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/utils`
- **`examples/`** - Integration examples (NextJS, browser script)

## Development Workflow

1. **Package Development**: Work in `packages/*` for editor features
2. **App Development**: Work in `excalidraw-app/` for app-specific features
3. **Testing**: Always run `yarn test:update` before committing
4. **Type Safety**: Use `yarn test:typecheck` to verify TypeScript

## Development Commands

```bash
yarn test:typecheck  # TypeScript type checking
yarn test:update     # Run all tests (with snapshot updates)
yarn fix             # Auto-fix formatting and linting issues
```

## Architecture Notes

### Package System

- Uses Yarn workspaces for monorepo management
- Internal packages use path aliases (see `vitest.config.mts`)
- Build system uses esbuild for packages, Vite for the app
- TypeScript throughout with strict configuration

## Canvas and UI Feature Workflow

For canvas-based UI work, define the visual and interaction contract before implementation:

- Specify each element's type (`rectangle`, bound text, standalone text, or app overlay), position, dimensions, fill, stroke, text alignment, and click behavior.
- Record the layout as a small geometry table with coordinates, widths, heights, gaps, and shared edges. Recalculate the whole column or grid when one block changes.
- Keep canvas elements and application UI separate. A canvas interaction should not become an overlay or embedded element unless that is explicitly part of the design.
- When a requirement has multiple reasonable interpretations, state the assumption and its tradeoff before coding.

Acceptance tests for visual features should verify both behavior and structural invariants:

- element presence or absence;
- `containerId`/`boundElements` relationships;
- coordinates, dimensions, shared boundaries, background, and stroke styles;
- state changes after selecting an item or opening a canvas interaction.

For every visual change, perform a browser or screenshot check in addition to unit, acceptance, and type tests. Do not consider a canvas layout complete based only on code-level tests.
