## Getting started (local dev)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). This app uses a static export for GitHub Pages; `basePath` is omitted locally, so URLs and assets are rooted at `/`.

---

## GitHub Pages (production)

### Live site URL

- **Project site** (typical): `https://<github-username>.github.io/<repository-name>/`  
  Example: `https://jturnerwhite.github.io/frontendeavor2/`
- **User site** (special repo): if the repository is named `<username>.github.io`, GitHub serves it at `https://<username>.github.io/` with **no** path prefix. The deploy workflow clears `NEXT_PUBLIC_BASE_PATH` in that case.

Replace the placeholders with your account and repo after the first successful deploy. The **Actions** tab shows the exact **Pages** URL on the workflow run summary when deployment finishes.

### Why `basePath` / `NEXT_PUBLIC_BASE_PATH` matter

GitHub **project** pages are not at the domain root; they live under `/<repo-name>/`. Next.js is configured with `basePath` when `NEXT_PUBLIC_BASE_PATH` is set at **build time** (e.g. `/frontendeavor2`). That makes routing and `/_next` assets resolve correctly.

Files in `public/` (icons, art) are **not** rewritten automatically. The app uses `publicAsset()` from `src/lib/publicAsset.ts` so image/icon URLs include the same prefix. Production builds must set `NEXT_PUBLIC_BASE_PATH` to match the repo segment of the Pages URL.

### Deploy

1. In the repo on GitHub: **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”).
2. Push to **`main`** or **`master`** (or run the workflow manually via **Actions → Deploy to GitHub Pages → Run workflow**). The workflow installs dependencies, sets `NEXT_PUBLIC_BASE_PATH` from the repository name (with the `*.github.io` exception above), runs `npx next build --no-lint`, and publishes the **`out/`** directory.

### Test the production bundle locally

After a static build, serve the `out/` folder (not `next start`):

```bash
npx next build --no-lint
npx serve out
```

To mimic a **project** site, set the prefix before building, then open the site under that path (e.g. `http://localhost:3000/frontendeavor2/` if you use `serve` and that port):

```bash
# Windows PowerShell
$env:NEXT_PUBLIC_BASE_PATH="/<repository-name>"; npx next build --no-lint; npx serve out
```

---

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [Next.js static exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Pages](https://docs.github.com/en/pages)
