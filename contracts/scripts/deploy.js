const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log(
    "Account balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
  );

  // Deploy CharacterNFT
  console.log("\nDeploying CharacterNFT...");
  const CharacterNFT = await ethers.getContractFactory("CharacterNFT");
  const characterNFT = await CharacterNFT.deploy();
  await characterNFT.waitForDeployment();
  const characterNFTAddress = await characterNFT.getAddress();
  console.log("CharacterNFT deployed to:", characterNFTAddress);

  // Deploy HomeGameplayManager
  console.log("\nDeploying HomeGameplayManager...");
  const HomeGameplayManager = await ethers.getContractFactory(
    "HomeGameplayManager",
  );
  const gameplayManager = await HomeGameplayManager.deploy(characterNFTAddress);
  await gameplayManager.waitForDeployment();
  const gameplayManagerAddress = await gameplayManager.getAddress();
  console.log("HomeGameplayManager deployed to:", gameplayManagerAddress);

  // Set the minter role for the GameplayManager contract
  console.log("\nSetting minter role...");
  const tx = await characterNFT.setMinter(gameplayManagerAddress, true);
  await tx.wait();
  console.log("GameplayManager set as minter");

  console.log("\n=== Deployment Summary ===");
  console.log("CharacterNFT:", characterNFTAddress);
  console.log("HomeGameplayManager:", gameplayManagerAddress);
  console.log("\nSave these addresses for frontend integration!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
