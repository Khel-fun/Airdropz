// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./CharacterNFT.sol";

contract HomeGameplayManager {
    CharacterNFT private characterNFT;

    constructor(address characterNFTAddress) {
        characterNFT = CharacterNFT(characterNFTAddress);
    }

    struct PlayerState {
        uint256 points;
        uint256 gems;
        uint256 lives;
        uint256[] characterIds;
        uint256 lastReset;
    }

    mapping(address => PlayerState) private players;

    // Array to track all player addresses
    address[] private playerAddresses;

    // Mapping to check if an address is already in the playerAddresses array
    mapping(address => bool) private isRegistered;

    // Temporary boost storage
    mapping(address => uint256) private boosts;

    struct FarmingState {
        uint256 startTime;
        uint256 lastClaimTime;
        bool isActive;
        uint256 unclaimedGems;
    }

    mapping(address => FarmingState) private farming;
    uint256 constant GEMS_PER_THREE_HOURS = 3;
    uint256 constant MAX_GEMS = 3;

    event FarmingStarted(address indexed player, uint256 startTime);
    event GemsClaimed(address indexed player, uint256 amount);
    event LivesReplenished(address indexed player, uint256 newLives);
    event NewPlayerRegistered(address indexed player);

    // Register player if not already registered
    function _registerPlayer(address player) internal {
        if (!isRegistered[player]) {
            playerAddresses.push(player);
            isRegistered[player] = true;
            emit NewPlayerRegistered(player);
        }
    }

    // Update points after gameplay events
    function updatePoints(address player, uint256 newPoints) external {
        require(newPoints > 0, "Points must be positive");

        _registerPlayer(player);
        players[player].points += newPoints;
        decrementLives(player);
    }

    // Decrement lives upon game-over
    function decrementLives(address player) internal {
        PlayerState storage playerState = players[player];
        if (playerState.lastReset == 0) {
            playerState.lives = 5;
            playerState.lastReset = block.timestamp;
        }
        require(playerState.lives > 0, "No lives left");
        playerState.lives -= 1;
    }

    // Fetch player state
    function getPlayerState(
        address player
    ) external view returns (PlayerState memory) {
        PlayerState memory state = players[player];
        // If player doesn't exist (lives == 0), return state with 5 lives
        if (
            state.lives == 0 &&
            state.lastReset == 0 &&
            state.points == 0 &&
            state.gems == 0
        ) {
            return
                PlayerState({
                    points: 0,
                    gems: 0,
                    lives: 5,
                    characterIds: new uint256[](0),
                    lastReset: 0
                });
        }
        return state;
    }

    function mintCharacterNFT(
        address to,
        string memory tokenURI,
        uint256 characterId
    ) external returns (uint256) {
        PlayerState storage playerState = players[to];

        (
            uint256 pointsRequired,
            uint256 gemsRequired,
            bool isActive
        ) = characterNFT.characterRequirements(characterId);

        require(isActive, "Character not available");
        require(playerState.points >= pointsRequired, "Not enough points");
        require(playerState.gems >= gemsRequired, "Not enough gems");

        playerState.points -= pointsRequired;
        playerState.gems -= gemsRequired;

        uint256 tokenId = characterNFT.mintCharacter(to, tokenURI, characterId);
        playerState.characterIds.push(tokenId);

        return tokenId;
    }

    function activateBoost(
        address player,
        uint256 multiplier,
        uint256 duration
    ) external {
        boosts[player] = multiplier;
        // Logic to expire the boost after 'duration'
    }

    function startFarming() external {
        require(!farming[msg.sender].isActive, "Farming already active");
        _registerPlayer(msg.sender);

        farming[msg.sender] = FarmingState({
            startTime: block.timestamp,
            lastClaimTime: block.timestamp,
            isActive: true,
            unclaimedGems: 0
        });

        emit FarmingStarted(msg.sender, block.timestamp);
    }

    function calculateUnclaimedGems(
        address player
    ) public view returns (uint256) {
        FarmingState memory farmState = farming[player];
        if (!farmState.isActive) return 0;

        uint256 hoursSinceLastClaim = (block.timestamp -
            farmState.lastClaimTime) / 3 hours;
        uint256 calculatedGems = farmState.unclaimedGems +
            (hoursSinceLastClaim * GEMS_PER_THREE_HOURS);

        return calculatedGems > MAX_GEMS ? MAX_GEMS : calculatedGems;
    }

    function claimGems() external {
        FarmingState storage farmState = farming[msg.sender];
        require(farmState.isActive, "Farming not active");

        uint256 gemsToCollect = calculateUnclaimedGems(msg.sender);
        require(gemsToCollect > 0, "No gems to claim");

        farmState.lastClaimTime = block.timestamp;
        farmState.unclaimedGems = 0;
        players[msg.sender].gems += gemsToCollect;

        farmState.isActive = false;
        emit FarmingStarted(msg.sender, 0); // 0 timestamp indicates farming stopped

        emit GemsClaimed(msg.sender, gemsToCollect);
    }

    function getFarmingState(
        address player
    )
        external
        view
        returns (
            bool isActive,
            uint256 unclaimedGems,
            uint256 startTime,
            uint256 lastClaimTime
        )
    {
        FarmingState memory farmState = farming[player];
        return (
            farmState.isActive,
            calculateUnclaimedGems(player),
            farmState.startTime,
            farmState.lastClaimTime
        );
    }

    function stopFarming() external {
        FarmingState storage farmState = farming[msg.sender];
        require(farmState.isActive, "Farming not active");

        // Collect any remaining gems before stopping
        uint256 gemsToCollect = calculateUnclaimedGems(msg.sender);
        if (gemsToCollect > 0) {
            players[msg.sender].gems += gemsToCollect;
            emit GemsClaimed(msg.sender, gemsToCollect);
        }

        farmState.isActive = false;
        farmState.unclaimedGems = 0;
    }

    function replenishLives() external {
        PlayerState storage playerState = players[msg.sender];

        // Handle new player case
        if (playerState.lastReset == 0) {
            playerState.lives = 5;
            playerState.lastReset = block.timestamp;
            emit LivesReplenished(msg.sender, playerState.lives);
            return;
        }

        // Handle existing player case
        require(
            block.timestamp >= playerState.lastReset + 1 days,
            "Cannot replenish yet - wait 24h"
        );

        playerState.lives = 5;
        playerState.lastReset = block.timestamp;

        emit LivesReplenished(msg.sender, playerState.lives);
    }

    // LEADERBOARD FUNCTIONALITY

    // Get all player addresses for leaderboard
    function getAllPlayerAddresses() external view returns (address[] memory) {
        return playerAddresses;
    }

    // Get total number of registered players
    function getTotalPlayers() external view returns (uint256) {
        return playerAddresses.length;
    }

    // Get player points by address
    function getPlayerPoints(address player) external view returns (uint256) {
        return players[player].points;
    }

    // Get leaderboard data with pagination
    function getLeaderboardPage(
        uint256 offset,
        uint256 limit
    )
        external
        view
        returns (address[] memory addresses, uint256[] memory pointValues)
    {
        uint256 totalPlayers = playerAddresses.length;

        // Return empty arrays if no players or offset is out of bounds
        if (totalPlayers == 0 || offset >= totalPlayers) {
            return (new address[](0), new uint256[](0));
        }

        // Calculate actual limit based on available data
        uint256 actualLimit = (offset + limit > totalPlayers)
            ? totalPlayers - offset
            : limit;

        // Create temporary arrays for sorting all players
        address[] memory tempAddresses = new address[](totalPlayers);
        uint256[] memory tempPoints = new uint256[](totalPlayers);

        // Copy all player data
        for (uint256 i = 0; i < totalPlayers; i++) {
            tempAddresses[i] = playerAddresses[i];
            tempPoints[i] = players[playerAddresses[i]].points;
        }

        // Sort by points (using selection sort - better for larger datasets)
        for (uint256 i = 0; i < totalPlayers; i++) {
            uint256 maxIndex = i;

            for (uint256 j = i + 1; j < totalPlayers; j++) {
                if (tempPoints[j] > tempPoints[maxIndex]) {
                    maxIndex = j;
                }
            }

            if (maxIndex != i) {
                // Swap points
                uint256 tempPoint = tempPoints[i];
                tempPoints[i] = tempPoints[maxIndex];
                tempPoints[maxIndex] = tempPoint;

                // Swap addresses
                address tempAddr = tempAddresses[i];
                tempAddresses[i] = tempAddresses[maxIndex];
                tempAddresses[maxIndex] = tempAddr;
            }
        }

        // Create result arrays with just the requested segment
        addresses = new address[](actualLimit);
        pointValues = new uint256[](actualLimit);

        // Copy just the offset segment
        for (uint256 i = 0; i < actualLimit; i++) {
            addresses[i] = tempAddresses[i + offset];
            pointValues[i] = tempPoints[i + offset];
        }

        return (addresses, pointValues);
    }
}
