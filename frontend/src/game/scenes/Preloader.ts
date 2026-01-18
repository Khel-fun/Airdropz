import { Scene } from "phaser";

export class Preloader extends Scene {
    constructor() {
        super("Preloader");
    }

    init() {
        //  We loaded this image in our Boot Scene, so we can display it here
        // Get the game dimensions
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;

        // Add the background image
        const bg = this.add
            .image(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                "loading_bg",
            )
            .setOrigin(0.5);

        // Calculate the scale to cover the screen while maintaining aspect ratio
        const bgWidth = bg.width;
        const bgHeight = bg.height;

        // Calculate scale for both dimensions
        const scaleX = gameWidth / bgWidth;
        const scaleY = gameHeight / bgHeight;

        // Use the larger scale to ensure the image covers the entire screen
        const scale = Math.max(scaleX, scaleY);

        // Apply the scale
        bg.setScale(scale);

        // If the image is larger than the screen in any dimension, adjust the crop
        if (bgWidth * scale > gameWidth || bgHeight * scale > gameHeight) {
            const cropWidth = Math.min(bgWidth, gameWidth / scale);
            const cropHeight = Math.min(bgHeight, gameHeight / scale);

            const cropX = (bgWidth - cropWidth) / 2;
            const cropY = (bgHeight - cropHeight) / 2;

            bg.setCrop(cropX, cropY, cropWidth, cropHeight);
        }

        //  A simple progress bar. This is the outline of the bar.
        // this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY - 100, 156, 28).setStrokeStyle(1, 0x3361a5);

        // Create animated loading indicator with cycling icons (positioned in bottom portion)
        const loadingIcon = this.add
            .image(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                "loading-1",
            )
            .setOrigin(0.5)
            .setScale(0.8);

        // Add LOADING text below the icon
        // this.add
        //     .text(
        //         this.cameras.main.centerX,
        //         this.cameras.main.centerY + 240,
        //         "LOADING",
        //         {
        //             fontSize: "25px",
        //             color: "#fff",
        //             fontFamily: "Helvetica Neue Bold, Arial, sans-serif",
        //             letterSpacing: 1,
        //         },
        //     )
        //     .setOrigin(0.5)
        //     .setScale(0.8);

        // Animate between loading icons
        let currentFrame = 1;
        this.time.addEvent({
            delay: 300, // Change icon every 300ms
            callback: () => {
                currentFrame = (currentFrame % 4) + 1;
                loadingIcon.setTexture(`loading-${currentFrame}`);
            },
            loop: true,
        });
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath("assets");

        this.load.image("logo", "logo.png");
        this.load.image("star", "star.png");
        this.load.image("particle", "particle.png");
        // Load images
        this.load.image("background", "game_bg.png"); // Background image
        this.load.svg("cauldron", "cauldrons/cauldron.svg"); // Cauldron image
        this.load.svg("cauldron-speed", "cauldrons/couldron-speed.svg"); // Speed boost cauldron
        this.load.svg("cauldron-slow", "cauldrons/couldron-slow.svg"); // Slow cauldron
        this.load.svg("cauldron-shield", "cauldrons/couldron-shield.svg"); // Shield cauldron
        this.load.svg("cauldron-2x", "cauldrons/couldron-2x.svg"); // Double points cauldron
        this.load.svg("cauldron-magnet", "cauldrons/couldron-magnet.svg"); // Magnet cauldron

        this.load.image("game-over", "game-over.png");
        this.load.image("popup", "popup.png");
        this.load.image("loading_bg", "loading_bg.png");

        // Game over scene assets
        this.load.image("score-bg", "score.png");
        this.load.image("score-breakdown-bg", "score_breakdown.png");
        this.load.svg("play-again-button", "play-again-button.svg");

        // Coin images
        this.load.image("bitcoin", "coins/bitcoin.png");
        this.load.image("ethereum", "coins/ethereum.png");
        this.load.image("usdc", "coins/usdc.png");
        this.load.image("solana", "coins/solana.png");
        this.load.image("zcash", "coins/zcash.png");
        this.load.image("profile-img", "coins/profile-img.png");

        this.load.image("market", "tabs-colored/Market.png");
        this.load.image("eonians", "tabs-colored/Eonian.png");
        this.load.image("tasks", "tabs-colored/Tasks.png");
        this.load.image("alchemist", "tabs-colored/Alchemist.png");
        this.load.image("home-green-button", "home-green-button.png");

        // Load new button assets
        this.load.svg("play-button-yellow", "buttons/play-button-yellow.svg");
        this.load.svg("play-button-rose", "buttons/play-button-rose.svg");

        // Load ingradients
        this.load.svg("Common1", "Common1.svg");
        this.load.svg("Common2", "Common2.svg");
        this.load.svg("Common3", "Common3.svg");

        this.load.svg("Rare1", "Rare1.svg");

        this.load.svg("Superrare1", "Superrare.svg");

        this.load.image("speed_booster", "speed_booster.svg");
        this.load.image("slower_ingredient", "slower_ingredient.svg");
        this.load.image("magnet", "magnet.svg");
        this.load.image("shield", "shield.svg");
        this.load.image("double_points", "double_points.svg");

        // Load UI assets
        this.load.image("score_bar", "score_bar.svg");

        // Load sound assets
        this.load.audio("click", "music/click_.wav");
        this.load.audio("common_gathering", "music/common gathering_.wav");
        this.load.audio("rare_gathering", "music/Rare Gathering_.wav");
        this.load.audio(
            "superrare_gathering",
            "music/superrare gathering sound_.wav",
        );
        this.load.audio("ingredient_crash", "music/ingredient crash_.wav");
        this.load.audio("speed_boost", "music/speed boost(alarm)_.wav");
        this.load.audio("slowing_boost", "music/slowing boost_.wav");
        this.load.audio("magnet", "music/magnet activation.wav");
        this.load.audio("shield", "music/shield_.wav");
        this.load.audio("x2", "music/x2_.wav");
        this.load.audio("game_over", "music/congrats (game over page)_.wav");
        this.load.audio("gameplay", "music/Gameplay Sound1.mp3");
        this.load.audio("countdown", "music/countdown.wav");
        this.load.audio(
            "ingredient_falling",
            "music/Ingredients' falling effect.wav",
        );
        this.load.audio(
            "magnet_ingredient_falling",
            "music/Falling effect WEAPON_Axe.wav",
        );

        // Load voiceover music
        this.load.audio(
            "catch_the_ingredients",
            "music/voiceovers/Catch the ingredients.mp3",
        );
        this.load.audio("congrats", "music/voiceovers/congrats.wav");
        this.load.audio("speed_up", "music/voiceovers/speed up.wav");
        this.load.audio("go", "music/voiceovers/Go.mp3");

        // Load speed boost sprites
        this.load.spritesheet(
            "lightening",
            "effects/Speed Boost Falling Effect.png",
            {
                frameWidth: 256,
                frameHeight: 256,
            },
        );

        this.load.spritesheet("magnet_effect", "effects/Magnet Falling.png", {
            frameWidth: 256,
            frameHeight: 256,
        });

        this.load.spritesheet("shield_effect", "effects/Shield Falling.png", {
            frameWidth: 256,
            frameHeight: 256,
        });

        this.load.spritesheet(
            "slowdown_effect",
            "effects/Slowing Boost Falling Effect.png",
            {
                frameWidth: 256,
                frameHeight: 256,
            },
        );

        this.load.spritesheet(
            "common_ingredient_effect",
            "effects/Common Falling.png",
            {
                frameWidth: 256,
                frameHeight: 256,
            },
        );

        this.load.spritesheet(
            "rare_ingredient_effect",
            "effects/Rare Falling.png",
            {
                frameWidth: 256,
                frameHeight: 256,
            },
        );

        this.load.spritesheet(
            "superrare_ingredient_effect",
            "effects/Super Rare Falling.png",
            {
                frameWidth: 256,
                frameHeight: 256,
            },
        );
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        // Simulate a delay before starting the next scene
        // this.time.delayedCall(1000, () => { // 1000 ms = 1 second
        this.scene.start("GamePlay");
        // });
    }
}

