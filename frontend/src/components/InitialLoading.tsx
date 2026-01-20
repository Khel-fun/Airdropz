import React, { useState, useEffect } from "react";

const InitialLoading: React.FC = () => {
    const [currentFrame, setCurrentFrame] = useState(1);
    const [rotation, setRotation] = useState(0);
    const totalFrames = 4;

    useEffect(() => {
        const interval = setInterval(() => {
            setRotation((prev) => prev + 90);
            setTimeout(() => {
                setCurrentFrame((prev) => (prev >= totalFrames ? 1 : prev + 1));
            }, 150); // Delay frame change slightly after rotation starts
        }, 300); // Change every 300ms

        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className="flex flex-col items-center justify-center h-screen bg-cover bg-no-repeat relative"
            style={{
                backgroundImage: "url('/assets/login_bg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "100vw",
                height: "100vh",
            }}
        >
            <div className="flex flex-col items-center justify-center absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2">
                {/* Loading spinner */}
                <div className="mb-3">
                    <img
                        src={`/assets/loading/loading-${currentFrame}.svg`}
                        alt="Loading"
                        className="w-12 h-12 object-contain transition-transform duration-150 ease-linear"
                        style={{ transform: `rotate(${rotation}deg)` }}
                    />
                </div>

                {/* Loading text */}
                <div
                    className="text-white text-xl font-normal tracking-[0.3em]"
                    style={{ fontFamily: '"Jersey 20", sans-serif' }}
                >
                    LOADING
                </div>
            </div>
        </div>
    );
};

export default InitialLoading;

