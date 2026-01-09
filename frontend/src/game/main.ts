import { Game } from "phaser";
import { GameOver } from "./scenes/GameOver";
import { GamePlay } from "./scenes/GamePlay";
import { Preloader } from "./scenes/Preloader";
import { Boot } from "./scenes/Boot";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: "game-container",
    backgroundColor: "#000000",
    scene: [Boot, Preloader, GamePlay, GameOver],
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;

