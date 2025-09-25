import LetterBox from "./components/LetterBox";
import WordContainer from "./components/WordContainer";

const API_URL = 'https://darkermango.github.io/5-Letter-words/words.json';

const App = () => {
    // [ FUNCTION ]: Get a random word from the API endpoint
    const getWord = async () => {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();

            // Get a random word from the list of 5-letter words
            const word = data.words[Math.floor(Math.random() * data.words.length)];
            console.log(`Random Word: ${word}`);
        } catch (error) {
            console.log(`Error fetching data: ${error}`)
        }
    };

    // Once the website loads, get a random word
    // useEffect(() => {
    //     getWord();
    // }, []);

    return (
        <div className="flex flex-col items-center w-screen h-screen p-16 bg-[var(--background)]">
            <h1 className="text-6xl font-bold text-[var(--primary)]">Wordle</h1>
            <div className="bg-[var(--background)] h-[70%] px-4 py-6 rounded-xl">
                <WordContainer/>
                <WordContainer/>
                <WordContainer/>
                <WordContainer/>
                <WordContainer/>
                <WordContainer/>
            </div>
        </div>
    );
};

export default App;