<p align="center">
  <h1 align="center">Clawix</h1>
  <p align="center">
    <strong>Self-hosted multi-agent AI orchestration platform</strong>
    <br />
    Run AI agent swarms in isolated containers. Full governance. Zero vendor lock-in.
  </p>
  <p align="center">
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue`?style=flat-square" alt="License"></a>
    <a href="https://github.com/ClawixAI/clawix/stargazers"><img src="https://img.shields.io/github/stars/ClawixAI/clawix?style=flat-square" alt="Stars"></a>
    <a href="https://github.com/ClawixAI/clawix/issues"><img src="https://img.shields.io/github/issues/ClawixAI/clawix?style=flat-square" alt="Issues"></a>
    <a href="https://github.com/ClawixAI/clawix/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Welcome"></a>
    <a href="package.json"><img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen?style=flat-square" alt="Node.js"></a>
    <a href="package.json"><img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square" alt="TypeScript"></a>
  </p>
</p>

---

## Why Clawix?

Most AI agent frameworks are either **toys** (single-process, no isolation, no audit trail) or **walled gardens** (cloud-only, per-seat pricing, your data on someone else's servers).

Clawix sits in between: **production-grade orchestration you own entirely.**

- **Every agent runs in its own Docker container** -- no agent can read another's files, exhaust your host's memory, or escape its sandbox.
- **Plug in any LLM** -- OpenAI and GPT-4 today, with Azure, DeepSeek, Gemini, and OpenRouter coming soon. Any OpenAI-compatible endpoint (Ollama, vLLM, etc.) works now via the custom provider.
- **Built for teams** -- RBAC, token budgets, audit logs, and scoped memory mean you can hand agents to your whole org without losing sleep.
- **Reach users where they are** -- Telegram, WhatsApp, Slack, and a built-in web dashboard. One agent, many channels.

> Think of it as "Kubernetes for AI agents" -- container isolation, resource limits, health checks, and warm pools, but purpose-built for LLM workloads.

---

## Features

<table>
<tr>
<td width="50%">

### Container-Isolated Agents
Every agent gets its own sandboxed Docker container with CPU/memory limits, read-only mounts, and no root access. Cross-agent interference is architecturally impossible.

### Warm Container Pool
Primary agents stay warm in pre-provisioned containers. Cold-start latency drops from **1-3 seconds to ~50ms**.

### Swarm Orchestration
Break complex tasks into sub-agent DAGs. The coordinator delegates, aggregates results, and handles failures -- all within isolated containers.

</td>
<td width="50%">

### Multi-Provider AI
OpenAI out of the box, with Azure, DeepSeek, Gemini, and OpenRouter planned. Any OpenAI-compatible endpoint already works via the custom provider. Add new providers with a single config entry.

### Scoped Memory System
Persistent memory at three levels: private (per-user), group (team), and org-wide. Agents build context over time without re-prompting.

### Skills Framework
Pluggable tools with approval workflows. Bundle built-in skills, create custom ones at runtime, or use the built-in skill-creator agent to generate new skills from natural language.

</td>
</tr>
</table>

### And also...

- **Governance & Compliance** -- Token budgets per user/group, immutable audit logs, structured logging (Pino), Prometheus metrics
- **Multi-Channel Delivery** -- reach users across messaging platforms and web (see table below)
- **Per-User Workspaces** -- Persistent directories that survive container teardown, with quota enforcement
- **Encrypted Secrets** -- Provider API keys stored with AES-256-GCM; encryption key never leaves your server
- **RBAC** -- Role-based access control across all management APIs

---

## Architecture

```
                        ┌──────────────────────────────────────────┐
                        │            User Interfaces               │
                        │   Telegram  WhatsApp  Slack  Web UI      │
                        └──────────────────┬───────────────────────┘
                                           │
                        ┌──────────────────▼──────────────────────-─┐
                        │             API Gateway                   │
                        │   NestJS + Fastify  │  JWT  │  Rate Limit │
                        └──────────────────┬───────────────────────-┘
                                           │
              ┌────────────────────────────▼────────────────────────────┐
              │                     Core Engine                         │
              │                                                         │
              │  ┌─────────────┐  ┌──────────────┐  ┌──────────────-┐   │
              │  │  Reasoning  │  │    Tool      │  │    Swarm      │   │
              │  │   Loops     │  │  Execution   │  │ Coordinator   │   │
              │  └─────────────┘  └──────────────┘  └───────────────┘   │
              │                                                         │
              │  Providers: GPT │ OpenAI-compatible │ Custom            │
              └────────────────────────────┬───────────────────────-────┘
                                           │
              ┌────────────────────────────▼────────────────────────────┐
              │                  Container Pool                         │
              │  ┌──────────┐  ┌──────────────┐  ┌─────────────────-┐   │
              │  │  Warm    │  │  Ephemeral   │  │  Resource        │   │
              │  │  Primary │  │  Sub-Agents  │  │  Limits          │   │
              │  └──────────┘  └──────────────┘  └─────────────────-┘   │
              └────────────────────────────┬────────────────────────-───┘
                                           │
              ┌────────────────────────────▼───────────────────────────┐
              │                    Data Layer                          │
              │        PostgreSQL  │  Redis  │  User Workspaces        │
              └────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites

