This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploying

This repo is private. `.github/workflows/nextjs.yml` builds the static site and pushes only `out/`
to the public repo `zeus11011/zeus11011.github.io` (branch `gh-pages`), which GitHub Pages serves.

One-time setup:
1. Create the public repo `zeus11011.github.io` (empty).
2. Create a fine-grained token: GitHub > Settings > Developer settings > Personal access tokens >
   Fine-grained, repository access = only `zeus11011.github.io`, permission Contents: Read and write.
3. In this repo: Settings > Secrets and variables > Actions > New secret `PAGES_TOKEN` = that token.
4. Push to `main` (or run the workflow from the Actions tab). After the first run, in the public repo:
   Settings > Pages > Source: Deploy from a branch, branch `gh-pages`, folder `/ (root)`.
5. Make this repo private: Settings > General > Danger Zone > Change visibility.

Site: https://zeus11011.github.io/
