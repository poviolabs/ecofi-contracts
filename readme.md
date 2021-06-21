# Ecofi contracts

This repo contains all the contracts that are needed for minting and exchange.

## Run localy
This will start a local hardhat node that allows testign of contracts.

```[bash]
# install dependancies
yarn
# run hardhat and deploy contracts
yarn hardhat:start
```

Running on `localhost:8545`

### Local accounts to add to metamask:
___
Account #0: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
___
Account #1: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`

Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
___
Account #2: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`

Private Key: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

#
## Test frontend react app
Test out some interactions with smart contracts with this simple app
```
cd frontend
# install dependancies
yarn
# run React app
yarn start
```

Running on `localhost:3000`