- **Node.js 20+** and **pnpm 9+**
- **Docker Desktop** — must be fully started before running any docker commands (the whale icon in the menu bar must be steady, not animating)

### 1. Clone & Install

```bash
git clone https://github.com/clawix/clawix.git
cd clawix
pnpm install
```

### 2. Configure

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```bash
# Required: encryption key for provider secrets (AES-256-GCM)
PROVIDER_ENCRYPTION_KEY=$(openssl rand -hex 32)

# AI providers — at least one required
OPENAI_API_KEY=sk-xxx               # OpenAI / GPT (recommended)

# Channels (optional)
TELEGRAM_BOT_TOKEN=123456789:ABCdef...   # Telegram (from @BotFather)

# Database (defaults work with docker-compose)
DATABASE_URL="postgresql://clawix:clawix_dev@localhost:5433/clawix"
REDIS_URL="redis://localhost:6379"
```

> **Supported providers:** OpenAI, Z.AI Coding, and any OpenAI-compatible endpoint (Ollama, vLLM, etc.). Gemini, Azure, DeepSeek, and OpenRouter are planned.

### 3. Build & Start

```bash
# Build the agent container image (one-time, ~2 min)
docker build -t clawix-agent:latest -f infra/docker/agent/Dockerfile .

# Start all services
docker compose -f docker-compose.dev.yml up
```

Wait for the API to print `API server listening on 0.0.0.0:3001` — this takes about 2 minutes on first run while dependencies install inside the containers.

### 4. Seed the database (first run only)

In a new terminal, copy and run the seed script:

```bash
cp packages/api/prisma/seed.example.ts packages/api/prisma/seed.ts
docker exec clawix-api sh -c "cd /app/packages/api && npx tsx prisma/seed.ts"
```

### 5. Log in

Open `http://localhost:3000` and log in with:

| Email | Password | Role |
|---|---|---|
| `admin@clawix.test` | `password123` | Admin |
| `dev@clawix.test` | `password123` | Developer |
| `viewer@clawix.test` | `password123` | Viewer |

---

## Multi-Provider Support

Built-in providers plus extensible registry -- add new ones with a single `ProviderSpec` entry:

| Provider       | Detection                       | Use Case               | Status         |
| -------------- | ------------------------------- | ---------------------- | -------------- |
| **OpenAI**     | model starts with `gpt-`/`o1-`/`o3-`/`o4-` | General purpose | Available |
| **Z.AI Coding**| model starts with `glm-`        | GLM models             | Available      |
| **Custom**     | any OpenAI-compatible endpoint  | Ollama, vLLM, etc.     | Available      |
| **Azure**      | config key `azure_openai`       | Enterprise compliance  | Planned        |
| **DeepSeek**   | model starts with `deepseek-`   | Cost-effective         | Planned        |
| **Gemini**     | model starts with `gemini-`     | Google ecosystem       | Planned        |
| **Kimi**       | model starts with `moonshot-`   | Long-context tasks     | Planned        |
| **OpenRouter** | API key starts with `sk-or-`    | Provider gateway       | Planned        |

