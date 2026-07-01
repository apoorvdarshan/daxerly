# Contributing to Daxerly

Thanks for your interest in improving **Daxerly**! Contributions of all kinds are
welcome — bug reports, features, docs, and fixes.

## Code of Conduct

Be respectful and constructive. Harassment or hostile behavior isn't tolerated.

## Ways to Contribute

- 🐛 **Report bugs** — open an [issue](https://github.com/apoorvdarshan/daxerly/issues) with clear steps to reproduce.
- 💡 **Suggest features** — open an issue describing the idea and the problem it solves.
- 🔧 **Send a pull request** — fix a bug or build a feature (see the workflow below).
- 📝 **Improve docs** — typos, clarifications, and examples are all appreciated.

## Development Setup

See the [README](README.md#-getting-started) for full setup. In short:

```bash
git clone https://github.com/<your-username>/daxerly.git
cd daxerly
npm install
cp .env.example .env   # fill in the values
npx prisma migrate deploy
npx prisma generate
npm run dev
```

## Pull Request Workflow

1. **Fork** the repo and create a branch from `main`:
   ```bash
   git checkout -b feat/short-description
   ```
2. Make your change. Keep it focused — one logical change per PR.
3. Match the existing code style and run the checks below.
4. Commit with a clear, imperative message (e.g. `Add receipt export button`).
5. Push and open a pull request against `main`, describing **what** and **why**.

## Before You Submit

Make sure these pass locally:

```bash
npm run lint     # ESLint
npm run build    # type-check + production build
```

- Write TypeScript (no `any` unless truly necessary).
- Follow the existing Tailwind + component patterns.
- Don't commit secrets — `.env` is gitignored; use `.env.example` for new keys.
- If you add a Prisma model or field, include the generated migration.

## Project Structure

A quick map lives in the [README](README.md#-project-structure). Integrations live
in `src/lib/integrations/`, the receipt UI in `src/components/Receipt.tsx`, and
auth config in `src/lib/auth.ts`.

## Questions

Open an issue or reach out at **ad13dtu@gmail.com**. Thanks for contributing! 🧾
