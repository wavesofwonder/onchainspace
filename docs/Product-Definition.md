# Onchain Space — Product Definition Document (PDD v1.0)

---

## 1. Product Summary / Intent
**Onchain Space** is a personal browser dashboard for Ethereum and Bitcoin users who want instant situational awareness without noise. It replaces the default browser new tab or homepage with a calm, data-first control panel showing only what matters: gas conditions, wallet risk exposure, and current market context.

Designed for **quick daily check-ins, not trading sessions**.

---

## 2. Problem Definition

Current dashboards fail this use case because they are:

| Existing Option | Issue |
|----------------|------|
| Trading dashboards (DEXTools, DexScreener) | Too noisy and hype-driven. |
| Institutional analytics tools (Nansen, Arkham) | Too complex and action-heavy for casual monitoring. |
| Portfolio trackers | Require multiple clicks and display irrelevant metrics. |

There is **no lightweight, homepage-style dashboard** built to provide crypto awareness with **zero cognitive overhead**.

---

## 3. Target User

- Holds BTC and ETH via self-custody wallets.
- Uses DeFi protocols like Aave or Hyperliquid but does **not** identify as an active trader.
- Does **quick status checks**, not session-based portfolio review.
- Values **clarity, control, and minimal surfaces**.
- Prefers **ownership-oriented tools over exchange dashboards**.

---

## 4. Core Use Case

> **Open new browser tab → instantly see gas, open position risk, and market temperature → decide whether any action is needed → close tab or continue browsing peacefully.**

---

## 5. Jobs-to-be-Done

### Functional Jobs
- See gas levels instantly before deciding to transact.
- Check if any active Aave positions are nearing liquidation.
- Confirm no ongoing open positions on Hyperliquid or similar platforms.
- Headline awareness without falling into endless feed scrolling.

### Emotional Jobs
- **Reduce compulsive checking loops** (open DEXTools, close, open Coingecko, close).
- Feel **confident and informed**, rather than driven by fear or hype.
- Maintain **presence and intentionality** in daily crypto engagement.

---

## 6. Personalisation & Tone

- Single EVM address in v1.
- ENS resolution → greeting: “gm vitalik.eth” (example).
- Interface feels **personal, calm, and sovereign**, not gamified.

---

## 7. MVP Scope — Included

| Feature | Status |
|--------|--------|
| Wallet connect (single address) | ✅ |
| ENS resolution + greeting | ✅ |
| BTC + ETH price with % change | ✅ |
| Ethereum gas gauge | ✅ |
| L2 fee estimates (Optimism, Arbitrum, Base) | ✅ |
| Aave position health factor if detected | ✅ |
| Hyperliquid position exposure if detected | ✅ |
| RSS-based crypto headlines tile | ✅ |
| Optional: trending NFT tile (glance, no charting) | ✅ |

---

## 8. MVP Scope — Excluded

- Multi-wallet aggregation
- Alerts or notifications
- Full portfolio breakdowns
- Social integrations
- Trading execution modules
- Historical charting or analytics dashboards

---

## 9. Experience Components

| Component | Purpose |
|----------|--------|
| **Greeting** | Anchor user with identity + time |
| **Market Weather** | BTC/ETH directional context |
| **Gas & Fee Readiness** | Instant signal: transact now or wait |
| **Aave Position Health** | Quickly assess risk exposure |
| **Hyperliquid Positions** | Are there open leveraged trades live? |
| **Recent Activity** | Shows most recent wallet activity across chains with option to expand for deeper view |
| **Headlines Tile** | Ambient awareness of market sentiment |
| **Optional NFT Pulse** | Cultural activity indicator |
| **AI Assistant Panel (MCP-powered)** | Opens a drawer with one-click analysis prompts using Blockscout MCP for wallet insight |

---

## 10. Commentary Layer

- Primary view = **raw data, clearly displayed**.
- Optional overlays/tooltips translate insights (“You’re safe”, “Gas is high, wait”).
- **No hype language** — only objective prompts.

---

## 11. Success Criteria

Success is defined **not by engagement time, but disengagement quality**:

- User sets Onchain Space as **default new tab/homepage**.
- User checks conditions **here first before any DEX or explorer**.
- **Session length stays intentionally short** (sub-10 seconds).
- User reports **fewer compulsive app checks** throughout the day.