## Channels

| Channel            | Integration          | Use Case                        | Status         |
| ------------------ | -------------------- | ------------------------------- | -------------- |
| **Telegram**       | grammY               | Personal & team chat            | Available      |
| **WhatsApp**       | Business API         | Customer-facing agents          | Planned        |
| **Slack**          | Bolt SDK             | Workspace collaboration         | Planned        |
| **Web Dashboard**  | Next.js + WebSocket  | Admin console & conversations   | Available      |

---

## Security Model

Clawix follows a **zero-trust architecture** for agent execution:

| Threat                         | Mitigation                                                     |
| ------------------------------ | -------------------------------------------------------------- |
| Cross-user data access         | Workspaces only mounted into owner's container                 |
| Sub-agent privilege escalation | Sub-agents get read-only curated context, never full workspace |
| Memory poisoning               | Agent context regenerated from DB each run                     |
| Disk exhaustion                | Per-user quota enforcement (default 500 MB)                    |
| Path traversal                 | All paths validated to stay under `data/org/`                  |
| Secret leakage                 | API keys encrypted at rest (AES-256-GCM)                      |
| Untrusted code execution       | All agent code runs inside sandboxed containers, never on host |

---

## Tech Stack

| Layer      | Technology                                                |
| ---------- | --------------------------------------------------------- |
| API        | NestJS 11 + Fastify                                       |
| Frontend   | Next.js 15 + Tailwind CSS + shadcn/ui                     |
| AI         | Multi-provider (OpenAI, any OpenAI-compatible)            |
| Database   | Prisma ORM + PostgreSQL 16                                |
| Cache      | Redis 7 (ioredis)                                         |
| Auth       | NextAuth (JWT + OAuth2)                                   |
| Containers | Docker CLI with resource limits                           |
| Logging    | Pino (structured JSON)                                    |
| Metrics    | Prometheus (prom-client)                                  |
| Testing    | Vitest + Playwright                                       |
| Monorepo   | pnpm workspaces                                           |

---

## Project Structure

```
clawix/
├── packages/
│   ├── api/          # NestJS API server (auth, engine, channels, skills)
│   ├── web/          # Next.js dashboard (React 19, Tailwind, shadcn/ui)
│   ├── shared/       # Shared types, schemas, utilities, logger
│   └── worker/       # Background job processor
├── skills/
│   └── builtin/      # Bundled skills (web_search, file_ops, etc.)
├── infra/
│   └── docker/       # Agent container Dockerfile
├── prisma/           # Database schema + migrations
├── docs/             # Architecture & implementation docs
└── scripts/          # Dev/ops scripts
```

---

## Commands

```bash
pnpm run dev              # Start API + dashboard (hot-reload)
pnpm run build            # Build all packages
pnpm run test             # Run all tests
pnpm run test:coverage    # Tests with coverage report
pnpm run lint             # ESLint + type check
pnpm run format           # Prettier format

# Infrastructure
pnpm run docker:dev       # Start Postgres, Redis, pgAdmin
pnpm run docker:down      # Stop local infra

# Database
pnpm run db:migrate       # Run Prisma migrations
pnpm run db:seed          # Seed initial data
pnpm run db:studio        # Open Prisma Studio (GUI)
```

---

## Regulating the Agentic Model

Clawix gives you several levers to control which AI model agents use, how much they can spend, and what they are allowed to do.

### 1. Change the AI Provider & Model

Edit an agent definition in the dashboard (**Agents → Edit**) or directly in the seed file:

```ts
// packages/api/prisma/seed.ts
provider: 'openai',   // 'openai' | 'zai-coding' | any custom provider name
model: 'gpt-4o',      // any model supported by the provider
```

Or update via the API:
```bash
PATCH /api/v1/agents/:id
{ "provider": "openai", "model": "gpt-4.1" }
```

> Supported today: `openai` (gpt-4o, gpt-4.1, o1, o3, o4-mini), `zai-coding` (glm-*), or any OpenAI-compatible endpoint via a custom provider.

---

### 2. Set Token & Cost Budgets (Policies)

Policies cap how much each user or group can spend. Configure them in **Settings → Policies**:

