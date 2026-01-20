import { useEffect, useRef, useState } from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { MainMenu } from "./game/scenes/MainMenu";
import LoginPage from "./components/LoginPage";
import { useWalletContext } from "./context/WalletContext";
import Loading from "./components/Loading";
import Menu from "./components/Menu";
import Profile from "./components/Profile";
import Eonians from "./components/Eonains";
import { EventBus } from "./game/EventBus";
import GameScoreManager from "./components/manager/GameScoreManager";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Tasks from "./components/Tasks";
import {
    initAnalytics,
    trackPageView,
    setUserProfile,
} from "./utils/analytics";
import { useAccount, useDisconnect } from "wagmi";
import LeaderBoard from "./components/leaderboard/LeaderBoard";
import { sdk } from "@farcaster/miniapp-sdk";
import InitialLoading from "./components/InitialLoading";

function App() {
    // The sprite can only be moved in the MainMenu Scene
    const [canMoveSprite, setCanMoveSprite] = useState(true);
    const { isLoggedIn } = useWalletContext();
    const [displayScene, setDisplayScene] = useState("menu");
    const { address } = useAccount();
    const { disconnect } = useDisconnect();
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });

    const backgroundMusic = useRef<HTMLAudioElement | null>(null);

    // Initialize analytics once when the app loads
    useEffect(() => {
        initAnalytics();
    }, []);

    // Handle initial loading - preload assets and show loading screen
    useEffect(() => {
        const loadAssets = async () => {
            const minLoadTime = 2000; // Minimum 2 seconds loading
            const startTime = Date.now();

            // Preload critical images
            const imagesToPreload = [
                "/assets/login_bg.png",
                "/assets/loading/loading-1.svg",
                "/assets/loading/loading-2.svg",
                "/assets/loading/loading-3.svg",
                "/assets/loading/loading-4.svg",
            ];

            const imagePromises = imagesToPreload.map((src) => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = resolve;
                    img.onerror = resolve; // Resolve even on error to not block loading
                    img.src = src;
                });
            });

            await Promise.all(imagePromises);

            // Ensure minimum loading time for smooth UX
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime < minLoadTime) {
                await new Promise((resolve) =>
                    setTimeout(resolve, minLoadTime - elapsedTime),
                );
            }

            setIsInitialLoading(false);
        };

        loadAssets();
    }, []);

    // Initialize Farcaster Mini App SDK
    useEffect(() => {
        const initMiniApp = async () => {
            try {
                await sdk.actions.ready();
            } catch (error) {
                // SDK not available - running in standalone mode
            }
        };

        initMiniApp();
    }, []);

    useEffect(() => {
        const handleBeforeUnload = () => {
            disconnect();

            localStorage.clear();
            sessionStorage.clear();
            console.log("Storage cleared before page reload");
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        if (!backgroundMusic.current) {
            backgroundMusic.current = new Audio(
                "/assets/music/eonian page_.mp3",
            );
            backgroundMusic.current.loop = true;
            backgroundMusic.current.volume = 0.2;
        }

        if (displayScene === "gameplay") {
            if (backgroundMusic.current) {
                try {
                    const music = backgroundMusic.current;
                    music.pause();
                    music.currentTime = 0;

                    if (
                        !navigator.userAgent.match(/iPhone|iPad|iPod|Android/i)
                    ) {
                        const fadeOutInterval = setInterval(() => {
                            if (music.volume > 0.02) {
                                music.volume -= 0.02;
                            } else {
                                music.pause();
                                music.volume = 0.2;
                                music.currentTime = 0;
                                clearInterval(fadeOutInterval);
                            }
                        }, 50);
                        return () => clearInterval(fadeOutInterval);
                    } else {
                        music.pause();
                        music.currentTime = 0;
                    }
                } catch (e) {
                    console.error("Failed to stop background music:", e);
                }
            }
        } else {
            if (backgroundMusic.current && backgroundMusic.current.paused) {
                try {
                    backgroundMusic.current.volume = 0.2;

                    const playPromise = backgroundMusic.current.play();

                    if (playPromise !== undefined) {
                        playPromise.catch((error) => {
                            console.log("Music autoplay prevented:", error);
                        });
                    }
                } catch (e) {
                    console.error("Failed to play background music:", e);
                }
            }
        }

        if (window.Telegram?.WebApp) {
            if (displayScene === "gameplay" && backgroundMusic.current) {
                try {
                    backgroundMusic.current.pause();
                    backgroundMusic.current.currentTime = 0;
                } catch (e) {
                    console.error(
                        "Failed to stop music in Telegram WebApp:",
                        e,
                    );
                }
            }
        }
    }, [displayScene]);

    // Cleanup audio on component unmount
    useEffect(() => {
        return () => {
            if (backgroundMusic.current) {
                backgroundMusic.current.pause();
                backgroundMusic.current.currentTime = 0;
                backgroundMusic.current = null;
            }
        };
    }, []);

    // Add user interaction handler to enable audio on first click (for mobile)
    const handleUserInteraction = () => {
        if (
            backgroundMusic.current &&
            backgroundMusic.current.paused &&
            displayScene !== "gameplay"
        ) {
            backgroundMusic.current.play().catch((error) => {
                console.log("Failed to play audio:", error);
            });
        }
    };

    // Track user identity when wallet connects
    useEffect(() => {
        if (address && isLoggedIn) {
            setUserProfile(address);
        }
    }, [address, isLoggedIn]);

    // Track page views when display scene changes
    useEffect(() => {
        if (displayScene && isLoggedIn) {
            trackPageView(displayScene);
        }
    }, [displayScene, isLoggedIn]);

    const startGame = () => {
        setDisplayScene("gameplay");
        if (phaserRef.current) {
            phaserRef.current.game!.scene.start("GamePlay"); // Start the gameplay scene
        }
    };

    const navigateToScene = (scene: string) => {
        if (scene === "gameplay" && backgroundMusic.current) {
            try {
                backgroundMusic.current.pause();
                backgroundMusic.current.currentTime = 0;

                backgroundMusic.current.volume = 0.2;
            } catch (e) {
                console.error("Failed to stop music during navigation:", e);
            }
        } else if (
            displayScene === "gameplay" &&
            scene !== "gameplay" &&
            backgroundMusic.current
        ) {
            try {
                backgroundMusic.current.currentTime = 0;
                backgroundMusic.current.volume = 0.2;

                backgroundMusic.current.play().catch((error) => {
                    console.log("Failed to resume music:", error);
                });
            } catch (e) {
                console.error("Failed to restart music:", e);
            }
        }

        setDisplayScene(scene);
    };

    useEffect(() => {
        const handleGoToProfile = () => {
            setDisplayScene("profile");
        };

        const handleGoToEonians = () => {
            setDisplayScene("eonians");
        };

        const handleGoToTasks = () => {
            setDisplayScene("tasks");
        };

        const handleReturnToMenu = () => {
            setDisplayScene("menu");
        };

        EventBus.on("profile", handleGoToProfile); // Listen for the event
        EventBus.on("eonians", handleGoToEonians);
        EventBus.on("tasks", handleGoToTasks);
        EventBus.on("return-to-menu", handleReturnToMenu);

        return () => {
            EventBus.off("profile", handleGoToProfile); // Clean up the event listener
            EventBus.off("eonians", handleGoToEonians);
            EventBus.off("tasks", handleGoToTasks);
            EventBus.off("return-to-menu", handleReturnToMenu);
        };
    }, []);

    const changeScene = () => {
        if (phaserRef.current) {
            const scene = phaserRef.current.scene as MainMenu;

            if (scene) {
                scene.changeScene();
            }
        }
    };

    const moveSprite = () => {
        if (phaserRef.current) {
            const scene = phaserRef.current.scene as MainMenu;

            if (scene && scene.scene.key === "MainMenu") {
                // Get the update logo position
                scene.moveLogo(({ x, y }) => {
                    setSpritePosition({ x, y });
                });
            }
        }
    };

    const addSprite = () => {
        if (phaserRef.current) {
            const scene = phaserRef.current.scene;

            if (scene) {
                // Add more stars
                const x = Phaser.Math.Between(64, scene.scale.width - 64);
                const y = Phaser.Math.Between(64, scene.scale.height - 64);

                //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
                const star = scene.add.sprite(x, y, "star");

                //  ... which you can then act upon. Here we create a Phaser Tween to fade the star sprite in and out.
                //  You could, of course, do this from within the Phaser Scene code, but this is just an example
                //  showing that Phaser objects and systems can be acted upon from outside of Phaser itself.
                scene.add.tween({
                    targets: star,
                    duration: 500 + Math.random() * 1000,
                    alpha: 0,
                    yoyo: true,
                    repeat: -1,
                });
            }
        }
    };

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {
        setCanMoveSprite(scene.scene.key !== "MainMenu");
    };

    return (
        <div id="app" onClick={handleUserInteraction}>
            <GameScoreManager />
            {isInitialLoading ? (
                <InitialLoading />
            ) : !isLoggedIn ? (
                <LoginPage />
            ) : (
                <>
                    {displayScene === "loading" && <Loading />}
                    {displayScene === "menu" && (
                        <Menu
                            onStartGame={startGame}
                            navigateToScene={navigateToScene}
                        />
                    )}
                    {displayScene === "profile" && (
                        <Profile navigateToScene={navigateToScene} />
                    )}
                    {displayScene === "tasks" && (
                        <Tasks navigateToScene={navigateToScene} />
                    )}
                    {displayScene === "gameplay" && (
                        <>
                            <PhaserGame
                                ref={phaserRef}
                                currentActiveScene={currentScene}
                            />
                        </>
                    )}
                    {displayScene === "eonians" && (
                        <Eonians navigateToScene={navigateToScene} />
                    )}
                    {displayScene === "leaderboard" && (
                        <LeaderBoard navigateToScene={navigateToScene} />
                    )}

                    {/* <div>
                    <div>
                        <Button className="Button" onClick={changeScene}>Change Scene</Button>
                    </div>
                    <div>
                        <Button disabled={canMoveSprite} className="Button" onClick={moveSprite}>Toggle Movement</Button>
                    </div>
                    <div className="spritePosition">Sprite Position:
                        <pre>{`{\n  x: ${spritePosition.x}\n  y: ${spritePosition.y}\n}`}</pre>
                    </div>
                    <div>
                        <Button className="Button" onClick={addSprite}>Add New Sprite</Button>
                    </div>
                </div> */}
                </>
            )}
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
                limit={1}
            />
        </div>
    );
}

export default App;

