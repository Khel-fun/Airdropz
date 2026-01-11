import React, { useRef, useEffect } from "react";
import styled from "styled-components";

interface ButtonBigProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

const ButtonContainer = styled.button`
    position: relative;
    border: none;
    padding: 0;
    background: transparent;
    cursor: pointer;
    width: 100%;
    max-width: 300px;
    height: 60px; /* Fixed height for consistency */
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.1s;

    &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
        filter: grayscale(100%);
    }

    &:active {
        transform: translateY(4px);
    }
`;

const PixelButton = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #FFD700; /* Main yellow color */
    box-shadow: 
        inset 4px 4px 0px 0px #FFFFE0, /* Top-left highlight */
        inset -4px -4px 0px 0px #DAA520, /* Bottom-right shadow */
        4px 4px 0px 0px #000000; /* Drop shadow */
    
    /* Pixel corners effect using clip-path or pseudo-elements is complex, 
       using simple border-radius 0 and box-shadows for now. 
       For a true "cut corner" pixel look, we can use clip-path. */
    clip-path: polygon(
        0 10px, 
        10px 0, 
        calc(100% - 10px) 0, 
        100% 10px, 
        100% calc(100% - 10px), 
        calc(100% - 10px) 100%, 
        10px 100%, 
        0 calc(100% - 10px)
    );

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        box-shadow: inset 0 0 0 4px rgba(0,0,0,0.2); /* Inner border definition */
        pointer-events: none;
    }
`;

const OverlayText = styled.span`
    position: relative; /* Changed to relative to sit on top of the div */
    z-index: 1;
    color: white;
    font-family: 'Press Start 2P', cursive;
    font-size: 0.8em;
    text-align: center;
    white-space: nowrap;
    width: 100%;
    padding: 0 10px;
    text-shadow: 2px 2px 0 #000; /* Text shadow for better contrast */

    @media (max-width: 768px) {
        font-size: 0.7em;
    }
`;

const ButtonBig: React.FC<ButtonBigProps> = ({
    children,
    onClick,
    className,
    disabled,
    ...props
}) => {
    // Create a ref for the audio element
    const clickSound = useRef<HTMLAudioElement | null>(null);

    // Initialize the audio element on component mount
    useEffect(() => {
        clickSound.current = new Audio("/assets/music/click_.wav");
        clickSound.current.volume = 0.5; // Set volume to 50%

        // Clean up on unmount
        return () => {
            if (clickSound.current) {
                clickSound.current = null;
            }
        };
    }, []);

    // Custom click handler that plays sound before executing the provided onClick
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) return;

        // Play click sound
        if (clickSound.current) {
            // Reset the audio to start if it was already playing
            clickSound.current.currentTime = 0;

            // Play the sound
            clickSound.current.play().catch((error) => {
                console.log("Error playing click sound:", error);
            });
        }

        // Call the original onClick handler if provided
        if (onClick) {
            onClick(event);
        }
    };

    return (
        <ButtonContainer
            onClick={handleClick}
            className={className}
            disabled={disabled}
            {...props}
        >
            <PixelButton />
            <OverlayText>{children}</OverlayText>
        </ButtonContainer>
    );
};

export default ButtonBig;

