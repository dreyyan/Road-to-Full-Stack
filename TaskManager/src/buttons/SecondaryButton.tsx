interface SecondaryButtonProps {
    text: string;
    onClick?: () => void;
    disabled?: boolean;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({ text, onClick, disabled = false }) => {
    return (
        <button
            onClick={disabled ? undefined : onClick}
            className={`
                flex justify-center items-center

                w-[140px] h-[46px]
                mx-[2%] my-[1%]
                px-[2%] py-[1%]

                border-2
                rounded-lg

                border-[var(--accent-color2)]
                text-[var(--accent-color2)]

                dm-serif-display
                text-[20px]

                duration-200 ease-in-out

                transition
                hover:text-[var(--primary-background)]
                hover:bg-[var(--accent-color2)]

                cursor-pointer
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
        >
            <p className="text-xl">{text}</p>
        </button>
    );
}

export default SecondaryButton;