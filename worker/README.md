# Feedback Worker

Receives the form on `feedback.html` and files a GitHub issue in `qrkboard/feedback`.

1. Create the public repo `qrkboard/feedback` (issues on).
2. Create a fine-grained token for that repo only: Issues, read and write.
3. In `worker/`: `npx wrangler deploy`, then `npx wrangler secret put GITHUB_TOKEN`.
4. Put the Worker's URL in `ENDPOINT` at the top of the script in `feedback.html`.
5. Optional: add Cloudflare Turnstile and `npx wrangler secret put TURNSTILE_SECRET`.
