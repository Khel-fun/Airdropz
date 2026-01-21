import { Scene, GameObjects } from "phaser";
import { EventBus } from "../EventBus";

// Define power-up types
enum PowerUpType {
    SPEED_BOOSTER,
    SLOWER,
    MAGNET,
    SHIELD,
    DOUBLE_POINTS,
}

interface PowerUp {
    type: PowerUpType;
    image: GameObjects.Image;
}

interface ActivePowerUp {
    type: PowerUpType;
    remainingTime: number; // in seconds
    icon: GameObjects.Image;
    timerText: GameObjects.Text;
    originalEffect?: any; // Store original values to restore later
}

export class GamePlay extends Scene {
    private cauldron: GameObjects.Image;
    private ingredients: {
        image: GameObjects.Image;
        score: number;
        coinType?: string;
    }[];
    private score: number;
    private scoreText: GameObjects.Text;
    private scoreBarBg: GameObjects.Image;
    private gameOver: boolean;
    private background: GameObjects.Image;
    private gameOverPoint: number;
    private speedMultiplier: number;
    private speedIncreaseCount: number;
    private baseSpeed: number = 5;

    // Track coin collection stats
    private coinStats: { [key: string]: number } = {
        bitcoin: 0,
        zcash: 0,
        ethereum: 0,
        usdc: 0,
        solana: 0,
    };

    // Power-up related properties
    private powerUps: PowerUp[] = [];
    private activePowerUps: ActivePowerUp[] = [];
    private powerUpContainer: GameObjects.Container;
    private shieldActive: boolean = false;
    private pointsMultiplier: number = 1;
    private magnetActive: boolean = false;
    private magnetRange: number = 800;

    // Add new animation-related properties
    private particles: Phaser.GameObjects.Particles.ParticleEmitter;
    private cauldronEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private screenFlash: Phaser.GameObjects.Rectangle;
    private speedBoostEdgeEffect:
        | Phaser.GameObjects.Rectangle
        | Phaser.GameObjects.Container
        | null = null;
    private _pendingSpeedBoostEffect: Phaser.GameObjects.Container | null =
        null;

    // Add a property for the trail emitter
    // private ingredientTrailEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

    private commonIngredients: string[] = [
        "Common1",
        "Common2",
        "Common3",
        // "Common4",
        // "Common5",
    ];
    private rareIngredients: string[] = [
        "Rare1",
        // "Rare2",
        // "Rare3",
        // "Rare4",
        // "Rare5",
    ];
    private superRareIngredients: string[] = [
        "Superrare1",
        // "Superrare2",
        // "Superrare3",
        // "Superrare4",
        // "Superrare5",
    ];

    // Power-up ingredients
    private powerUpTypes: string[] = [
        "speed_booster",
        "slower_ingredient",
        "magnet",
        "shield",
        "double_points",
    ];

    // Add these properties to track spawn-related values
    private spawnDelay: number = 1000; // Initial spawn delay
    private ingredientSpawnEvent: Phaser.Time.TimerEvent;

    private sounds: {
        click: Phaser.Sound.BaseSound;
        commonGathering: Phaser.Sound.BaseSound;
        rareGathering: Phaser.Sound.BaseSound;
        superrareGathering: Phaser.Sound.BaseSound;
        ingredientCrash: Phaser.Sound.BaseSound;
        speedBoost: Phaser.Sound.BaseSound;
        slowingBoost: Phaser.Sound.BaseSound;
        magnet: Phaser.Sound.BaseSound;
        shield: Phaser.Sound.BaseSound;
        x2: Phaser.Sound.BaseSound;
        gameOver: Phaser.Sound.BaseSound;
        backgroundMusic: Phaser.Sound.BaseSound;
        countdown: Phaser.Sound.BaseSound;
        ingredientFalling: Phaser.Sound.BaseSound;

        // Add voiceovers
        catchTheIngredients: Phaser.Sound.BaseSound;
        congrats: Phaser.Sound.BaseSound;
        speedUp: Phaser.Sound.BaseSound;
        go: Phaser.Sound.BaseSound;
    };

    private countdownSoundActive: boolean = false;

    constructor() {
        super("GamePlay");
    }

    preload() {
        // Load any assets if needed
    }

    create() {
        this.sound.stopAll();

        this.score = 0;
        this.gameOver = false;
        this.ingredients = [];
        this.powerUps = [];
        this.activePowerUps = [];
        this.speedIncreaseCount = 0;
        this.speedMultiplier = 1;
        this.pointsMultiplier = 1;
        this.spawnDelay = 1000;

        // Reset coin stats
        this.coinStats = {
            bitcoin: 0,
            zcash: 0,
            ethereum: 0,
            usdc: 0,
            solana: 0,
        };

        // Create game elements
        this.createBackground();
        this.createCauldron();
        this.createUI();
        this.initSounds();
        this.sounds.backgroundMusic.play();

        // this.setupInput();

        // Create container for power-up indicators in the top right corner
        // Move it down from the very top by increasing the Y coordinate
        this.powerUpContainer = this.add.container(
            this.cameras.main.width - 15,
            50,
        );
        this.powerUpContainer.setDepth(100); // Ensure it's above other elements

        // Spawn ingredients - store reference to the event
        this.ingredientSpawnEvent = this.time.addEvent({
            delay: this.spawnDelay,
            callback: this.spawnIngredient,
            callbackScope: this,
            loop: true,
        });

        // Occasionally spawn power-ups (every 5 seconds)
        this.time.addEvent({
            delay: 5000,
            callback: this.spawnPowerUp,
            callbackScope: this,
            loop: true,
        });

        // Schedule first speed increase (20 seconds)
        this.time.addEvent({
            delay: 20000,
            callback: this.increaseSpeed,
            callbackScope: this,
            loop: false,
        });

        // Add screen flash rectangle (invisible by default)
        this.screenFlash = this.add
            .rectangle(
                0,
                0,
                this.cameras.main.width,
                this.cameras.main.height,
                0xffffff,
                0,
            )
            .setOrigin(0, 0)
            .setDepth(90);

        // Setup particle systems
        this.setupParticles();

        this.anims.create({
            key: "lightning_anim",
            frames: this.anims.generateFrameNumbers("lightening", {
                start: 0,
                end: 8,
            }),
            frameRate: 10,
            repeat: 1,
        });

        this.anims.create({
            key: "magnet_anim",
            frames: this.anims.generateFrameNumbers("magnet_effect", {
                start: 0,
                end: 9,
            }),
            frameRate: 15,
            repeat: 0,
        });

        this.anims.create({
            key: "shield_anim",
            frames: this.anims.generateFrameNumbers("shield_effect", {
                start: 0,
                end: 32,
            }),
            frameRate: 20,
            repeat: 0,
        });

        this.anims.create({
            key: "slowdown_anim",
            frames: this.anims.generateFrameNumbers("slowdown_effect", {
                start: 0,
                end: 8,
            }),
            frameRate: 15,
            repeat: 0,
        });

        this.anims.create({
            key: "common_ingredient_anim",
            frames: this.anims.generateFrameNumbers(
                "common_ingredient_effect",
                { start: 0, end: 7 },
            ),
            frameRate: 20,
            repeat: 0,
        });

        this.anims.create({
            key: "rare_ingredient_anim",
            frames: this.anims.generateFrameNumbers("rare_ingredient_effect", {
                start: 0,
                end: 9,
            }),
            frameRate: 20,
            repeat: 0,
        });

        this.anims.create({
            key: "superrare_ingredient_anim",
            frames: this.anims.generateFrameNumbers(
                "superrare_ingredient_effect",
                { start: 0, end: 9 },
            ),
            frameRate: 20,
            repeat: 0,
        });

        // Now create an emitter from the manager using your desired config
        // this.ingredientTrailEmitter = this.add.particles(0, 0, "particle", {
        //     speed: 0,                     // no independent motion
        //     lifespan: 200,                // adjust lifespan for a visible tail effect
        //     scale: { start: 1.5, end: 1 },  // trail shrinks over time
        //     alpha: { start: 0.3, end: 0 },  // fades out
        //     blendMode: "NORMAL",        // see if this works well with your effect; you may try "NORMAL" if needed
        //     quantity: 1,
        //     frequency: -1,               // manual emission (we fire each frame)
        //     tint: { start: 0x555555, end: 0x555555 }, // dark grey to even darker grey tail
        // });

        // Add a start animation
        this.startAnimation();
    }

