# Phantom Embedded JS

Vanilla JavaScript/TypeScript starter for Phantom's embedded wallet using the [Browser SDK](https://docs.phantom.com/sdks/browser-sdk). No browser extension required — users authenticate via Google or Apple OAuth.

## Quick Start

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Add your App ID from https://phantom.com/portal

# Run
pnpm dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_PHANTOM_APP_ID` | Yes | App ID from [Phantom Portal](https://phantom.com/portal) |
| `VITE_REDIRECT_URL` | Yes | OAuth redirect URL (must be whitelisted in Portal) |
| `VITE_SOLANA_RPC_URL` | No | Solana RPC endpoint (defaults to mainnet-beta) |

## What's Included

- Google and Apple OAuth via Phantom Connect
- SOL balance display using `@solana/web3.js`
- Message signing (`solana.signMessage`)
- Transaction signing (`solana.signAndSendTransaction`)
- Network switching (`solana.switchNetwork`)
- Light/dark theme toggle

## Docs

- [Browser SDK](https://docs.phantom.com/sdks/browser-sdk)
- [Phantom Portal](https://phantom.com/portal)