---

## 12. Future Expansion

- Multi-wallet tracking with tags (Main, Cold, DeFi).
- Farcaster identity layer and activity integration.
- Notifications (optional, user-controlled).
- Premium insights & wallet health history.
- Browser extension power features (context injection, right-click wallet scan).

---

# 🧠 Technical Architecture Summary

> Designed for **solo-maintainable stability**, with **clean separation** between UI, data logic, and runtime surface (web vs extension).

---

## 🧭 Core Principles

| Principle | Implementation |
|-----------|---------------|
| **Minimal dependencies** | Only include dependencies that remove significant complexity. |
| **MV3-safe architecture** | All shared logic avoids SSR, Node APIs, or inline scripts. |
| **Single data layer** | Shared `@core` package powering both web and extension. |
| **Stateless edge** | Cloudflare Worker proxy with KV caching — no backend server. |
| **Feature modularity** | Extra visuals (chat/generative) are **toggleable modules**, not core. |

---

## 🧱 Tech Stack Overview

| Layer | Chosen Technology | Reason |
|------|-------------------|------|
| **Web App** | **Vite + React + TS** | Fast, IPFS-friendly, zero SSR overhead. |
| **Extension** | **WXT (Vite-based)** | MV3-native, multiple entrypoints, minimal config. |
| **State/Data** | **TanStack Query** (server data), **Zustand/React state** (UI state) | Clean caching + minimal global state. |
| **Web3** | **viem + lightweight wagmi connectors** | Modern, typed, low-overhead wallet connectivity. |
| **Edge Runtime** | **Cloudflare Worker + KV** | Stateless API proxy + subscription caching. |
| **On-chain** | Base + **Subscription.sol** + Pyth Oracle | Subscription check and ETH/USD pricing. |
| **Required Integrations** | **Blockscout MCP + HyperSync/HyperIndex** | Fulfills hackathon criteria for data ingestion and prompts. |

---

## 🔏 Authentication Model

| Surface | Authentication Mechanism |
|--------|--------------------------|
| **Web App** | **SIWE** → one signature → **secure HttpOnly cookie** (7-day TTL) |
| **Extension** | SIWE → **Bearer token returned** → stored in `chrome.storage.local`. Cookies are unreliable in MV3 context. |

- Both paths unlock **premium proxy usage** without repetitive signing.
- **Subscription checks** are performed on-chain (cached hourly in KV).
- Worker injects **premium Blockscout/MCP API key** only if session + subscription are valid.

---

## 📡 Data & API Flow

```
UI (web or extension) → @core/api → Cloudflare Worker (/proxy/*) →
KV subscription cache → Blockscout/MCP or cached response → UI render
```

- **Edge caching** reduces MCP spend — TTL 3–10 min depending on endpoint.
- **HyperSync** may run in a Worker or extension background script and push updates via messaging.

---

## 📁 Repo Structure

```
apps/
  web/         → Vite SPA
  extension/   → WXT MV3 Chrome Extension (optional)
packages/
  core/        → Data logic, subscription checks, HyperSync client, MCP calls
  ui/          → Reusable React components (Cards, Greetings, Tiles)
edge/
  worker/      → Cloudflare Worker (proxy/auth/subscription)
contracts/
  Subscription.sol
docs/
  prompts.md
  PDD.md (this file)
```

---

## 🟢 Performance Targets

- Initial dashboard load < **2s** (with cache hit).
- **No flashing reloads** due to React Query cache persistence.
- **Only one signature per session** unless manually logged out.
- **Background fetch consolidation** in extension to avoid repeated API costs.

---

## 🎯 Long-Term Viability

The architecture ensures:

- **Core logic can run in web, extension**  with no rewrite.
- API proxy and premium model scale **without backend rewrite**, only edge KV/rate-limiting adjustments.
- Component library (`@ui`) is **portable** for future surfaces (mobile PWA, Farcaster frame mini-app).

---

## ✅ Final Statement

> Onchain Space is intentionally designed to **load fast, say little, and mean everything in one glance** — backed by an architecture that **maximizes clarity for users and maintainability for a solo builder**.
