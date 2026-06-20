# Next.js template

This is a Next.js template with shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```

## Testing

Run the complete Playwright suite:

```bash
npm test
```

Use `npm run test:unit` or `npm run test:e2e` to run either suite separately.
The E2E configuration starts the Next.js development server automatically.

## Releases

Pushes to `main` run type checking, linting, a production build, and the
Playwright suites. After those checks pass, semantic-release creates the next
Git tag, updates `CHANGELOG.md`, and publishes a GitHub release.

Use Conventional Commit messages such as `feat: add search` or
`fix: handle an empty response` so semantic-release can determine the next
version. This project does not publish a package to npm.
