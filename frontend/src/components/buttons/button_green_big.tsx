import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import buttonGreenBig from "../../../public/assets/button_green_big.png";

interface ButtonGreenBigProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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

    &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }
`;

const BackgroundImage = styled.img`
    width: 100%;
    height: auto;
    display: block;
`;

const OverlayText = styled.span`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 1.2em;
    text-align: center;
    white-space: nowrap;

    @media (max-width: 768px) {
        font-size: 1em;
    }
`;

const ButtonGreenBig: React.FC<ButtonGreenBigProps> = ({
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
            <BackgroundImage src={buttonGreenBig} alt="Button background" />
            <OverlayText>{children}</OverlayText>
        </ButtonContainer>
    );
};

export default ButtonGreenBig;

