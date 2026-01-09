import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { trackEvent } from "../../utils/analytics";

export class GameOver extends Scene {
    private finalScore: number;
    private coinStats: { [key: string]: number };

    constructor() {
        super("GameOver");
    }

    init(data: any) {
        this.finalScore = data.score;
        this.coinStats = data.coinStats || {
            bitcoin: 0,
            zcash: 0,
            ethereum: 0,
            usdc: 0,
            solana: 0,
        };
    }

    create() {
        // Set background color
        this.cameras.main.setBackgroundColor(0x2c283e);

        // Game Over image as full screen background
        const gameOverImage = this.add
            .image(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                "game-over",
            )
            .setOrigin(0.5);

        // Scale to cover full screen
        const scaleX = this.cameras.main.width / gameOverImage.width;
        const scaleY = this.cameras.main.height / gameOverImage.height;
        const scale = Math.max(scaleX, scaleY);
        gameOverImage.setScale(scale);

        gameOverImage.setAlpha(0);
        this.tweens.add({
            targets: gameOverImage,
            alpha: 1,
            duration: 800,
            ease: "Back.easeOut",
        });

        // Main container for all game over elements
        const container = this.add.container(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
        );

        // Back button (top left)
        this.createBackButton();

        // Score container with background image from score.png
        const scoreBg = this.add
            .image(0, 0, "score-bg")
            .setOrigin(0.5)
            .setAlpha(0);

        this.tweens.add({
            targets: scoreBg,
            alpha: 1,
            scale: { from: 0.8, to: 1 },
            duration: 800,
            delay: 300,
            ease: "Back.easeOut",
        });

        container.add(scoreBg);

        // Score text displayed on top of score.png in brown color
        const scoreText = this.add
            .text(0, 5, `${this.finalScore}`, {
                fontFamily: '"Jersey 25", "Jersey 20"',
                fontSize: "40px",
                color: "#90392E",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setAlpha(0);

        this.tweens.add({
            targets: scoreText,
            alpha: 1,
            scale: { from: 0.8, to: 1 },
            duration: 800,
            delay: 400,
            ease: "Back.easeOut",
        });

        container.add(scoreText);

        // Coin stats breakdown with background image (already contains coin logos)
        const breakdownBg = this.add
            .image(0, 160, "score-breakdown-bg")
            .setOrigin(0.5)
            .setAlpha(0);

        this.tweens.add({
            targets: breakdownBg,
            alpha: 1,
            scale: { from: 0.8, to: 1 },
            duration: 800,
            delay: 400,
            ease: "Back.easeOut",
        });

        container.add(breakdownBg);

        // Display coin counts on top of the breakdown background
        // Calculate responsive positions based on screen dimensions
        const baseY = 160; // Y position of breakdown background
        const bgWidth = this.scale.width * 0.85; // Approximate width of breakdown bg
        const bgHeight = 140; // Approximate height of breakdown bg

        // Row 1: Bitcoin (left), Zcash (right)
        const bitcoinCount = this.add
            .text(
                -bgWidth * 0.25,
                baseY + bgHeight * 0.22,
                `${String(this.coinStats.bitcoin || 0).padStart(2, "0")}`,
                {
                    fontFamily: '"Inclusive Sans"',
                    fontSize: "18px",
                    color: "#FFFFFF",
                    fontStyle: "bold",
                },
            )
            .setOrigin(0.5)
            .setAlpha(0);

        const zcashCount = this.add
            .text(
                bgWidth * 0.25,
                baseY + bgHeight * 0.22,
                `${String(this.coinStats.zcash || 0).padStart(2, "0")}`,
                {
                    fontFamily: '"Inclusive Sans"',
                    fontSize: "18px",
                    color: "#FFFFFF",
                    fontStyle: "bold",
                },
            )
            .setOrigin(0.5)
            .setAlpha(0);

        // Row 2: Ethereum (left), USDC (center), Solana (right)
        const ethereumCount = this.add
            .text(
                -bgWidth * 0.33,
                baseY + bgHeight * 0.52,
                `${String(this.coinStats.ethereum || 0).padStart(2, "0")}`,
                {
                    fontFamily: '"Inclusive Sans"',
                    fontSize: "18px",
                    color: "#FFFFFF",
                    fontStyle: "bold",
                },
            )
            .setOrigin(0.5)
            .setAlpha(0);

        const usdcCount = this.add
            .text(
                0,
                baseY + bgHeight * 0.52,
                `${String(this.coinStats.usdc || 0).padStart(2, "0")}`,
                {
                    fontFamily: '"Inclusive Sans"',
                    fontSize: "18px",
                    color: "#FFFFFF",
                    fontStyle: "bold",
                },
            )
            .setOrigin(0.5)
            .setAlpha(0);

        const solanaCount = this.add
            .text(
                bgWidth * 0.33,
                baseY + bgHeight * 0.52,
                `${String(this.coinStats.solana || 0).padStart(2, "0")}`,
                {
                    fontFamily: '"Inclusive Sans"',
                    fontSize: "18px",
                    color: "#FFFFFF",
                    fontStyle: "bold",
                },
            )
            .setOrigin(0.5)
            .setAlpha(0);

        container.add([
            bitcoinCount,
            zcashCount,
            ethereumCount,
            usdcCount,
            solanaCount,
        ]);

        // Animate coin counts
        this.tweens.add({
            targets: [
                bitcoinCount,
                zcashCount,
                ethereumCount,
                usdcCount,
                solanaCount,
            ],
            alpha: 1,
            duration: 600,
            delay: 500,
            ease: "Back.easeOut",
        });

        // Play Again Button using the SVG file
        const playBtnContainer = this.add.container(0, 300);

        const playButton = this.add
            .image(0, 0, "play-again-button")
            .setOrigin(0.5);

        playBtnContainer.add(playButton);

        // Make interactive
        const hitArea = this.add
            .zone(0, 0, 200, 50)
            .setRectangleDropZone(200, 50)
            .setInteractive({ useHandCursor: true });

        playBtnContainer.add(hitArea);
        container.add(playBtnContainer);

        playBtnContainer.setAlpha(0);
        this.tweens.add({
            targets: playBtnContainer,
            alpha: 1,
            scale: { from: 0.8, to: 1 },
            duration: 800,
            delay: 500,
            ease: "Back.easeOut",
        });

        hitArea.on("pointerdown", () => {
            trackEvent("Play Again", {
                score: this.finalScore,
            });
            this.scene.start("GamePlay");
        });

        hitArea.on("pointerover", () => {
            playBtnContainer.setScale(1.05);
        });
        hitArea.on("pointerout", () => {
            playBtnContainer.setScale(1);
        });

        // Emit event to notify React that the game is over
        EventBus.emit("update-score", { score: this.finalScore });

        // Emit current scene ready event
        EventBus.emit("current-scene-ready", this);
    }

    private createBackButton() {
        const backButton = this.add.container(60, 60);

        const backCircle = this.add.circle(0, 0, 22, 0x8b93ec, 0.2);
        const backArrow = this.add.graphics();
        backArrow.lineStyle(1.32, 0xb6b8ce);
        backArrow.beginPath();
        backArrow.moveTo(-4, 0);
        backArrow.lineTo(4, -6);
        backArrow.moveTo(-4, 0);
        backArrow.lineTo(4, 6);
        backArrow.strokePath();

        backButton.add([backCircle, backArrow]);
        backButton.setInteractive(
            new Phaser.Geom.Circle(0, 0, 22),
            Phaser.Geom.Circle.Contains,
        );
        backButton.on("pointerdown", () => {
            EventBus.emit("return-to-menu");
        });
    }
}

