# Deploy VeriClause

The zip is the source of the site. Unzip it, then use either host below. Do not put API keys in the zip or in git. Add them in the host's environment settings. `.env.example` lists every name. The app runs with no keys: reviews use the sample specialists, and sign-in stays off until Auth0 is set.

Reviews, contracts, and playbooks are stored in memory inside the Node process (`src/lib/cache/review-cache.ts`). Use **one** Render instance so the page after a review can still see that review. A new deploy or a restart clears them. Vercel runs each request in its own short-lived environment, so a review can disappear between the upload and the result page. Use Render when people need to open a finished review. Use Vercel when you want the same site on Vercel's network and you accept that limit, or point the team at the Render URL for reviews.

Node 22 or newer is required (`.node-version`).

## Render

Render runs the environment: install, build, and `npm start`. The server listens on `0.0.0.0` and on the port Render sets (`PORT`).

1. Unzip the archive.
2. Create a Git repository from that folder and push it to GitHub or GitLab. Render deploys from a repository. The Blueprint file is `render.yaml`.
3. In the Render dashboard, choose **New**, then **Blueprint**, and select the repository. Or create a **Web Service** by hand:
   - Runtime: Node
   - Build command: `npm ci && npm run build`
   - Start command: `npm start`
   - Health check path: `/api/health`
   - Instance count: 1
4. Add environment variables from `.env.example`. Leave a value empty if you are not using that service. Generate `AUTH0_SECRET` with `openssl rand -hex 32` when you turn Auth0 on. Do not paste secrets into chat or commit them.
5. After the first deploy, open the Render URL. In Auth0, set the callback to `https://YOUR-SERVICE.onrender.com/api/auth/auth0/callback` and the logout URL to the same site origin. Allowed logout and web origins must be that `https` origin.
6. Confirm `https://YOUR-SERVICE.onrender.com/api/health` returns JSON. Then start a demo review from the Review page.

`render.yaml` already sets the build, the start command, the health check, and the variable names. Values marked `sync: false` are typed in the dashboard and are not stored in the file.

Docker is optional. From the unzipped folder:

```bash
docker build -t vericlause .
docker run -p 4317:4317 --env-file .env.local vericlause
```

Copy `.env.example` to `.env.local` first and fill only the keys you have. `.env.local` stays on the machine.

## Vercel

Vercel builds the Next.js app. The framework preset is in `vercel.json`.

1. Unzip the archive.
2. From that folder, install the Vercel CLI and deploy:

```bash
npm install
npx vercel
```

Answer the prompts. For a later production deploy, run `npx vercel --prod`.

You can instead push the unzipped folder to GitHub and use **Add New Project** in the Vercel dashboard. The framework should detect Next.js. Build command: `npm run build`. Do not set a custom output directory.

3. In the Vercel project, open **Settings**, then **Environment Variables**, and add the names from `.env.example`. Redeploy after saving them.
4. In Auth0, set the callback to `https://YOUR-PROJECT.vercel.app/api/auth/auth0/callback` and the allowed origins to that site.
5. Open the deployment URL. Home, FAQ, and Help work. A review is reliable on Render, where one process keeps the result. On Vercel, treat a finished review as best-effort unless you later move the store off process memory.

Vercel Hobby limits how long a function may run. A sample-mode demo is the short path. A live model review can take longer than the hobby limit. Render's web service does not use that hobby cap.

## Local check before you upload

```bash
npm install
npm test
npm run build
npm start
```

Open `http://127.0.0.1:4317` unless `PORT` is set. `npm run dev` is the development server and is not what Render or Vercel run.

## What not to upload

Do not include `node_modules`, `.next`, `.env`, or `.env.local`. The zip is built without them. `npm ci` or the host install step restores dependencies from `package-lock.json`.