    private initSounds() {
        this.sounds = {
            click: this.sound.add("click", { volume: 0.5 }),
            commonGathering: this.sound.add("common_gathering", {
                volume: 0.5,
            }),
            rareGathering: this.sound.add("rare_gathering", { volume: 0.6 }),
            superrareGathering: this.sound.add("superrare_gathering", {
                volume: 0.5,
            }),
            ingredientCrash: this.sound.add("ingredient_crash", {
                volume: 0.5,
            }),
            speedBoost: this.sound.add("speed_boost", { volume: 0.2 }),
            slowingBoost: this.sound.add("slowing_boost", { volume: 0.4 }),
            magnet: this.sound.add("magnet", { volume: 0.4 }),
            shield: this.sound.add("shield", { volume: 0.4 }),
            x2: this.sound.add("x2", { volume: 0.3 }),
            gameOver: this.sound.add("game_over", { volume: 0.7 }),
            backgroundMusic: this.sound.add("gameplay", {
                volume: 0.1,
                loop: true,
            }),
            countdown: this.sound.add("countdown", {
                volume: 0.05,
                loop: true,
            }),
            ingredientFalling: this.sound.add("ingredient_falling", {
                volume: 0.2,
            }),

            // Add voiceovers
            catchTheIngredients: this.sound.add("catch_the_ingredients", {
                volume: 0.8,
            }),
            congrats: this.sound.add("congrats", { volume: 0.8 }),
            speedUp: this.sound.add("speed_up", { volume: 0.8 }),
            go: this.sound.add("go", { volume: 0.8 }),
        };
    }

    private createBackground() {
        this.background = this.add
            .image(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                "background",
            )
            .setOrigin(0.5)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    }

    private createCauldron() {
        this.cauldron = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.height - 100,
            "cauldron",
        );
        this.cauldron.setScale(1);

