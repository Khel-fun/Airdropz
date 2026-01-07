const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    // Deploy CharacterNFT first
    const CharacterNFT = await ethers.getContractFactory("CharacterNFT");
    const characterNFT = await CharacterNFT.deploy();
    await characterNFT.waitForDeployment();
    const characterNFTAddress = await characterNFT.getAddress()
    console.log(`CharacterNFT deployed to: ${characterNFTAddress}`);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 