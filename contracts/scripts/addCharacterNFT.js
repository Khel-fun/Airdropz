const { ethers } = require("hardhat");

const characters = [
  { id: 1, name: "HERB GATHERER", points: 3000, gems: 0 },
  { id: 2, name: "WOOD SPRITE", points: 5000, gems: 0 },
  { id: 3, name: "BRONZE BUILDER", points: 8000, gems: 0 },
  { id: 4, name: "GARDEN DRYAD", points: 10000, gems: 5 },
  { id: 5, name: "GOLDEN GRIFFON", points: 25000, gems: 15 },
  { id: 6, name: "WATER NYMPH", points: 30000, gems: 25 },
  { id: 7, name: "ARCHITECT TURTLE", points: 40000, gems: 30 },
  { id: 8, name: "MYSTIC DRAGON", points: 70000, gems: 60 },
  { id: 9, name: "DIVINE GOLEM", points: 90000, gems: 80 },
];

async function main() {
  // Get the deployed CharacterNFT contract
  const CharacterNFT = await ethers.getContractFactory("CharacterNFT");
  const characterNFT = await CharacterNFT.attach(
    "0x15b17Dcd418ff81DA15c72Ae3127C5d3D4b24E1b",
  );

  // Add each character
  for (const char of characters) {
    console.log(`Setting requirements for ${char.name}...`);
    try {
      const tx = await characterNFT.setCharacterRequirements(
        char.id,
        char.points,
        char.gems,
        true, // Set isActive to true for all characters
      );
      await tx.wait();
      console.log(`✅ Character ${char.name} added successfully`);
    } catch (error) {
      console.error(`❌ Failed to add character ${char.name}:`, error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
