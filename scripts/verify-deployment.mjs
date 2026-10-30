import { setTimeout as delay } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

export async function verifyDeployment({ origin, revision, attempts = 40, interval = 15000, request = fetch, sleep = delay }) {
  if (!/^[a-f0-9]{40}$/.test(revision || '')) throw new Error('A full commit SHA is required');
  const base = new URL(origin);
  if (base.protocol !== 'https:' || base.username || base.password) throw new Error('An HTTPS deployment URL is required');
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const url = new URL('/deployment.json', base);
      url.searchParams.set('expected', revision);
      url.searchParams.set('attempt', String(attempt));
      const response = await request(url, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const deployed = await response.json();
      if (deployed.revision === revision) {
        const page = await request(base, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
        if (!page.ok || !(await page.text()).includes('<app-root')) throw new Error('Storefront is unavailable');
        console.log(`Verified deployment of ${revision} at ${base.origin}`);
        return;
      }
      console.log(`Attempt ${attempt}: Render has not published the expected commit yet`);
    } catch (error) {
      console.log(`Attempt ${attempt}: ${error.message}`);
    }
    if (attempt < attempts) await sleep(interval);
  }
  throw new Error(`Deployment of ${revision} was not confirmed`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await verifyDeployment({ origin: process.env.DEPLOYMENT_URL, revision: process.env.GITHUB_SHA });
}