```ts
maxTokenBudget: 1000,      // $10.00 in cents — null = unlimited
maxAgents: 5,              // max agent definitions a user can create
maxSkills: 20,             // max skills available to the user
allowedProviders: ['openai'],  // restrict which providers a user can use
cronEnabled: true,         // allow scheduled/cron agent runs
```

Assign a policy to a user in **Settings → Users → Edit**.

---

### 3. Control What Agents Can Do (System Prompt)

Each agent has a `systemPrompt` that defines its behavior and constraints:

```ts
systemPrompt: 'You are a helpful assistant. Never execute destructive commands. Always ask for confirmation before modifying files.'
```

Edit via **Agents → Edit → System Prompt** in the dashboard.

---

### 4. Restrict Container Resources

Each agent runs in an isolated Docker container. Adjust CPU and memory limits per agent:

```ts
containerConfig: {
  cpuLimit: '0.5',      // 0.5 CPU cores
  memoryLimit: '256m',  // 256 MB RAM
  timeoutSeconds: 120,  // max run time
  readOnlyRootfs: true, // prevent filesystem writes
}
```

---

### 5. Add a Custom OpenAI-Compatible Provider (e.g. Ollama, local LLM)

In **Settings → Providers → Add Provider**, set:

| Field | Value |
|---|---|
| Provider name | `custom` (or any label) |
| API Base URL | `http://localhost:11434/v1` (Ollama example) |
| API Key | `ollama` (or leave blank) |
| Default model | `llama3.2` (or whichever model you pulled) |

No code changes required — any OpenAI-compatible endpoint works immediately.

---

## Roadmap

- [x] Container-isolated agent execution
- [x] Multi-provider AI support (OpenAI, any OpenAI-compatible endpoints)
- [ ] First-class Azure, DeepSeek, Gemini, Kimi, OpenRouter providers
- [x] Warm container pool (~50ms cold start)
- [x] Swarm orchestration with DAG dependencies
- [x] Telegram channel integration
- [x] Scoped memory system
- [x] Skills framework with built-in skill creator
- [ ] WhatsApp Business API integration
- [ ] Slack integration
- [x] Web dashboard (conversations, agents, skills, settings)
- [ ] Skill marketplace UI
- [ ] Advanced token analytics & optimization
- [ ] Multi-region deployment support

---

## Running on a Mac (Mac Mini, MacBook, etc.)

This section covers installing Clawix locally on macOS and optionally pinning it to your Dock as a native-feeling app using Safari's PWA support.

### Prerequisites