        this.gameOverPoint =
            this.cameras.main.height -
            100 -
            this.cauldron.height * this.cauldron.scale * 0.25;
    }

    private createUI() {
        // Add score bar background in top right corner
        const scoreBarX = this.cameras.main.width - 35;
        const scoreBarY = 38;

        this.scoreBarBg = this.add
            .image(scoreBarX, scoreBarY, "score_bar")
            .setOrigin(1, 0.5)
            .setScale(1.3)
            .setDepth(100);

        // Position score text on top of the score bar
        this.scoreText = this.add
            .text(scoreBarX - 50, scoreBarY, "0", {
                fontSize: "15px",
                color: "#90392E",
                fontFamily: "Helvetica, Arial, sans-serif",
                fontStyle: "bold",
            })
            .setOrigin(0.5, 0.5)
            .setDepth(101);

        this.input.on("pointermove", (pointer: any) => {
            this.cauldron.x = pointer.x;
        });

        this.input.on("pointerdown", () => {
            if (this.gameOver) {
                this.scene.start("GameOver", { score: this.score });
            }
        });

        this.input.on("pointermove", (pointer: any) => {
            this.cauldron.x = pointer.x;
        });

        this.input.on("pointerdown", () => {
            this.sounds.click.play();
            if (this.gameOver) {
                this.scene.start("GameOver", { score: this.score });
            }
        });
    }

    update(time: number, delta: number) {
        // Update ingredients
        this.updateIngredients();

        // Update power-ups
        this.updatePowerUps();

        // Update active power-up timers
        this.updateActivePowerUps(delta);

        // Apply magnet effect if active
        if (this.magnetActive) {
            this.applyMagnetEffect();
        }
    }

    // Setup particle systems for various effects
    private setupParticles() {
        // Create particles directly with configuration
        this.cauldronEmitter = this.add.particles(0, 0, "particle", {
            speed: { min: 100, max: 200 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 800,
            blendMode: "ADD",
            // on: false,
        });

        // Set depth to ensure it's visible above other elements
        this.cauldronEmitter.setDepth(50);
    }

    // Game start animation
    private startAnimation() {
        // Create a centered overlay text
        const readyText = this.add
            .text(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                "Catch the Ingredients!",
                {
                    fontSize: "20px",
                    color: "#ffffff",
                    fontFamily: "Helvetica, Arial, sans-serif",
                    stroke: "#000000",
                    strokeThickness: 6,
                },
            )
            .setOrigin(0.5)
            .setDepth(100);

        this.sounds.catchTheIngredients.play();

        // Animation sequence
        this.tweens.add({
            targets: readyText,
            scale: 1.2,
            duration: 500,
            yoyo: true,
            ease: "Sine.easeInOut",
            onComplete: () => {
                this.tweens.add({
                    targets: readyText,
                    scale: 0,
                    y: readyText.y - 100,
                    duration: 300,
                    ease: "Back.easeIn",
                    onComplete: () => {
                        readyText.setText("GO!");
                        readyText.setScale(0);
                        readyText.y = this.cameras.main.centerY + 100;

                        this.time.delayedCall(200, () => {
                            this.sounds.go.play();
                        });

                        this.tweens.add({
                            targets: readyText,
                            scale: 1.5,
                            y: this.cameras.main.centerY,
                            duration: 200,
                            ease: "Back.easeOut",
                            onComplete: () => {
                                this.tweens.add({
                                    targets: readyText,
                                    scale: 0,
                                    y: readyText.y - 150,
                                    alpha: 0,
                                    duration: 400,
                                    ease: "Back.easeIn",
                                    delay: 300,
                                    onComplete: () => {
                                        readyText.destroy();
                                    },
                                });
                            },
                        });
                    },
                });
            },
        });
    }

    private updateIngredients() {
        // Use for loop in reverse to safely remove elements while iterating
        for (let i = this.ingredients.length - 1; i >= 0; i--) {
            const ingredient = this.ingredients[i];
            ingredient.image.y += this.baseSpeed * this.speedMultiplier;

            // Emit a particle at the ingredient's current position to create a tail effect
            // this.ingredientTrailEmitter.emitParticleAt(
            //     ingredient.image.x,
            //     ingredient.image.y,
            // );

            // Check for game over condition (missed ingredient)
            if (ingredient.image.y > this.gameOverPoint) {
                // If shield is active, don't end the game
                if (this.shieldActive) {
                    this.animateIngredientDestroy(ingredient.image);
                    ingredient.image.destroy();
                    this.ingredients.splice(i, 1);
                    continue;
                } else {
                    this.gameOver = true;
                    this.animateGameOver();
                    return;
                }
            }

            // Check for ingredient collection
            if (
                this.cauldron
                    .getBounds()
                    .contains(ingredient.image.x, ingredient.image.y)
            ) {
                // Apply points multiplier if active
                this.score += ingredient.score * this.pointsMultiplier;
                this.scoreText.setText(this.score.toString());

                // Animate the collection
                this.animateIngredientCollection(ingredient);

                // Remove the ingredient
                this.ingredients.splice(i, 1);
            }
        }
    }

    private updatePowerUps() {
        // Use for loop in reverse to safely remove elements while iterating
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.image.y += this.baseSpeed * this.speedMultiplier;

            // Power-ups should not trigger game over
            if (powerUp.image.y > this.cameras.main.height) {
                powerUp.image.destroy();
                this.powerUps.splice(i, 1);
                continue;
            }

            // Check for power-up collection
            if (
                this.cauldron
                    .getBounds()
                    .contains(powerUp.image.x, powerUp.image.y)
            ) {
                this.activatePowerUp(powerUp.type);
                powerUp.image.destroy();
                this.powerUps.splice(i, 1);
            }
        }
    }

    private updateActivePowerUps(delta: number) {
        // Update each active power-up timer
        for (let i = this.activePowerUps.length - 1; i >= 0; i--) {
            const powerUp = this.activePowerUps[i];

            // Decrease remaining time (convert delta from ms to seconds)
            powerUp.remainingTime -= delta / 1000;

            // Format timer as MM:SS
            const totalSeconds = Math.ceil(powerUp.remainingTime);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

            // Update timer text
            powerUp.timerText.setText(timeString);

            // Check if power-up has expired
            if (powerUp.remainingTime <= 0) {
                this.deactivatePowerUp(powerUp.type, i);
            }
        }

        // If we have no active power-ups but countdown sound is still playing, stop it
        if (this.activePowerUps.length === 0 && this.countdownSoundActive) {
            this.sounds.countdown.stop();
            this.countdownSoundActive = false;
        }
    }

    private spawnIngredient() {
        if (this.gameOver) return;

        const x = Phaser.Math.Between(100, this.cameras.main.width - 100);
        const rarityRoll = Phaser.Math.Between(1, 100);

        let ingredientKey: string;
        let score: number;

        if (rarityRoll <= 70) {
            // Common ingredient (10 points)
            const randomIndex = Phaser.Math.Between(
                0,
                this.commonIngredients.length - 1,
            );
            ingredientKey = this.commonIngredients[randomIndex];
            score = 10;
        } else if (rarityRoll <= 90) {
            // Rare ingredient (50 points)
            const randomIndex = Phaser.Math.Between(
                0,
                this.rareIngredients.length - 1,
            );
            ingredientKey = this.rareIngredients[randomIndex];
            score = 50;
        } else {
            // Super rare ingredient (100 points)
            const randomIndex = Phaser.Math.Between(
                0,
                this.superRareIngredients.length - 1,
            );
            ingredientKey = this.superRareIngredients[randomIndex];
            score = 100;
        }

        const ingredient = this.add.image(x, 0, ingredientKey);
        ingredient.setScale(1);

        if (!this.sounds.ingredientFalling.isPlaying) {
            this.sounds.ingredientFalling.play();
        } else {
            if (Math.random() > 0.7) {
                const tempSound = this.sound.add("ingredient_falling", {
                    volume: 0.2,
                });
                tempSound.play();

                this.time.delayedCall(1000, () => {
                    tempSound.destroy();
                });
            }
        }

        // const size = 50;
        // ingredient.setDisplaySize(size, size);

        // Map ingredient to coin type based on score
        let coinType: string | undefined;
        if (score === 10)
            coinType = "bitcoin"; // Common ingredients (10 points)
        else if (score === 50)
            coinType = "zcash"; // Rare ingredients (50 points)
        else if (score === 100) coinType = "ethereum"; // Super rare ingredients (100 points)

        // Randomly assign usdc or solana for variety
        if (Math.random() > 0.5) {
            if (coinType === "ethereum") coinType = "usdc";
            else if (coinType === "zcash") coinType = "solana";
        }

        this.ingredients.push({ image: ingredient, score, coinType });
    }

    private spawnPowerUp() {
        if (this.gameOver) return;

        // Don't spawn new power-ups if any power-up is already active
        if (this.activePowerUps.length > 0) return;

        // 70% chance to spawn a power-up
        if (Phaser.Math.Between(1, 100) > 70) return;

        const margin = 100;
        const availableWidth = this.cameras.main.width - margin * 2;
        const randomFactor = Math.random();
        const x = margin + availableWidth * randomFactor;

        // Select a random power-up type
        const typeIndex = Phaser.Math.Between(0, this.powerUpTypes.length - 1);
        const powerUpKey = this.powerUpTypes[typeIndex];

        const powerUpImage = this.add.image(x, 0, powerUpKey);
        powerUpImage.setScale(1); // Reduced size for powerups

        // const size = 60; // Fixed size in pixels
        // powerUpImage.setDisplaySize(size, size);

        this.powerUps.push({
            type: typeIndex as PowerUpType,
            image: powerUpImage,
        });
    }

    // Animation for power-up collection
    private activatePowerUp(type: PowerUpType) {
        // Check if this power-up is already active
        const existingIndex = this.activePowerUps.findIndex(
            (p) => p.type === type,
        );
        let duration = 0;

        // Determine duration based on power-up type
        switch (type) {
            case PowerUpType.SPEED_BOOSTER:
                this.sounds.speedBoost.play();
                duration = 5;
                this.speedMultiplier *= 1.5;
                this.createLightningEffect();
                break;

            case PowerUpType.SLOWER:
                this.sounds.slowingBoost.play();
                duration = 8;
                this.speedMultiplier *= 0.5;
                this.createSlowdownEffect();
                break;

            case PowerUpType.MAGNET:
                this.sounds.magnet.play();
                duration = 5;
                this.magnetActive = true;
                this.createMagnetEffect();
                break;

            case PowerUpType.SHIELD:
                this.sounds.shield.play();
                duration = 10;
                this.shieldActive = true;
                this.createShieldEffect();
                break;

            case PowerUpType.DOUBLE_POINTS:
                this.sounds.x2.play();
                duration = 15;
                this.pointsMultiplier = 2;

                // Add sparkle effect to cauldron
                const sparkleEmitter = this.add.particles(
                    this.cauldron.x,
                    this.cauldron.y,
                    "particle",
                    {
                        speed: { min: 20, max: 50 },
                        angle: { min: 0, max: 360 },
                        scale: { start: 0.3, end: 0 },
                        lifespan: 1000,
                        quantity: 1,
                        frequency: 100,
                        blendMode: "ADD",
                        tint: 0xffff00,
                    },
                );

                // Make emitter follow cauldron
                this.tweens.add({
                    targets: sparkleEmitter,
                    x: "+=0", // This is a trick to make the tween track the cauldron x position
                    onUpdate: () => {
                        sparkleEmitter.setPosition(
                            this.cauldron.x,
                            this.cauldron.y - 20,
                        );
                    },
                    duration: duration * 1000,
                });

                // Store for removal later
                // this.activePowerUps[
                //     this.activePowerUps.length - 1
                // ].originalEffect = sparkleEmitter;
                break;
        }

        // If already active, reset the timer
        if (existingIndex >= 0) {
            this.activePowerUps[existingIndex].remainingTime = duration;
            return;
        }

        // Create UI element for the power-up - positioned for top right corner
        // Power-up icon aligned with score bar margin, timer bar to its left

        // Create timer bar background (to the left of power-up icon, no gap)
        const timerBar = this.add
            .image(-78.5, 38, "timer_bar")
            .setDisplaySize(55, 28)
            .setOrigin(0.5, 0.5);

        // Format timer as MM:SS
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

        // Create timer text inside the timer bar
        const timerText = this.add
            .text(-78.5, 38, timeString, {
                fontSize: "11px",
                color: "#000000",
                fontFamily: "Helvetica, Arial, sans-serif",
                fontStyle: "bold",
            })
            .setOrigin(0.5, 0.5);

        // Create power-up icon aligned with score bar margin (35px from right)
        const icon = this.add
            .image(-35, 38, this.powerUpTypes[type])
            .setDisplaySize(32, 32)
            .setOrigin(0.5, 0.5);

        // Add to the power-up container
        this.powerUpContainer.add(timerBar);
        this.powerUpContainer.add(timerText);
        this.powerUpContainer.add(icon);

        // Add to active power-ups
        this.activePowerUps.push({
            type,
            remainingTime: duration,
            icon,
            timerText,
            originalEffect:
                type === PowerUpType.SPEED_BOOSTER &&
                this._pendingSpeedBoostEffect
                    ? this._pendingSpeedBoostEffect
                    : timerBar, // Use the pending effect for speed booster, otherwise timer bar
        });

        if (
            type === PowerUpType.SPEED_BOOSTER &&
            this._pendingSpeedBoostEffect
        ) {
            this._pendingSpeedBoostEffect = null; // Clear the pending reference
        }

        // After adding the power-up, start the countdown sound if it's not already playing
        if (!this.countdownSoundActive && !this.sounds.countdown.isPlaying) {
            this.sounds.countdown.play();
            this.countdownSoundActive = true;
        }

        // Display activation message
        const powerUpName = this.getPowerUpName(type);
        this.showPowerUpMessage(`${powerUpName} Activated!`);
        this.cameras.main.shake(300, 0.01);

        // Change cauldron texture based on power-up type
        this.changeCauldronTexture(type);

        // Add visual feedback based on power-up type
        switch (type) {
            case PowerUpType.SHIELD:
                // Add shield visual around cauldron
                const shield = this.add.circle(
                    this.cauldron.x,
                    this.cauldron.y,
                    this.cauldron.width * 0.7,
                    0x00ffff,
                    0.3,
                );
                shield.depth = this.cauldron.depth - 1;

                // Pulsing shield animation
                this.tweens.add({
                    targets: shield,
                    alpha: 0.5,
                    scale: 1.1,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                });

                // Store for removal later
                this.activePowerUps[
                    this.activePowerUps.length - 1
                ].originalEffect = shield;
                break;

            case PowerUpType.DOUBLE_POINTS:
                // Add sparkle effect to cauldron
                const sparkleEmitter = this.add.particles(
                    this.cauldron.x,
                    this.cauldron.y,
                    "particle",
                    {
                        speed: { min: 20, max: 50 },
                        angle: { min: 0, max: 360 },
                        scale: { start: 0.3, end: 0 },
                        lifespan: 1000,
                        quantity: 1,
                        frequency: 100,
                        blendMode: "ADD",
                        tint: 0xffff00,
                    },
                );

                // Make emitter follow cauldron
                this.tweens.add({
                    targets: sparkleEmitter,
                    x: "+=0", // This is a trick to make the tween track the cauldron x position
                    onUpdate: () => {
                        sparkleEmitter.setPosition(
                            this.cauldron.x,
                            this.cauldron.y - 20,
                        );
                    },
                    duration: duration * 1000,
                });

                // Store for removal later
                this.activePowerUps[
                    this.activePowerUps.length - 1
                ].originalEffect = sparkleEmitter;
                break;
        }
    }

    private deactivatePowerUp(type: PowerUpType, index: number) {
        // Restore cauldron to default texture
        this.cauldron.setTexture("cauldron");

        // Remove the power-up effect
        switch (type) {
            case PowerUpType.SPEED_BOOSTER:
                this.speedMultiplier /= 1.5;
                // Stop speed boost sound if it's still playing
                if (this.sounds.speedBoost.isPlaying) {
                    this.sounds.speedBoost.stop();
                }
                // Stop speed boost sound if it's still playing
                if (this.sounds.speedBoost.isPlaying) {
                    this.sounds.speedBoost.stop();
                }

                // Clean up the edge effect animation
                if (
                    this.speedBoostEdgeEffect &&
                    this.activePowerUps[index].originalEffect ===
                        this.speedBoostEdgeEffect
                ) {
                    // Fade out the effect gracefully
                    if (
                        this.speedBoostEdgeEffect instanceof
                        Phaser.GameObjects.Container
                    ) {
                        this.tweens.add({
                            targets: this.speedBoostEdgeEffect.getAll(),
                            alpha: 0,
                            duration: 300,
                            onComplete: () => {
                                if (this.speedBoostEdgeEffect) {
                                    this.speedBoostEdgeEffect.destroy();
                                    this.speedBoostEdgeEffect = null;
                                }
                            },
                        });
                    } else {
                        this.tweens.add({
                            targets: this.speedBoostEdgeEffect,
                            alpha: 0,
                            duration: 300,
                            onComplete: () => {
                                if (this.speedBoostEdgeEffect) {
                                    this.speedBoostEdgeEffect.destroy();
                                    this.speedBoostEdgeEffect = null;
                                }
                            },
                        });
                    }
                }
                break;

            case PowerUpType.SLOWER:
                this.speedMultiplier *= 2; // Double to reverse half
                // Stop slowing boost sound if it's still playing
                if (this.sounds.slowingBoost.isPlaying) {
                    this.sounds.slowingBoost.stop();
                }
                break;

            case PowerUpType.MAGNET:
                this.magnetActive = false;
                // Stop magnet sound if it's still playing
                if (this.sounds.magnet.isPlaying) {
                    this.sounds.magnet.stop();
                }
                break;

            case PowerUpType.SHIELD:
                this.shieldActive = false;
                // Stop shield sound if it's still playing
                if (this.sounds.shield.isPlaying) {
                    this.sounds.shield.stop();
                }
                // Destroy shield visual if it exists
                if (
                    this.activePowerUps[index].originalEffect instanceof
                    Phaser.GameObjects.Arc
                ) {
                    this.activePowerUps[index].originalEffect.destroy();
                }
                break;

            case PowerUpType.DOUBLE_POINTS:
                this.pointsMultiplier = 1;
                // Stop double points sound if it's still playing
                if (this.sounds.x2.isPlaying) {
                    this.sounds.x2.stop();
                }
                // Destroy particle emitter if it exists
                if (
                    this.activePowerUps[index].originalEffect instanceof
                    Phaser.GameObjects.Particles.ParticleEmitter
                ) {
                    this.activePowerUps[index].originalEffect.destroy();
                }
                break;
        }

        // Remove UI elements
        const powerUp = this.activePowerUps[index];

        // First check if we have UI elements to remove
        if (powerUp.icon) {
            this.powerUpContainer.remove(powerUp.icon, true);
            powerUp.icon.destroy();
        }

        if (powerUp.timerText) {
            this.powerUpContainer.remove(powerUp.timerText, true);
            powerUp.timerText.destroy();
        }

        // Find and remove the timer bar
        const children = this.powerUpContainer.getAll();
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (
                child instanceof Phaser.GameObjects.Image &&
                child.texture.key === "timer_bar" &&
                Math.abs(child.y - 38) < 1
            ) {
                this.powerUpContainer.remove(child, true);
                child.destroy();
                break;
            }
        }

        // Remove from active power-ups
        this.activePowerUps.splice(index, 1);

        // Reposition remaining power-up indicators
        this.repositionPowerUpIcons();

        // After removing the power-up, check if any power-ups remain
        if (this.activePowerUps.length === 0) {
            // Stop countdown sound if no power-ups are active
            if (this.sounds.countdown.isPlaying) {
                this.sounds.countdown.stop();
                this.countdownSoundActive = false;
            }
        }
    }

    private repositionPowerUpIcons() {
        // Update positions of remaining power-up indicators
        this.activePowerUps.forEach((powerUp, index) => {
            const yPos = index * 50;
            powerUp.icon.y = yPos;
            powerUp.timerText.y = yPos;
            if (powerUp.originalEffect) {
                powerUp.originalEffect.y = yPos; // Move background too
            }
        });
    }

    private applyMagnetEffect() {
        // Find all ingredients within range
        const ingredientsInRange = this.ingredients.filter((ingredient) => {
            const dx = this.cauldron.x - ingredient.image.x;
            const dy = this.cauldron.y - ingredient.image.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < this.magnetRange;
        });

        // If no ingredients in range, do nothing
        if (ingredientsInRange.length === 0) return;

        // Group nearby ingredients into clusters
        const clusters: any = [];
        const processed = new Set();

        // Process each ingredient that's not already in a cluster
        ingredientsInRange.forEach((ingredient: any, index) => {
            if (processed.has(index)) return;

            // Start new cluster with this ingredient
            const cluster = [ingredient];
            processed.add(index);

            // Find 1-2 more ingredients close to this one to form a cluster (2-3 total)
            let count = 0;
            for (let i = 0; i < ingredientsInRange.length && count < 2; i++) {
                if (processed.has(i) || i === index) continue;

                // Check if ingredients are close to each other (within 100px)
                const dx = ingredient.image.x - ingredientsInRange[i].image.x;
                const dy = ingredient.image.y - ingredientsInRange[i].image.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    cluster.push(ingredientsInRange[i]);
                    processed.add(i);
                    count++;
                }
            }

            // Add this cluster to our list
            if (cluster.length > 0) {
                clusters.push(cluster);
            }
        });

        // Now move each cluster toward the cauldron
        clusters.forEach((cluster: any) => {
            // If it's just one ingredient, move it directly
            if (cluster.length === 1) {
                const ingredient = cluster[0];
                const dx = this.cauldron.x - ingredient.image.x;
                const dy = this.cauldron.y - ingredient.image.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const speed =
                    Math.min(
                        1,
                        (this.magnetRange - distance) / this.magnetRange,
                    ) * 5;

                ingredient.image.x += dx * speed * 0.01;
                ingredient.image.y += dy * speed * 0.01;
                return;
            }

            // For clusters of 2-3, calculate center and move as a group
            let centerX = 0,
                centerY = 0;
            cluster.forEach((ingredient: any) => {
                centerX += ingredient.image.x;
                centerY += ingredient.image.y;
            });
            centerX /= cluster.length;
            centerY /= cluster.length;

            // Calculate movement direction toward cauldron
            const dxCenter = this.cauldron.x - centerX;
            const dyCenter = this.cauldron.y - centerY;
            const distance = Math.sqrt(
                dxCenter * dxCenter + dyCenter * dyCenter,
            );
            const speed =
                Math.min(1, (this.magnetRange - distance) / this.magnetRange) *
                5;

            // Move all ingredients in the cluster
            const moveX = dxCenter * speed * 0.01;
            const moveY = dyCenter * speed * 0.01;

            // Apply the same movement to all ingredients in cluster
            cluster.forEach((ingredient: any) => {
                ingredient.image.x += moveX;
                ingredient.image.y += moveY;
            });
        });
    }

    private showPowerUpMessage(message: string) {
        const powerUpName = message.split(" ")[0].toLowerCase();

        const iconMap: Record<string, string> = {
            speed: "speed_booster",
            slow: "slower_ingredient",
            magnet: "magnet",
            shield: "shield",
            double: "double_points",
        };

        const iconKey =
            Object.entries(iconMap).find(([key]) =>
                powerUpName.includes(key),
            )?.[1] || this.powerUpTypes[0];

        const container = this.add.container(this.cameras.main.centerX, 100);
        container.setDepth(1000);

        const glowCircle = this.add.circle(0, 50, 70, 0x3399ff, 0.7);
        container.add(glowCircle);

        const innerGlow = this.add.circle(0, 50, 50, 0xffffff, 0.4);
        container.add(innerGlow);

        const icon = this.add
            .image(0, 50, iconKey)
            .setDisplaySize(70, 70)
            .setOrigin(0.5);
        container.add(icon);

        const activatedText = this.add
            .text(0, 115, "ACTIVATED!", {
                fontSize: "18px",
                color: "#ffffff",
                fontFamily: "Helvetica, Arial, sans-serif",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5);
        container.add(activatedText);

        container.setScale(0);

        this.tweens.add({
            targets: container,
            scale: 1,
            duration: 400,
            ease: "Back.easeOut",
            onComplete: () => {
                this.tweens.add({
                    targets: [glowCircle, innerGlow],
                    scale: 1.1,
                    duration: 800,
                    yoyo: true,
                    repeat: 1,
                    ease: "Sine.easeInOut",
                });

                this.time.delayedCall(2000, () => {
                    this.tweens.add({
                        targets: container,
                        alpha: 0,
                        y: container.y - 40,
                        scale: 0.8,
                        duration: 400,
                        ease: "Back.easeIn",
                        onComplete: () => {
                            container.destroy();
                        },
                    });
                });
            },
        });
    }

    private getPowerUpName(type: PowerUpType): string {
        switch (type) {
            case PowerUpType.SPEED_BOOSTER:
                return "Speed Booster";
            case PowerUpType.SLOWER:
                return "Slow Motion";
            case PowerUpType.MAGNET:
                return "Magnet";
            case PowerUpType.SHIELD:
                return "Shield";
            case PowerUpType.DOUBLE_POINTS:
                return "Double Points";
            default:
                return "Power-Up";
        }
    }

    private increaseSpeed() {
        this.sounds.speedBoost.play();
        this.time.delayedCall(2000, () => {
            if (this.sounds.speedBoost.isPlaying) {
                this.sounds.speedBoost.stop();
            }
        });

        if (this.speedIncreaseCount < 2) {
            this.speedMultiplier *= 1.25;
        } else {
            this.speedMultiplier *= 1.15;
        }

        this.speedIncreaseCount++;

        // Increase spawn rate
        this.spawnDelay = Math.max(500, this.spawnDelay * 0.8);

        // *** INCREASE MUSIC SPEED WITH EACH SPEED BOOST ***
        // Gradually increase background music speed rate
        // Start from 1.0 and go up to 1.4 to match the gameplay speed increase
        // const maxMusicSpeed = 1.4;
        // const baseRate = 1.0;
        // const speedIncrement = 0.1; // increase by 10% each time

        // // Calculate new rate based on speed increases, but cap it at maxMusicSpeed
        // const newRate = Math.min(
        //     maxMusicSpeed,
        //     baseRate + this.speedIncreaseCount * speedIncrement,
        // );

        // // Apply the new playback rate (with a small transition)
        // if (this.sounds.backgroundMusic) {
        //     // Use a tween to smoothly transition the rate
        //     this.tweens.add({
        //         targets: this.sounds.backgroundMusic,
        //         rate: newRate,
        //         duration: 1000,
        //         ease: "Sine.easeInOut",
        //     });
        // }

        // Visual feedback - screen flash
        this.screenFlash.setAlpha(0.3);
        this.tweens.add({
            targets: this.screenFlash,
            alpha: 0,
            duration: 500,
        });

        // Recreate the spawn timer with new delay
        if (this.ingredientSpawnEvent) {
            this.ingredientSpawnEvent.remove();
        }

        this.ingredientSpawnEvent = this.time.addEvent({
            delay: this.spawnDelay,
            callback: this.spawnIngredient,
            callbackScope: this,
            loop: true,
        });

        // Show animated speed increase text
        this.showSpeedIncreaseMessage();

        // Schedule next speed increase
        let nextDelay = 10000;
        if (this.speedIncreaseCount === 1) {
            nextDelay = 15000;
        }

        if (!this.gameOver) {
            this.time.addEvent({
                delay: nextDelay,
                callback: this.increaseSpeed,
                callbackScope: this,
                loop: false,
            });
        }
    }

    // Show speed increase message with animation
    private showSpeedIncreaseMessage() {
        const text = this.add
            .text(
                this.cameras.main.centerX,
                this.cameras.main.centerY - 50,
                "Speed Up!",
                {
                    fontSize: "32px",
                    color: "#ffffff",
                    fontFamily: "Helvetica, Arial, sans-serif",
                    stroke: "#000000",
                    strokeThickness: 5,
                },
            )
            .setOrigin(0.5);

        this.sounds.speedUp.play();

        // Make text pulse and fade
        this.tweens.add({
            targets: text,
            scale: 1.5,
            duration: 200,
            ease: "Sine.easeOut",
            onComplete: () => {
                this.tweens.add({
                    targets: text,
                    scale: 1,
                    duration: 200,
                    ease: "Sine.easeIn",
                    delay: 200,
                    onComplete: () => {
                        this.tweens.add({
                            targets: text,
                            alpha: 0,
                            y: text.y - 30,
                            duration: 300,
                            delay: 400,
                            onComplete: () => {
                                text.destroy();
                            },
                        });
                    },
                });
            },
        });
    }

    // Animation for ingredient collection
    private animateIngredientCollection(ingredient: {
        image: GameObjects.Image;
        score: number;
        coinType?: string;
    }) {
        // Increment coin stats
        if (ingredient.coinType) {
            this.coinStats[ingredient.coinType]++;
        }

        // Create temporary emitter for collection effect
        const collectionEmitter = this.add.particles(
            ingredient.image.x,
            ingredient.image.y,
            "particle",
            {
                speed: { min: 100, max: 200 },
                scale: { start: 0.5, end: 0 },
                alpha: { start: 1, end: 0 },
                lifespan: 800,
                blendMode: "ADD",
                tint: this.getIngredientColor(ingredient.score),
            },
        );

        // Play sound & animations based on ingredient type
        if (ingredient.score >= 100) {
            this.sounds.superrareGathering.play();
            this.createSuperrareIngredientEffect();
        } else if (ingredient.score >= 50) {
            this.sounds.rareGathering.play();
            this.createRareIngredientEffect();
        } else {
            this.sounds.commonGathering.play();
            this.createCommonIngredientEffect();
        }

        // Explode particles
        collectionEmitter.explode(10);

        // Set a timer to destroy the emitter after particles fade
        this.time.delayedCall(800, () => {
            collectionEmitter.destroy();
        });

        // Show score popup text
        const scoreText = this.add
            .text(
                ingredient.image.x,
                ingredient.image.y,
                `+${ingredient.score * this.pointsMultiplier}`,
                {
                    fontSize: "20px",
                    color: this.getScoreTextColor(ingredient.score),
                    fontFamily: "Helvetica, Arial, sans-serif",
                    stroke: "#000000",
                    strokeThickness: 3,
                },
            )
            .setOrigin(0.5);

        // Make cauldron react
        this.tweens.add({
            targets: this.cauldron,
            scaleX: this.cauldron.scaleX * 1.1,
            scaleY: this.cauldron.scaleY * 1.1,
            duration: 100,
            yoyo: true,
        });

        // Animate score text
        this.tweens.add({
            targets: scoreText,
            y: scoreText.y - 50,
            alpha: 0,
            duration: 1000,
            ease: "Power1",
            onComplete: () => {
                scoreText.destroy();
            },
        });

        // Destroy the ingredient image with a nice animation
        this.tweens.add({
            targets: ingredient.image,
            alpha: 0,
            scale: 0.2,
            duration: 200,
            onComplete: () => {
                ingredient.image.destroy();
            },
        });
    }

    private createLightningEffect() {
        // Create lightning centered on the cauldron
        const lightning = this.add.sprite(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            "lightening",
        );

        const scaleX = this.cameras.main.width / lightning.width;
        const scaleY = this.cameras.main.height / lightning.height;
        const scale = Math.max(scaleX, scaleY) * 1.2;
        lightning.setScale(scale);

        // Set depth to ensure it appears above the cauldron
        lightning.setDepth(998);

        // Ensure full opacity
        lightning.setAlpha(1);

        // Play the animation
        lightning.play("lightning_anim");

        // Add a flash effect to the entire screen
        const flash = this.add
            .rectangle(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                this.cameras.main.width,
                this.cameras.main.height,
                0xffffff,
            )
            .setDepth(999)
            .setAlpha(0.6);

        // Create a pulsing effect for the lightning during the 3 seconds
        this.tweens.add({
            targets: lightning,
            alpha: 0.7,
            duration: 500,
            yoyo: true,
            repeat: 5, // Repeats for about 3 seconds total with yoyo
            ease: "Sine.easeInOut",
        });

        // Fade out the flash more quickly
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                flash.destroy();
            },
        });

        // Keep lightning visible for full 3 seconds, then fade out
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: lightning,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    lightning.destroy();
                },
            });
        });

        // When the lightning animation completes, destroy it
        lightning.on("animationcomplete", () => {
            lightning.destroy();
        });

        // Make cauldron react
        this.tweens.add({
            targets: this.cauldron,
            scaleX: this.cauldron.scaleX * 1.2,
            scaleY: this.cauldron.scaleY * 1.2,
            duration: 200,
            yoyo: true,
        });

        // Add camera shake for impact
        this.cameras.main.shake(200, 0.01);
    }

    private createMagnetEffect() {
        // Create magnet centered on the cauldron
        const magnet = this.add.sprite(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            "magnet_effect",
        );

        // const scaleX = this.cameras.main.width / magnet.width;
        // const scaleY = this.cameras.main.height / magnet.height;
        // const scale = Math.max(scaleX, scaleY) * 1.2;
        // magnet.setScale(scale);

        // Set depth to ensure it appears above the cauldron
        magnet.setDepth(998);

        // Ensure full opacity
        magnet.setAlpha(1);

        // Play the animation
        magnet.play("magnet_anim");

        // Add a flash effect to the entire screen
        const flash = this.add
            .rectangle(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                this.cameras.main.width,
                this.cameras.main.height,
                0xffffff,
            )
            .setDepth(999)
            .setAlpha(0.6);

        // Create a pulsing effect for the magnet during the 3 seconds
        this.tweens.add({
            targets: magnet,
            alpha: 0.7,
            duration: 500,
            yoyo: true,
            repeat: 5, // Repeats for about 3 seconds total with yoyo
            ease: "Sine.easeInOut",
        });

        // Fade out the flash more quickly
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                flash.destroy();
            },
        });

        // Keep lightning visible for full 3 seconds, then fade out
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: magnet,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    magnet.destroy();
                },
            });
        });

        // When the magnet animation completes, destroy it
        magnet.on("animationcomplete", () => {
            magnet.destroy();
        });

        // Make cauldron react
        this.tweens.add({
            targets: this.cauldron,
            scaleX: this.cauldron.scaleX * 1.2,
            scaleY: this.cauldron.scaleY * 1.2,
            duration: 200,
            yoyo: true,
        });

        // Add camera shake for impact
        this.cameras.main.shake(200, 0.01);
    }

    private createShieldEffect() {
        // Create shield centered on the cauldron
        const shield = this.add.sprite(
            this.cameras.main.centerX,
            this.cauldron.y - this.cauldron.height * 0.5,
            "shield_effect",
        );

        // Make it appropriately sized for the cauldron
        const scaleX = this.cameras.main.width / shield.width;
        const scaleY = this.cameras.main.height / shield.height;
        const scale = Math.max(scaleX, scaleY) * 1.2;
        shield.setScale(scale);

        // Set depth to ensure it appears above the cauldron
        shield.setDepth(998);

        // Ensure full opacity
        shield.setAlpha(1);

        // Play the animation
        shield.play("shield_anim");

        // Add a flash effect to the entire screen
        const flash = this.add
            .rectangle(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                this.cameras.main.width,
                this.cameras.main.height,
                0xffffff,
            )
            .setDepth(999)
            .setAlpha(0.6);

        // Create a pulsing effect for the shield during the 3 seconds
        this.tweens.add({
            targets: shield,
            alpha: 0.7,
            duration: 500,
            yoyo: true,
            repeat: 5, // Repeats for about 3 seconds total with yoyo
            ease: "Sine.easeInOut",
        });

        // Fade out the flash more quickly
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                flash.destroy();
            },
        });

        // Keep shield visible for full 3 seconds, then fade out
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: shield,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    shield.destroy();
                },
            });
        });

        // When the shield animation completes, destroy it
        shield.on("animationcomplete", () => {
            shield.destroy();
        });

        // Make cauldron react
        this.tweens.add({
            targets: this.cauldron,
            scaleX: this.cauldron.scaleX * 1.2,
            scaleY: this.cauldron.scaleY * 1.2,
            duration: 200,
            yoyo: true,
        });

        // Add camera shake for impact
        this.cameras.main.shake(200, 0.01);
    }

    private createSlowdownEffect() {
        // Create slowdown centered on the cauldron
        const slowdown = this.add.sprite(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            "slowdown_effect",
        );

        // Make it appropriately sized for the cauldron
        const scaleX = this.cameras.main.width / slowdown.width;
        const scaleY = this.cameras.main.height / slowdown.height;
        const scale = Math.max(scaleX, scaleY) * 0.7;
        slowdown.setScale(scale);

        // Set depth to ensure it appears above the cauldron
        slowdown.setDepth(998);

        // Ensure full opacity
        slowdown.setAlpha(1);

        // Play the animation
        slowdown.play("slowdown_anim");

        // Add a flash effect to the entire screen
        const flash = this.add
            .rectangle(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                this.cameras.main.width,
                this.cameras.main.height,
                0xffffff,
            )
            .setDepth(999)
            .setAlpha(0.6);

        // Create a pulsing effect for the slowdown during the 3 seconds
        this.tweens.add({
            targets: slowdown,
            alpha: 0.7,
            duration: 500,
            yoyo: true,
            repeat: 5, // Repeats for about 3 seconds total with yoyo
            ease: "Sine.easeInOut",
        });

        // Fade out the flash more quickly
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                flash.destroy();
            },
        });

        // Keep slowdown visible for full 3 seconds, then fade out
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: slowdown,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    slowdown.destroy();
                },
            });
        });

        // When the slowdown animation completes, destroy it
        slowdown.on("animationcomplete", () => {
            slowdown.destroy();
        });

        // Make cauldron react
        this.tweens.add({
            targets: this.cauldron,
            scaleX: this.cauldron.scaleX * 1.2,
            scaleY: this.cauldron.scaleY * 1.2,
            duration: 200,
            yoyo: true,
        });

        // Add camera shake for impact
        this.cameras.main.shake(200, 0.01);
    }

    private createCommonIngredientEffect() {
        // Create common_ingredient effect centered on the cauldron
        const commonIngredient = this.add.sprite(
            this.cauldron.x,
            this.cauldron.y - this.cauldron.height * 0.45,
            "common_ingredient_effect",
        );

        // Make it appropriately sized for the cauldron
        const scale = 0.4;
        commonIngredient.setScale(scale);

        // Set depth to ensure it appears above the cauldron
        commonIngredient.setDepth(this.cauldron.depth + 10);

        // Ensure full opacity
        commonIngredient.setAlpha(1);

        // Play the animation
        commonIngredient.play("common_ingredient_anim");

        // When the common_ingredient animation completes, destroy it
        commonIngredient.on("animationcomplete", () => {
            commonIngredient.destroy();
        });
    }

    private createRareIngredientEffect() {
        // Create rare_ingredient effect centered on the cauldron
        const rareIngredient = this.add.sprite(
            this.cauldron.x,
            this.cauldron.y - this.cauldron.height * 0.45,
            "rare_ingredient_effect",
        );

        // Make it appropriately sized for the cauldron
        const scale = 0.4;
        rareIngredient.setScale(scale);

        // Set depth to ensure it appears above the cauldron
        rareIngredient.setDepth(this.cauldron.depth + 10);

        // Ensure full opacity
        rareIngredient.setAlpha(1);

        // Play the animation
        rareIngredient.play("rare_ingredient_anim");

        // When the rare_ingredient animation completes, destroy it
        rareIngredient.on("animationcomplete", () => {
            rareIngredient.destroy();
        });
    }

    private createSuperrareIngredientEffect() {
        // Create superrare_ingredient effect centered on the cauldron
        const superrareIngredient = this.add.sprite(
            this.cauldron.x,
            this.cauldron.y - this.cauldron.height * 0.45,
            "superrare_ingredient_effect",
        );

        // Make it appropriately sized for the cauldron
        const scale = 0.4;
        superrareIngredient.setScale(scale);

        // Set depth to ensure it appears above the cauldron
        superrareIngredient.setDepth(this.cauldron.depth + 10);

        // Ensure full opacity
        superrareIngredient.setAlpha(1);

        // Play the animation
        superrareIngredient.play("superrare_ingredient_anim");

        // When the superrare_ingredient animation completes, destroy it
        superrareIngredient.on("animationcomplete", () => {
            superrareIngredient.destroy();
        });
    }

    // Animation for ingredient being destroyed (shield active)
    private animateIngredientDestroy(image: GameObjects.Image) {
        this.tweens.add({
            targets: image,
            alpha: 0,
            scaleX: 0,
            scaleY: 0,
            angle: 90,
            duration: 300,
            ease: "Back.easeIn",
        });

        this.sounds.ingredientCrash.play();
    }

    // Animation for game over
    private animateGameOver() {
        // Stop the countdown sound if it's playing
        if (this.sounds.countdown.isPlaying) {
            this.sounds.countdown.stop();
            this.countdownSoundActive = false;
        }

        // Camera shake effect
        this.cameras.main.shake(500, 0.02);

        // Flash screen
        this.screenFlash.setAlpha(0.7);
        this.tweens.add({
            targets: this.screenFlash,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                // Now transition to game over scene
                this.scene.start("GameOver", {
                    score: this.score,
                    coinStats: this.coinStats,
                });
            },
        });
        this.sounds.gameOver.play();
        this.sounds.congrats.play();
    }

    // Change cauldron texture based on active powerup
    private changeCauldronTexture(type: PowerUpType) {
        let textureKey = "cauldron"; // default

        switch (type) {
            case PowerUpType.SPEED_BOOSTER:
                textureKey = "cauldron-speed";
                break;
            case PowerUpType.SLOWER:
                textureKey = "cauldron-slow";
                break;
            case PowerUpType.SHIELD:
                textureKey = "cauldron-shield";
                break;
            case PowerUpType.DOUBLE_POINTS:
                textureKey = "cauldron-2x";
                break;
            case PowerUpType.MAGNET:
                textureKey = "cauldron-magnet";
                break;
        }

        // Change the texture with a smooth transition
        this.tweens.add({
            targets: this.cauldron,
            alpha: 0,
            duration: 150,
            onComplete: () => {
                this.cauldron.setTexture(textureKey);
                this.tweens.add({
                    targets: this.cauldron,
                    alpha: 1,
                    duration: 150,
                });
            },
        });
    }

    // Helper function to get color based on ingredient score
    private getIngredientColor(score: number): number {
        if (score >= 100) return 0xffff00; // Gold for super rare
        if (score >= 50) return 0xff00ff; // Purple for rare
        return 0x00ffff; // Blue for common
    }

    // Helper function to get text color based on score
    private getScoreTextColor(score: number): string {
        if (score >= 100) return "#ffff00"; // Gold for super rare
        if (score >= 50) return "#ff00ff"; // Purple for rare
        return "#00ffff"; // Blue for common
    }

    private createSpeedBoostEffect() {
        // First, remove any existing effect
        if (this.speedBoostEdgeEffect) {
            this.speedBoostEdgeEffect.destroy();
        }

        // Create a container to hold our edge effects
        const container = this.add.container(0, 0);
        container.setDepth(80);

        // Set the edge width and colors
        const edgeWidth = 80;
        const edgeColor = 0xff0000; // Red

        // Create four separate gradient graphics objects (one for each edge)
        const topEdge = this.createGradientRect(
            0,
            0,
            this.cameras.main.width,
            edgeWidth,
            edgeColor,
            true,
        );
        const bottomEdge = this.createGradientRect(
            0,
            this.cameras.main.height - edgeWidth,
            this.cameras.main.width,
            edgeWidth,
            edgeColor,
            false,
        );
        const leftEdge = this.createGradientRect(
            0,
            edgeWidth,
            edgeWidth,
            this.cameras.main.height - edgeWidth * 2,
            edgeColor,
            true,
            true,
        );
        const rightEdge = this.createGradientRect(
            this.cameras.main.width - edgeWidth,
            edgeWidth,
            edgeWidth,
            this.cameras.main.height - edgeWidth * 2,
            edgeColor,
            false,
            true,
        );

        // Add the edges to our container
        container.add([topEdge, bottomEdge, leftEdge, rightEdge]);

        // Store the container as our speed boost effect
        this.speedBoostEdgeEffect = container;

        // Create pulsing animation for all children in the container
        this.tweens.add({
            targets: container.getAll(),
            alpha: { from: 0.3, to: 0.9 },
            duration: 400,
            ease: "Sine.easeInOut",
            yoyo: true,
            repeat: -1,
        });

        // Find the current or soon-to-be-created speed boost power-up
        const speedBoosterIndex = this.activePowerUps.findIndex(
            (p) => p.type === PowerUpType.SPEED_BOOSTER,
        );

        if (speedBoosterIndex >= 0) {
            // If there's an existing power-up, update its originalEffect
            this.activePowerUps[speedBoosterIndex].originalEffect = container;
        } else {
            // If we're in the process of activating a new power-up,
            // we need to remember this effect to attach later
            this._pendingSpeedBoostEffect = container;
        }
    }

    // Helper method to create gradient rectangles
    private createGradientRect(
        x: number,
        y: number,
        width: number,
        height: number,
        color: number,
        fadeToBottom: boolean,
        isVertical: boolean = false,
    ): Phaser.GameObjects.Graphics {
        const graphics = this.add.graphics();
        const steps = isVertical ? width : height;
        const maxAlpha = 0.5; // Maximum opacity

        // Draw a gradient by using multiple rectangles with decreasing alpha
        for (let i = 0; i < steps; i++) {
            // Calculate alpha based on position
            const alpha = maxAlpha * (1 - i / steps);
            graphics.fillStyle(color, alpha);

            if (isVertical) {
                // For vertical edges (left/right)
                const xPos = fadeToBottom ? x + i : x + (width - i - 1);
                graphics.fillRect(xPos, y, 1, height);
            } else {
                // For horizontal edges (top/bottom)
                const yPos = fadeToBottom ? y + i : y + (height - i - 1);
                graphics.fillRect(x, yPos, width, 1);
            }
        }

        return graphics;
    }

    public stopAllSounds() {
        Object.values(this.sounds).forEach((sound) => {
            sound.stop();
        });
        this.countdownSoundActive = false;
    }

    // Add to the scene shutdown event
    shutdown() {
        this.stopAllSounds();
    }
}

