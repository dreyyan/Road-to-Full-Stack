import { useState } from "react";
import LetterBox from "./LetterBox";

const WordContainer = () => {
    const [word, setWord] = useState("");

    return (
        <div className="flex gap-x-2 my-10 bg-[var(--background)]">
            <LetterBox currentLetter="" state="none"/>
            <LetterBox currentLetter="" state="none"/>
            <LetterBox currentLetter="" state="none"/>
            <LetterBox currentLetter="" state="none"/>
            <LetterBox currentLetter="" state="none"/>
        </div>
    );
};

export default WordContainer;