| Tool | Install |
|---|---|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Download and install from docker.com |
| [Homebrew](https://brew.sh) | `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` |
| Node.js 20+ | `brew install node` |
| pnpm | `npm install -g pnpm` |

> **macOS Sonoma (14+) required** for the "Add to Dock" PWA feature in Safari.

> **Start Docker Desktop before proceeding.** Open it from Applications and wait until the whale icon in the menu bar is steady (not animating). All subsequent steps require the Docker daemon to be running.

---

### Step 1 — Clone the repo

```bash
git clone https://github.com/aibymlngo/clawix-demo.git
cd clawix-demo
pnpm install
```

---

### Step 2 — Configure environment

```bash
cp .env.example .env
```

Open `.env` and set the required values:

```bash
# Generate a secure encryption key and paste it in:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# → paste output as PROVIDER_ENCRYPTION_KEY=...

# Add your AI provider key — OpenAI is recommended:
OPENAI_API_KEY=sk-xxx
```

> OpenAI is the primary supported provider. Gemini support is planned but not yet available.

---

### Step 3 — Set up local HTTPS (required for Safari PWA)

Run the one-time setup script — it installs `mkcert` via Homebrew and generates a locally trusted certificate:

```bash
./scripts/setup-https.sh
```

You will be prompted for your Mac password once (to install the root CA into Keychain). After that, Safari will trust `https://localhost` with no warnings.

---

### Step 4 — Build the agent container

```bash
docker build -t clawix-agent:latest -f infra/docker/agent/Dockerfile .
```

---

### Step 5 — Start Clawix

```bash
docker compose -f docker-compose.dev.yml up
```

Wait until you see this line in the logs before proceeding:

```
API server listening on 0.0.0.0:3001
```

This takes about 2 minutes on first run. The API container installs dependencies, generates the Prisma client, and runs database migrations automatically.

| Service | URL |
|---|---|
| Web dashboard (HTTP) | http://localhost:3000 |
| Web dashboard (HTTPS) | https://localhost:3443 |
| API | https://localhost:3444 |

---

### Step 6 — Seed the database (first run only)

In a new terminal tab, run:

```bash
cp packages/api/prisma/seed.example.ts packages/api/prisma/seed.ts
docker exec clawix-api sh -c "cd /app/packages/api && npx tsx prisma/seed.ts"
```

This creates the default users and agents. Default login credentials:

| Email | Password | Role |
|---|---|---|
| `admin@clawix.test` | `password123` | Admin |
| `dev@clawix.test` | `password123` | Developer |
| `viewer@clawix.test` | `password123` | Viewer |

---

### Step 7 — Install as a Mac app via Safari

1. Open **Safari** and navigate to `https://localhost:3443`
2. In the menu bar choose **File → Add to Dock**
3. Confirm the name **Clawix** and click **Add**

Clawix now appears in your **Dock** and **Launchpad** as a standalone app with no browser chrome — just like a native app.

> On **iOS / iPadOS**: open Safari → tap the Share button → **Add to Home Screen**
> On **Android**: open Chrome → tap the menu → **Add to Home Screen**

---

### Stopping and restarting

```bash
# Stop all services
docker compose -f docker-compose.dev.yml down

# Restart (fast — deps already installed, no re-seeding needed)
docker compose -f docker-compose.dev.yml up
```

---

### Troubleshooting on Mac

| Problem | Fix |
|---|---|
| `ERR_CONNECTION_RESET` on login | Docker Desktop was not running when containers started. Stop all containers, start Docker Desktop fully, then run `docker compose -f docker-compose.dev.yml up` again |
| `401 Unauthorized` on login | Database not seeded. Run: `cp packages/api/prisma/seed.example.ts packages/api/prisma/seed.ts && docker exec clawix-api sh -c "cd /app/packages/api && npx tsx prisma/seed.ts"` |
| API logs show 200+ TypeScript errors | Prisma client not generated. Run: `docker exec clawix-api sh -c "cd /app/packages/api && npx prisma generate --schema=prisma/schema.prisma"` then `docker restart clawix-api` |
| Safari shows "not secure" warning | Re-run `./scripts/setup-https.sh` — the root CA may not have been installed |
| `File → Add to Dock` is greyed out | Requires macOS Sonoma 14+ and Safari 17+ |
| Port 3443 already in use | Change the port in `infra/Caddyfile` and `docker-compose.dev.yml` |
| Docker containers exit immediately | Check `docker compose logs api-server` — usually a missing `.env` value |
| Agent containers fail to start | Ensure Docker Desktop is running and has access to `/var/run/docker.sock` |

---

## Contributing

Contributions are welcome! Whether it's bug fixes, new features, documentation, or feedback -- we'd love your help.

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/clawix.git
cd clawix

# Create a feature branch
git checkout -b feature/your-feature

# Make changes, then test and lint
pnpm run test
pnpm run lint

# Commit with conventional commits
git commit -m "feat: add amazing feature"

# Push and open a PR
git push origin feature/your-feature
```

**Guidelines:**
- TypeScript strict mode -- no `any`
- Write tests for new features (Vitest)
- Follow conventional commits (`feat:`, `fix:`, `refactor:`, etc.)
- Keep files under 400 LOC
- Never commit secrets or API keys

---

## Security

If you discover a security vulnerability, please report it responsibly via [GitHub Security Advisories](https://github.com/clawix/clawix/security/advisories) instead of using the public issue tracker.

---

## Acknowledgments

Clawix builds on ideas from:

- [nanoClaw](https://github.com/qwibitai/nanoclaw) -- Container-isolated agent execution
- [nanobot](https://github.com/HKUDS/nanobot) -- Multi-provider AI design patterns

---

## License

MIT -- see [LICENSE](LICENSE) for details.

---

<p align="center">
  <sub>Built for organizations that need AI agents they can actually trust.</sub>
</p>
