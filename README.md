# Breadcrumb: Continuity for Unfinished Work 🍞

Web frontend for **Breadcrumb**, an AI companion that helps you remember where you left off in unfinished work.

Instead of preserving only activity history, Breadcrumb captures a structured **Work State** — including what you were trying to achieve, what you explored and rejected, your current direction, the question that remained unresolved, and what you planned to try next.

When you return later with only partial context, Breadcrumb retrieves persistent Work-State Memory and reconstructs where to continue.

> **History tells you what happened. Breadcrumb tells you what to continue.**

## Live Demo

**https://breadcrumb-recall.vercel.app**

The demo uses a representative **Mobile Checkout Redesign** workflow.

Try the complete flow:

1. Wait for Breadcrumb to notice the simulated interruption.
2. Click **Remember this**.
3. Review the extracted Work State.
4. Click **Leave & come back later**.
5. After the **2 days later…** transition, click **Show me**.
6. Breadcrumb retrieves the previous Work State using only partial current context.
7. Expand **Why this recall?** to inspect the real memories used during retrieval.

No credentials are required.

## Architecture

This repository contains the **web demo frontend**.

The core Agentic Memory implementation lives in the main repository:

**https://github.com/baidiwang/breadcrumb-recall**

Production architecture:

```text
Vercel Web Frontend
        ↓
AWS Lambda Function URL
        ↓
Breadcrumb Recall Agent
   ├── Anthropic Claude
   ├── MiniLM embeddings
   └── CockroachDB
        ├── Persistent Work-State Memory
        └── Distributed Vector Retrieval
```

The frontend calls the production AWS Lambda backend directly over HTTPS.

There are no API keys, database credentials, or other backend secrets in this repository.

## Demo Scope

The Mobile Checkout workspace is a deterministic, representative product-design scenario created for the hackathon demo.

It is **not a Figma integration**.

The scenario is pre-seeded, but the memory pipeline is real:

```text
Work Context
→ Work-State Extraction
→ Semantic Embedding
→ CockroachDB Persistence
→ Vector Retrieval
→ Recall Reconstruction
```

The returning session intentionally contains only partial context. Previous design decisions and rejection reasons shown during Recall are retrieved from persistent memory rather than included in the returning prompt.

## Development

Requirements:

- Node.js
- npm

Clone and install:

```bash
git clone https://github.com/baidiwang/breadcrumb-recall-web.git
cd breadcrumb-recall-web
npm install
```

Start the local development server:

```bash
npm run dev
```

For additional available scripts, see `package.json`.

## Tech Stack

- React
- TypeScript
- Vite
- TanStack Start
- Vercel
- AWS Lambda production API

The interface was initially prototyped with Lovable and then integrated with the production Breadcrumb Recall backend.

## Related Links

**Core Agent / Backend**

https://github.com/baidiwang/breadcrumb-recall

**Production Demo**

https://breadcrumb-recall.vercel.app

## Hackathon

Built for the **CockroachDB × AWS Hackathon: Build with Agentic Memory**.

The core submission demonstrates persistent Work-State Memory using CockroachDB Distributed Vector Indexing and CockroachDB Cloud Managed MCP Server, with the production agent backend running on AWS Lambda.

See the [main repository](https://github.com/baidiwang/breadcrumb-recall) for full architecture, setup instructions, CockroachDB configuration, MCP usage, API documentation, testing, and project lineage.
