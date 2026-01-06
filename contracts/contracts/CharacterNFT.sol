// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract CharacterNFT is ERC721URIStorage {
    uint256 private _tokenIds;

    struct CharacterRequirements {
        uint256 pointsRequired;
        uint256 gemsRequired;
        bool isActive;
    }

    mapping(uint256 => CharacterRequirements) public characterRequirements;
    address public gameManager;

    event GameManagerUpdated(
        address indexed previousManager,
        address indexed newManager
    );

    constructor() ERC721("EonianCharacter", "ECHR") {
        gameManager = msg.sender;
    }

    modifier onlyGameManager() {
        require(msg.sender == gameManager, "Not authorized");
        _;
    }

    function setGameManager(address newGameManager) external onlyGameManager {
        require(newGameManager != address(0), "Invalid game manager address");
        address oldManager = gameManager;
        gameManager = newGameManager;
        emit GameManagerUpdated(oldManager, newGameManager);
    }

    function setCharacterRequirements(
        uint256 characterId,
        uint256 pointsRequired,
        uint256 gemsRequired,
        bool isActive
    ) external onlyGameManager {
        characterRequirements[characterId] = CharacterRequirements({
            pointsRequired: pointsRequired,
            gemsRequired: gemsRequired,
            isActive: isActive
        });
    }

    function mintCharacter(
        address to,
        string memory tokenURI,
        uint256 characterId
    ) external returns (uint256) {
        require(
            characterRequirements[characterId].isActive,
            "Character not available"
        );
        _tokenIds++;
        uint256 tokenId = _tokenIds;
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        return tokenId; 
    }
}
