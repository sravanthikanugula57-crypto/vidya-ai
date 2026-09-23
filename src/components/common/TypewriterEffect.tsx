import React, { useState, useEffect, startTransition } from "react";

interface TypewriterEffectProps {
  staticText?: string;
  words?: string[];
  typeMode?: "letter" | "word";
  speed?: number;
  eraseSpeed?: number;
  delay?: number;
  cursor?: boolean;
  cursorCharacter?: string;
  cursorColor?: string;
  staticClassName?: string;
  animatedClassName?: string;
  className?: string;
}

export const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
  staticText = "",
  words = ["Class 10 AP Board", "Mathematics & Science", "Public Board Prep", "Interactive AI Tutoring"],
  typeMode = "letter",
  speed = 90,
  eraseSpeed = 45,
  delay = 1800,
  cursor = true,
  cursorCharacter = "|",
  cursorColor = "#38bdf8",
  staticClassName = "text-white font-extrabold",
  animatedClassName = "text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 font-black",
  className = ""
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      startTransition(() => setBlink((prev) => !prev));
    }, 500);
    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    if (!words || words.length === 0) return;
    if (wordIndex >= words.length) return;
    const currentWord = words[wordIndex];

    if (typeMode === "word") {
      if (!isDeleting) {
        if (displayedText !== currentWord) {
          const timeout = setTimeout(() => {
            startTransition(() => {
              setDisplayedText(currentWord);
              setIndex(currentWord.length);
            });
          }, speed);
          return () => clearTimeout(timeout);
        } else {
          const timeout = setTimeout(() => {
            startTransition(() => setIsDeleting(true));
          }, delay);
          return () => clearTimeout(timeout);
        }
      } else {
        const timeout = setTimeout(() => {
          startTransition(() => {
            setDisplayedText("");
            setIndex(0);
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
          });
        }, eraseSpeed);
        return () => clearTimeout(timeout);
      }
    } else {
      if (!isDeleting && index < currentWord.length) {
        const timeout = setTimeout(() => {
          startTransition(() => {
            setDisplayedText((prev) => prev + currentWord[index]);
            setIndex(index + 1);
          });
        }, speed);
        return () => clearTimeout(timeout);
      } else if (isDeleting && index > 0) {
        const timeout = setTimeout(() => {
          startTransition(() => {
            setDisplayedText((prev) => prev.slice(0, -1));
            setIndex(index - 1);
          });
        }, eraseSpeed);
        return () => clearTimeout(timeout);
      } else if (!isDeleting && index === currentWord.length) {
        const timeout = setTimeout(() => {
          startTransition(() => setIsDeleting(true));
        }, delay);
        return () => clearTimeout(timeout);
      } else if (isDeleting && index === 0) {
        startTransition(() => {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        });
      }
    }
  }, [
    index,
    isDeleting,
    wordIndex,
    words,
    typeMode,
    speed,
    eraseSpeed,
    delay,
    displayedText,
  ]);

  return (
    <div className={`inline-block ${className}`}>
      {staticText && <span className={staticClassName}>{staticText} </span>}
      <span className={animatedClassName}>{displayedText}</span>
      {cursor && (
        <span
          style={{ opacity: blink ? 1 : 0, color: cursorColor }}
          className="ml-0.5 inline-block font-mono font-bold"
          aria-hidden="true"
        >
          {cursorCharacter || "|"}
        </span>
      )}
    </div>
  );
};
