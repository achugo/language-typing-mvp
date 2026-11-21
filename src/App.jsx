import { useMemo, useState } from "react";
import {
  ACCURACY_THRESHOLD,
  ADVANCE_QUIZ_THRESHOLD,
  DATA,
  QUIZ_TRIGGER_WORDS,
  STORAGE_KEY
} from "./data";

const levelOrder = Object.keys(DATA);

const defaultState = {
  currentLevel: "A1",
  direction: "en-to-de",
  currentSentenceIndex: 0,
  learnedWords: [],
  pendingQuizWords: [],
  wordBank: {}
};

function normalizeText(text) {
  return text.trim().toLowerCase();
}

function calculateAccuracy(actual, expected) {
  const a = actual.trim();
  const e = expected.trim();
  const maxLength = Math.max(a.length, e.length);
  if (maxLength === 0) {
    return 100;
  }
  let matches = 0;
  const minLength = Math.min(a.length, e.length);
  for (let i = 0; i < minLength; i += 1) {
    if (a[i] === e[i]) {
      matches += 1;
    }
  }
  return (matches / maxLength) * 100;
}

function sanitizeState(rawState) {
  const merged = { ...defaultState, ...(rawState || {}) };
  if (!DATA[merged.currentLevel]) {
    merged.currentLevel = "A1";
  }
  if (!["en-to-de", "de-to-en"].includes(merged.direction)) {
    merged.direction = "en-to-de";
  }
  if (!Number.isInteger(merged.currentSentenceIndex) || merged.currentSentenceIndex < 0) {
    merged.currentSentenceIndex = 0;
  }
  if (!Array.isArray(merged.learnedWords)) {
    merged.learnedWords = [];
  }
  if (!Array.isArray(merged.pendingQuizWords)) {
    merged.pendingQuizWords = [];
  }
  if (!merged.wordBank || typeof merged.wordBank !== "object") {
    merged.wordBank = {};
  }
  return merged;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }
    return sanitizeState(JSON.parse(raw));
  } catch (error) {
    console.error("Could not load local state.", error);
    return defaultState;
  }
}

