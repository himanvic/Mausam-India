# Mausam India — Clean GitHub Footer

This update removes the developer-name credit from the public page and adds a compact GitHub source link using an inline GitHub mark styled with the app's existing accent color.

## Before pushing

1. Open `index.html` and find `GITHUB_REPO_URL`.
2. Replace `https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY` with the actual public GitHub repository URL for Mausam India. The repo URL was not supplied when this package was made, so it remains a placeholder.
3. Keep the Cloudflare Pages Function at `functions/[[path]].js`.
4. In Cloudflare Pages, keep the existing secret named `OPENAQ_API_KEY`. Never put the secret in `index.html` or GitHub.
5. Commit and push the changed files. Cloudflare Pages deploys automatically when the connected production branch has auto-deploy enabled.

Suggested commit message:

`Remove developer credit and add GitHub source icon`

## Included behavior

- Footer shows update time and Open-Meteo attribution, followed by a GitHub source link.
- Developer name/credit is not displayed on the public screen.
- AQI model estimate and OpenAQ measured station readings remain separate.
- Existing AQI explanation, history modal, sun animation, weather suggestions and scroll effects are retained.

## Local testing

Open-Meteo can work from a local `file://` preview. The OpenAQ panel requires the deployed Cloudflare Pages Function because it uses the server-side `OPENAQ_API_KEY` secret.
