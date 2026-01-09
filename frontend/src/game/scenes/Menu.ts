import { Scene, GameObjects } from "phaser";
import { EventBus } from "../EventBus";

export class Menu extends Scene {
    private background: GameObjects.Image;
    private title: GameObjects.Text;

    constructor() {
        super("Menu");
    }

    create() {
        // Set the background image
        this.background = this.add
            .image(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                "main-menu",
            )
            .setOrigin(0.5)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Add the Play button
        const playButton = this.createButton(
            this.cameras.main.centerX,
            450,
            "PLAY",
            36,
            { x: 10, y: 5 },
        );

        // Add the Play button
        const farmingButton = this.createButton(
            this.cameras.main.centerX - 70,
            520,
            "START FARMING",
            15,
            { x: 5, y: 3 },
        );

        // Add the Play button
        const claimButton = this.createButton(
            this.cameras.main.centerX + 70,
            520,
            "CLAIM GEMS",
            15,
            { x: 5, y: 3 },
        );

        // Add responsive icons for Market, Eonians, Tasks, Alchemist
        const iconSpacing = this.cameras.main.width / 5; // Space icons evenly
        const marketIcon = this.addIcon(iconSpacing, 600, "market");
        const eoniansIcon = this.addIcon(iconSpacing * 2, 600, "eonians");
        const tasksIcon = this.addIcon(iconSpacing * 3, 600, "tasks");
        const alchemistIcon = this.addIcon(iconSpacing * 4, 600, "alchemist");

        // Button interaction
        playButton.on("pointerdown", () => {
            this.scene.start("GamePlay"); // Transition to GamePlay scene
        });

        // Icon interactions
        marketIcon.setInteractive().on("pointerdown", () => {
            this.scene.start("Market"); 
        });

        eoniansIcon.setInteractive().on("pointerdown", () => {
            this.scene.start("Eonians"); 
        });

        tasksIcon.setInteractive().on("pointerdown", () => {
            this.scene.start("Tasks");
        });

        alchemistIcon.setInteractive().on("pointerdown", () => {
            this.scene.start("Profile"); 
        });
    }

    private createButton(
        x: number,
        y: number,
        text: string,
        fontSize: number = 18,
        padding: { x: number; y: number } = { x: 10, y: 5 },
    ): GameObjects.Text {
        const button = this.add
            .text(x, y, text, {
                fontFamily: "Arial",
                fontSize: `${fontSize}px`,
                color: "#000",
                backgroundColor: "#ffcc00",
                padding: padding,
                align: "center",
            })
            .setOrigin(0.5)
            .setInteractive();

        button.on("pointerover", () => {
            button.setStyle({ fill: "#ff0" });
        });

        button.on("pointerout", () => {
            button.setStyle({ fill: "#000" });
        });

        return button;
    }

    private addIcon(x: number, y: number, key: string): GameObjects.Image {
        return this.add.image(x, y, key).setOrigin(0.5).setDisplaySize(64, 64); // Adjust size as needed
    }
}

