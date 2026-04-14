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

## Claude / AI Agent Setup

This starter works with the [Phantom MCP server](https://www.npmjs.com/package/@phantom/mcp-server), giving AI assistants like Claude direct access to your embedded wallet — checking balances, sending transactions, signing messages, and trading perpetuals on Hyperliquid.

### Setup (Claude Desktop)

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "phantom": {
      "command": "npx",
      "args": ["-y", "@phantom/mcp-server@latest"]
    }
  }
}
```

Restart Claude Desktop. On first use, a browser window opens to authenticate your Phantom wallet. No Phantom Portal App ID required — the MCP server handles its own authentication.

### Available tools (28)

**Wallet & balances**
- `get_connection_status` — Local connection check (no API call)
- `get_wallet_addresses` — Solana, Ethereum, Bitcoin, and Sui addresses
- `get_token_balances` — All token balances with live USD prices
- `get_token_allowance` — ERC-20 allowance for a spender on EVM

**Transactions**
- `send_solana_transaction` — Sign and broadcast a Solana transaction (with simulation preview)
- `send_evm_transaction` — Sign and broadcast an EVM transaction
- `transfer_tokens` — Transfer SOL, SPL tokens, or EVM native/tokens
- `buy_token` — Swap via Phantom routing (Solana, EVM, cross-chain)
- `simulate_transaction` — Preview asset changes without submitting

**Signing**
- `sign_solana_message` — Sign a UTF-8 message on Solana
- `sign_evm_personal_message` — EIP-191 personal sign on EVM
- `sign_evm_typed_data` — EIP-712 typed data (DeFi permits, order signing)

**Auth & misc**
- `phantom_login` — Trigger wallet authentication
- `pay_api_access` — Pay for API access
- `portfolio_rebalance` — Rebalance token portfolio

**Perpetuals — Hyperliquid (13 tools)**
- `deposit_to_hyperliquid` — Bridge tokens into your Hyperliquid perp account
- `get_perp_account` — Account balance and available margin
- `get_perp_markets` — Markets with price, funding rate, open interest, and max leverage
- `get_perp_positions` — Open positions with PnL and liquidation price
- `get_perp_orders` — Open limit, take-profit, and stop-loss orders
- `get_perp_trade_history` — Historical fills and closed PnL
- `open_perp_position` — Open a long/short with configurable leverage
- `close_perp_position` — Full or partial close via market order
- `cancel_perp_order` — Cancel an open order by ID
- `update_perp_leverage` — Change leverage and margin type (isolated/cross)
- `transfer_spot_to_perps` — Move USDC from Hypercore spot to perp
- `withdraw_from_perps` — Move USDC from perp back to spot
- `withdraw_from_hyperliquid_spot` — Withdraw from Hyperliquid spot to wallet

## Docs

- [Browser SDK](https://docs.phantom.com/sdks/browser-sdk)
- [Phantom Portal](https://phantom.com/portal)
