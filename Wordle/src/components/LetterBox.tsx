import { useEffect, useState } from "react";

interface LetterBoxProps {
    currentLetter?: string;
    state?: "none" | "wrong" | "misplaced" | "correct";
};

const LetterBox: React.FC<LetterBoxProps> = ({ currentLetter = "", state = "none" }) => {
    const [letter, setLetter] = useState(currentLetter);

    // DEBUG: Display letter set in the letter box
    // useEffect(() => {
    //     console.log(`Letter set to '${letter}'`);
    // }, [letter]);

    return (
        <div className="w-12 h-14 rounded-xl bg-[var(--secondary)]">
            <input className="text-center font-semibold text-[var(--primary)] text-2xl w-full h-full border rounded-xl outline-none caret-transparent" type="text" onChange={(e) => setLetter(e.target.value.toUpperCase())} value={letter} maxLength={1}/>
        </div>
    );
};

export default LetterBox;