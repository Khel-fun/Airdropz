const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    const characterNFTAddress = "0x349718578943A5bfF64a1A06C6DE4C1A0547CC17";   //Put character NFT address instead of this
   
    const HomeGameplayManager = await ethers.getContractFactory("HomeGameplayManager");
    const homeGameplayManager = await HomeGameplayManager.deploy(characterNFTAddress); 
    await homeGameplayManager.waitForDeployment();

    console.log(`HomeGameplayManager deployed to: ${await homeGameplayManager.getAddress()}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 