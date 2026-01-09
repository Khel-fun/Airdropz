import { Scene } from "phaser";

export class Boot extends Scene {
    constructor() {
        super("Boot");
    }

    preload() {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        this.load.setPath("assets");

        this.load.image("loading_bg", "login_bg.png");
        this.load.image("progress_container", "place for progress.png");

        // Load animated loading icons for Preloader
        this.load.svg("loading-1", "loading/loading-1.svg");
        this.load.svg("loading-2", "loading/loading-2.svg");
        this.load.svg("loading-3", "loading/loading-3.svg");
        this.load.svg("loading-4", "loading/loading-4.svg");

        // Load animated loading icons for Preloader
        this.load.svg("loading-1", "loading/loading-1.svg");
        this.load.svg("loading-2", "loading/loading-2.svg");
        this.load.svg("loading-3", "loading/loading-3.svg");
        this.load.svg("loading-4", "loading/loading-4.svg");
    }

    create() {
        this.scene.start("Preloader");
    }
}

