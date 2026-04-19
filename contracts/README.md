# FreelanceEscrow — on-chain USDC escrow on Base

Minimal escrow contract used as the decentralized alternative to the off-chain
fiat escrow. One-to-one mapping with `orders.id` via the escrow `bytes32` id.

## Addresses

| Network | USDC | Deployed escrow |
|---|---|---|
| Base mainnet  | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | _(not deployed yet — set `NEXT_PUBLIC_ESCROW_CONTRACT` after deploy)_ |
| Base Sepolia  | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | _(not deployed yet)_ |

## Deploy (Foundry)

```bash
# 1. Install Foundry
curl -L https://foundry.paradigm.xyz | bash && foundryup

# 2. From repo root:
forge init --force escrow-deploy && mv escrow-deploy/* . && rm -rf escrow-deploy
cp contracts/FreelanceEscrow.sol src/FreelanceEscrow.sol

# 3. Deploy to Base Sepolia first
export PRIVATE_KEY="0x..."
export BASESCAN_API_KEY="..."
export FEE_RECIPIENT="0x..."   # your treasury wallet
export ARBITER="0x..."         # initially your team multisig

forge create src/FreelanceEscrow.sol:FreelanceEscrow \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY \
  --constructor-args \
    0x036CbD53842c5426634e7929541eC2318f3dCF7e \
    $ARBITER \
    $FEE_RECIPIENT \
    250                          # 2.5% platform fee

# 4. Verify on Basescan
forge verify-contract <DEPLOYED_ADDRESS> \
  src/FreelanceEscrow.sol:FreelanceEscrow \
  --chain base-sepolia \
  --etherscan-api-key $BASESCAN_API_KEY \
  --constructor-args $(cast abi-encode "constructor(address,address,address,uint16)" \
    0x036CbD53842c5426634e7929541eC2318f3dCF7e $ARBITER $FEE_RECIPIENT 250)

# 5. Set Vercel env var
vercel env add NEXT_PUBLIC_ESCROW_CONTRACT production
# paste deployed address
vercel env add NEXT_PUBLIC_ESCROW_CHAIN production
# 8453 for mainnet, 84532 for Sepolia
```

## Security properties

- **No owner, no pause** — immutable after deploy. Arbiter and fee recipient are
  set at construction and can't change. That's a feature: federated instances
  can verify the contract source once and trust it forever.
- **Client custody until release** — funds stay in the contract; only `release`
  (by client) or `arbitrate` (by arbiter) can move them to the freelancer.
- **Bilateral refund** — freelancer can voluntarily refund the client. Useful
  when the freelancer can't deliver and wants to preserve their reputation.
- **Platform fee capped at 10%** in constructor — can't be raised post-deploy.