export default function App() {
  const [state, setState] = useState(() => loadState());
  const [typingInput, setTypingInput] = useState("");
  const [resultText, setResultText] = useState("");
  const [quizState, setQuizState] = useState({
    active: false,
    words: [],
    currentIndex: 0,
    correct: 0,
    feedback: "",
    answer: ""
  });

  const sentenceList = DATA[state.currentLevel];
  const safeIndex =
    state.currentSentenceIndex < sentenceList.length ? state.currentSentenceIndex : 0;
  const sentence = sentenceList[safeIndex];
  const isTypingGerman = state.direction === "en-to-de";

  const expectedText = isTypingGerman ? sentence.de : sentence.en;
  const promptLabel = isTypingGerman ? "English prompt" : "German prompt";
  const promptText = isTypingGerman ? sentence.en : sentence.de;
  const targetHint = isTypingGerman
    ? "Type the German translation exactly."
    : "Type the English translation exactly.";

  const canStartQuiz =
    isTypingGerman &&
    state.pendingQuizWords.length >= QUIZ_TRIGGER_WORDS &&
    !quizState.active;

  const quizCurrentWord = useMemo(() => {
    if (!quizState.active) {
      return null;
    }
    const key = quizState.words[quizState.currentIndex];
    return state.wordBank[key] || null;
  }, [quizState, state.wordBank]);

  function updateState(updater) {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      const sanitized = sanitizeState(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
      return sanitized;
    });
  }

  function resetForSentenceChange(nextPartial) {
    setTypingInput("");
    setResultText("");
    updateState((prev) => ({ ...prev, ...nextPartial }));
  }

  function handleDirectionChange(event) {
    resetForSentenceChange({
      direction: event.target.value,
      currentSentenceIndex: 0
    });
  }

  function handleLevelChange(event) {
    resetForSentenceChange({
      currentLevel: event.target.value,
      currentSentenceIndex: 0
    });
  }

  function handleSentenceChange(event) {
    resetForSentenceChange({
      currentSentenceIndex: Number(event.target.value)
    });
  }

  function pickRandomSentence() {
    const max = DATA[state.currentLevel].length;
    resetForSentenceChange({
      currentSentenceIndex: Math.floor(Math.random() * max)
    });
  }

  function submitTypingAttempt() {
    const actualText = typingInput.trim();
    if (!actualText) {
      setResultText("Please type a sentence first.");
      return;
    }

    const accuracy = calculateAccuracy(actualText, expectedText);
    const passed = accuracy >= ACCURACY_THRESHOLD;
    if (passed) {
      setResultText(`Great: ${accuracy.toFixed(1)}% accuracy.`);
    } else {
      setResultText(
        `Accuracy ${accuracy.toFixed(1)}%. Reach ${ACCURACY_THRESHOLD}% to count this attempt.`
      );
    }

    if (!passed || !isTypingGerman) {
      return;
    }

    updateState((prev) => {
      const learnedSet = new Set(prev.learnedWords);
      const pendingSet = new Set(prev.pendingQuizWords);
      const nextWordBank = { ...prev.wordBank };

      sentence.newWords.forEach((word) => {
        const key = normalizeText(word.de);
        if (!learnedSet.has(key)) {
          learnedSet.add(key);
          pendingSet.add(key);
          nextWordBank[key] = {
            de: word.de,
            en: word.en
          };
        }
      });

      return {
        ...prev,
        learnedWords: [...learnedSet],
        pendingQuizWords: [...pendingSet],
        wordBank: nextWordBank
      };
    });
  }

  function startQuiz() {
    if (!isTypingGerman) {
      setResultText("Switch to English → German mode to unlock advancement quiz.");
      return;
    }

    setQuizState({
      active: true,
      words: [...state.pendingQuizWords],
      currentIndex: 0,
      correct: 0,
      feedback: "",
      answer: ""
    });
  }

  function submitQuizAnswer() {
    if (!quizCurrentWord) {
      return;
    }
    const answer = normalizeText(quizState.answer);
    if (!answer) {
      setQuizState((prev) => ({ ...prev, feedback: "Please enter an answer." }));
      return;
    }

    const expected = normalizeText(quizCurrentWord.en);
    const isCorrect = answer === expected;
    const nextCorrect = quizState.correct + (isCorrect ? 1 : 0);
    const nextIndex = quizState.currentIndex + 1;

    if (nextIndex < quizState.words.length) {
      setQuizState((prev) => ({
        ...prev,
        currentIndex: nextIndex,
        correct: nextCorrect,
        feedback: isCorrect ? "Correct." : `Not quite. Expected: ${quizCurrentWord.en}`,
        answer: ""
      }));
      return;
    }

    const score = (nextCorrect / quizState.words.length) * 100;
    const passed = score >= ADVANCE_QUIZ_THRESHOLD;

    updateState((prev) => {
      if (!passed) {
        return prev;
      }
      const currentIdx = levelOrder.indexOf(prev.currentLevel);
      const nextLevel =
        currentIdx < 0 || currentIdx === levelOrder.length - 1
          ? null
          : levelOrder[currentIdx + 1];

      if (!nextLevel) {
        setResultText(
          `Quiz passed (${score.toFixed(1)}%). You already reached the highest level in this MVP.`
        );
        return { ...prev, pendingQuizWords: [] };
      }

      setTypingInput("");
      setResultText(
        `Quiz passed (${score.toFixed(1)}%). You advanced from ${prev.currentLevel} to ${nextLevel}.`
      );
      return {
        ...prev,
        currentLevel: nextLevel,
        currentSentenceIndex: 0,
        pendingQuizWords: []
      };
    });

    if (!passed) {
      setResultText(
        `Quiz score ${score.toFixed(1)}%. You need ${ADVANCE_QUIZ_THRESHOLD}% to advance. Keep practicing.`
      );
    }

    setQuizState({
      active: false,
      words: [],
      currentIndex: 0,
      correct: 0,
      feedback: "",
      answer: ""
    });
  }

  function cancelQuiz() {
    setQuizState({
      active: false,
      words: [],
      currentIndex: 0,
      correct: 0,
      feedback: "",
      answer: ""
    });
  }

  return (
    <main className="app">
      <header>
        <h1>Typing Language MVP (React + Vite)</h1>
        <p className="subtitle">
          Type meaningful A1/A2 German-English sentences. Advance only after accurate
          German typing and quiz success.
        </p>
      </header>

      <section className="panel controls">
        <div className="field">
          <label htmlFor="direction">Practice direction</label>
          <select id="direction" value={state.direction} onChange={handleDirectionChange}>
            <option value="en-to-de">English prompt → type German</option>
            <option value="de-to-en">German prompt → type English</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="level">Current level</label>
          <select id="level" value={state.currentLevel} onChange={handleLevelChange}>
            {levelOrder.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="sentence-index">Sentence</label>
          <select id="sentence-index" value={safeIndex} onChange={handleSentenceChange}>
            {sentenceList.map((_, idx) => (
              <option key={idx} value={idx}>
                #{idx + 1}
              </option>
            ))}
          </select>
        </div>

        <button type="button" onClick={pickRandomSentence}>
          Random sentence
        </button>
      </section>

      <section className="panel game">
        <h2>{promptLabel}</h2>
        <p className="prompt">{promptText}</p>
        <p className="hint">{targetHint}</p>

        <div className="field">
          <label htmlFor="typing-input">Type here</label>
          <textarea
            id="typing-input"
            rows={3}
            placeholder="Start typing..."
            value={typingInput}
            onChange={(event) => setTypingInput(event.target.value)}
          />
        </div>

        <div className="actions">
          <button type="button" onClick={submitTypingAttempt}>
            Check accuracy
          </button>
          <button type="button" onClick={() => setTypingInput("")}>
            Clear
          </button>
        </div>

        <p className="result">{resultText}</p>
      </section>

      <section className="panel progress">
        <h2>Progress</h2>
        <ul>
          <li>
            <strong>New words learned:</strong> {new Set(state.learnedWords).size}
          </li>
          <li>
            <strong>Pending quiz words:</strong> {state.pendingQuizWords.length}
          </li>
          <li>
            <strong>Advance rule:</strong> 90%+ quiz score on newly learned words (only
            after German typing mode)
          </li>
        </ul>
        <button type="button" onClick={startQuiz} disabled={!canStartQuiz}>
          Start quiz
        </button>
      </section>

      {quizState.active && quizCurrentWord && (
        <section className="panel quiz">
          <h2>New Words Quiz</h2>
          <p>
            Question {quizState.currentIndex + 1} of {quizState.words.length}
          </p>
          <p className="prompt">
            Translate this German word to English: {quizCurrentWord.de}
          </p>
          <div className="field">
            <label htmlFor="quiz-answer">Your answer</label>
            <input
              id="quiz-answer"
              type="text"
              value={quizState.answer}
              onChange={(event) =>
                setQuizState((prev) => ({ ...prev, answer: event.target.value }))
              }
            />
          </div>
          <div className="actions">
            <button type="button" onClick={submitQuizAnswer}>
              Submit answer
            </button>
            <button type="button" onClick={cancelQuiz}>
              Cancel quiz
            </button>
          </div>
          <p className="result">{quizState.feedback}</p>
        </section>
      )}
    </main>
  );
}
