# Airdropz Game Smart Contracts

Smart contracts for the Airdropz game, deployed on Base Sepolia.

## Features

- **CharacterNFT**: ERC721 NFT contract for game characters
- **HomeGameplayManager**: Manages player state, points, gems, farming, and leaderboard
- **Gem Farming**: Players can farm gems over time
- **Leaderboard System**: Track top players by points

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

3. Add your private key and Basescan API key to the `.env` file

## Deployment

Deploy to Base Sepolia testnet:

```bash
npx hardhat run scripts/deploy.js --network base-sepolia
```

Deploy to Base Mainnet:

```bash
npx hardhat run scripts/deploy.js --network base-mainnet
```

## Contract Verification

After deployment, verify your contracts on Basescan:

```bash
npx hardhat verify --network base-sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## Network Information

- **Base Sepolia Testnet**

  - Chain ID: 84532
  - RPC: https://sepolia.base.org
  - Explorer: https://sepolia.basescan.org
  - Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

- **Base Mainnet**
  - Chain ID: 8453
  - RPC: https://mainnet.base.org
  - Explorer: https://basescan.org

## Testing

Run tests locally:

```bash
npx hardhat test
```

## Key Contract Functions

### HomeGameplayManager

- `updatePoints(address player, uint256 newPoints)`: Award points to a player
- `getPlayerState(address player)`: Get player's current state (points, gems, characters)
- `startFarming()`: Start farming gems
- `claimGems()`: Claim farmed gems
- `mintCharacterNFT(address to, string memory tokenURI, uint256 characterId)`: Mint a character NFT
- `getLeaderboardPage(uint256 offset, uint256 limit)`: Get paginated leaderboard data

### CharacterNFT

- `setCharacterRequirements(uint256 characterId, uint256 points, uint256 gems, bool isActive)`: Set requirements for a character
- `setMinter(address minter, bool status)`: Set minter permissions
