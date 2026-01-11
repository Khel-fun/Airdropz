import React from "react";

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}

function Button({
    children,
    onClick,
    className = "",
    disabled = false,
}: ButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`relative text-base font-bold tracking-wide uppercase ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
            style={{
                // background:
                //     "linear-gradient(to bottom, #FFE386, #F3B830, #DC8E03)",
                clipPath:
                    "polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)",
                boxShadow: `
                    /* Outer borders */
                    4px 4px 0 #9F4312,   /* bottom-right */
                    -4px -4px 0 #9F4312, /* top-left */
                    4px -4px 0 #9F4312,  /* top-right */
                    -4px 4px 0 #9F4312,  /* bottom-left */
                    /* Side borders */
                    0 4px 0 #9F4312,     /* bottom */
                    0 -4px 0 #9F4312,    /* top */
                    -4px 0 0 #9F4312,    /* left */
                    4px 0 0 #9F4312,     /* right */
                    /* Inner highlight effects */
                    inset 0 4px 0 rgba(0, 0, 0, 0),   /* top highlight */
                    inset 0 -4px 4px rgba(0, 0, 0, 0.3), /* bottom shadow */
                    inset 4px 0 4px rgba(255, 255, 255, 0.2), /* right highlight */
                    inset -4px 0 4px rgba(0, 0, 0, 0.2) /* left shadow */
                `,
                border: "none",
                color: "#733209",
                transition:
                    "transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out",
            }}
            // onMouseDown={(e) => {
            //     e.currentTarget.style.transform = "translateY(2px)";
            //     e.currentTarget.style.boxShadow = `
            //         2px 2px 0 #9F4312,
            //         -2px -2px 0 #9F4312,
            //         2px -2px 0 #9F4312,
            //         -2px 2px 0 #9F4312,
            //         0 2px 0 #9F4312,
            //         0 -2px 0 #9F4312,
            //         -2px 0 0 #9F4312,
            //         2px 0 0 #9F4312,
            //         inset 0 4px 0 #FFE386,
            //         inset 0 -4px 4px rgba(0, 0, 0, 0.3),
            //         inset 4px 0 4px rgba(255, 255, 255, 0.2),
            //         inset -4px 0 4px rgba(0, 0, 0, 0.2)
            //     `;
            // }}
            onMouseUp={(e) => {
                if (disabled) return;

                // Reset to normal state
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `
                    4px 4px 0 #9F4312,
                    -4px -4px 0 #9F4312,
                    4px -4px 0 #9F4312,
                    -4px 4px 0 #9F4312,
                    0 4px 0 #9F4312,
                    0 -4px 0 #9F4312,
                    -4px 0 0 #9F4312,
                    4px 0 0 #9F4312,
                    inset 0 4px 0 rgba(0, 0, 0, 0),
                    inset 0 -4px 4px rgba(0, 0, 0, 0.3),
                    inset 4px 0 4px rgba(255, 255, 255, 0.2),
                    inset -4px 0 4px rgba(0, 0, 0, 0.2)
                `;
            }}
            onMouseLeave={(e) => {
                if (disabled) return;

                // Ensure button returns to normal state if cursor leaves while pressed
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `
                    4px 4px 0 #9F4312,
                    -4px -4px 0 #9F4312,
                    4px -4px 0 #9F4312,
                    -4px 4px 0 #9F4312,
                    0 4px 0 #9F4312,
                    0 -4px 0 #9F4312,
                    -4px 0 0 #9F4312,
                    4px 0 0 #9F4312,
                    inset 0 4px 0 rgba(0, 0, 0, 0),
                    inset 0 -4px 4px rgba(0, 0, 0, 0.3),
                    inset 4px 0 4px rgba(255, 255, 255, 0.2),
                    inset -4px 0 4px rgba(0, 0, 0, 0.2)
                `;
            }}
            // Add touch support for mobile devices
            onTouchStart={(e) => {
                if (disabled) return;

                e.currentTarget.style.transform = "translateY(3px)";
                e.currentTarget.style.boxShadow = `
                    2px 2px 0 #9F4312,
                    -2px -2px 0 #9F4312,
                    2px -2px 0 #9F4312,
                    -2px 2px 0 #9F4312,
                    0 2px 0 #9F4312,
                    0 -2px 0 #9F4312,
                    -2px 0 0 #9F4312,
                    2px 0 0 #9F4312,
                    inset 0 2px 4px rgba(0, 0, 0, 0.4),
                    inset 0 -1px 1px rgba(0, 0, 0, 0.3),
                    inset 2px 0 2px rgba(255, 255, 255, 0.2),
                    inset -2px 0 2px rgba(0, 0, 0, 0.2)
                `;
            }}
            onTouchEnd={(e) => {
                if (disabled) return;

                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `
                    4px 4px 0 #9F4312,
                    -4px -4px 0 #9F4312,
                    4px -4px 0 #9F4312,
                    -4px 4px 0 #9F4312,
                    0 4px 0 #9F4312,
                    0 -4px 0 #9F4312,
                    -4px 0 0 #9F4312,
                    4px 0 0 #9F4312,
                    inset 0 4px 0 rgba(0, 0, 0, 0),
                    inset 0 -4px 4px rgba(0, 0, 0, 0.3),
                    inset 4px 0 4px rgba(255, 255, 255, 0.2),
                    inset -4px 0 4px rgba(0, 0, 0, 0.2)
                `;
            }}
        >
            <div className="relative z-10">{children}</div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#9F4312] opacity-20" />
        </button>
    );
}

export default Button;

