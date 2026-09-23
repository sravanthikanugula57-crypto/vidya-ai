import { MockQuestion, UserAnswerState, MockAttempt } from '../types/mockTest';

export interface AnswerEvaluationResult {
  isAnswered: boolean;
  isCorrect: boolean;
  userOptionIndex: number | null;
  correctOptionIndex: number | null;
  displayUserAnswer: string;
  displayCorrectAnswer: string;
}

/**
 * Extracts standard option index (0 = A, 1 = B, 2 = C, 3 = D, etc.)
 * from various formats: numbers, digit strings, letters ("A", "B", "Option B", "(B)"), or matching option text.
 */
export function getOptionIndex(val: any, options?: string[]): number | null {
  if (val === null || val === undefined) return null;

  // 1. Direct number check
  if (typeof val === 'number') {
    if (Number.isInteger(val) && val >= 0) {
      if (!options || val < options.length) {
        return val;
      }
    }
  }

  const strVal = String(val).trim();
  if (strVal === '') return null;

  // 2. Numeric string (e.g. "0", "1", "2", "3")
  if (/^\d+$/.test(strVal)) {
    const num = parseInt(strVal, 10);
    if (!options || (num >= 0 && num < options.length)) {
      return num;
    }
  }

  // 3. Single option letter (e.g. "A", "b", "C", "D", "E")
  if (/^[a-e]$/i.test(strVal)) {
    const idx = strVal.toUpperCase().charCodeAt(0) - 65;
    if (!options || idx < options.length) {
      return idx;
    }
  }

  // 4. Option label pattern (e.g. "Option A", "Option 2", "Choice B", "(B)", "B.", "B)", "[B]")
  const letterMatch = strVal.match(/^(?:option\s*:?|choice\s*:?|\()?\s*([a-e])(?:\)|\.|\:)?$/i);
  if (letterMatch && letterMatch[1]) {
    const idx = letterMatch[1].toUpperCase().charCodeAt(0) - 65;
    if (!options || idx < options.length) {
      return idx;
    }
  }

  const numMatch = strVal.match(/^(?:option\s*:?|choice\s*:?)\s*(\d+)$/i);
  if (numMatch && numMatch[1]) {
    const idx = parseInt(numMatch[1], 10);
    // If 1-indexed (e.g. Option 1, Option 2), check bounds
    if (options && idx >= 1 && idx <= options.length) {
      return idx - 1;
    }
    if (options && idx >= 0 && idx < options.length) {
      return idx;
    }
  }

  // 5. Match actual option text inside options array
  if (options && options.length > 0) {
    const lowerVal = strVal.toLowerCase();
    const exactIdx = options.findIndex((opt) => opt && opt.trim().toLowerCase() === lowerVal);
    if (exactIdx !== -1) {
      return exactIdx;
    }

    // Match after stripping leading "A. ", "B. ", "(A) ", "A) "
    const cleanVal = lowerVal.replace(/^(?:\([a-e]\)|[a-e][\.\)\:\s])\s*/i, '').trim();
    const cleanIdx = options.findIndex((opt) => {
      if (!opt) return false;
      const cleanOpt = opt.trim().toLowerCase().replace(/^(?:\([a-e]\)|[a-e][\.\)\:\s])\s*/i, '').trim();
      return cleanOpt === cleanVal || cleanOpt === lowerVal || opt.trim().toLowerCase() === cleanVal;
    });
    if (cleanIdx !== -1) {
      return cleanIdx;
    }
  }

  return null;
}

/**
 * Normalizes boolean values from boolean, "true", "false", "T", "F", 1, 0, etc.
 */
export function normalizeBoolean(val: any): boolean | null {
  if (typeof val === 'boolean') return val;
  if (val === null || val === undefined) return null;
  const s = String(val).trim().toLowerCase();
  if (s === 'true' || s === 't' || s === 'yes' || s === 'y' || s === 'correct' || s === '1') return true;
  if (s === 'false' || s === 'f' || s === 'no' || s === 'n' || s === 'incorrect' || s === '0') return false;
  return null;
}

/**
 * Clean strings for safe comparison (removes zero-width chars, collapses spaces, lowercases).
 */
export function cleanStringForComparison(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Compare text answers handling whitespace, punctuation, numbers, and multiple slash-separated answers.
 */
export function compareTextAnswers(userAns: any, correctAns: any): boolean {
  const userClean = cleanStringForComparison(userAns);
  const correctClean = cleanStringForComparison(correctAns);

  if (userClean === '' || correctClean === '') return false;

  // Direct match
  if (userClean === correctClean) return true;

  // Numerical equivalence (e.g. "32" vs "32.0" or "12.5" vs "12.50")
  const userNum = parseFloat(userClean.replace(/[^0-9.-]/g, ''));
  const correctNum = parseFloat(correctClean.replace(/[^0-9.-]/g, ''));
  if (!isNaN(userNum) && !isNaN(correctNum) && userNum === correctNum) {
    const userOnlyNum = userClean.replace(/[^0-9.-]/g, '');
    const correctOnlyNum = correctClean.replace(/[^0-9.-]/g, '');
    if (userClean === userOnlyNum && correctClean === correctOnlyNum) {
      return true;
    }
  }

  // Handle slash / or comma / "or" separated accepted alternatives in correct answer
  if (correctClean.includes('/') || correctClean.includes(',') || /\bor\b/.test(correctClean)) {
    const parts = correctClean
      .split(/\/|,|\bor\b/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.some((p) => p === userClean)) {
      return true;
    }
  }

  // Strip trailing/leading punctuation
  const userStripped = userClean.replace(/^[.,\/#!$%\^&\*;:{}=\-_`~()]+|[.,\/#!$%\^&\*;:{}=\-_`~()]+$/g, '');
  const correctStripped = correctClean.replace(/^[.,\/#!$%\^&\*;:{}=\-_`~()]+|[.,\/#!$%\^&\*;:{}=\-_`~()]+$/g, '');
  if (userStripped.length > 0 && userStripped === correctStripped) {
    return true;
  }

  return false;
}

/**
 * Formats an answer value for human-readable display in the UI and Answer Key.
 */
export function formatDisplayAnswer(val: any, optIndex: number | null, options?: string[]): string {
  if (val === null || val === undefined || String(val).trim() === '') {
    return 'None (Skipped)';
  }

  if (optIndex !== null && optIndex >= 0 && options && options[optIndex]) {
    const letter = String.fromCharCode(65 + optIndex);
    return `${letter}. ${options[optIndex]}`;
  }

  if (options && typeof val === 'number' && val >= 0 && val < options.length) {
    const letter = String.fromCharCode(65 + val);
    return `${letter}. ${options[val]}`;
  }

  const boolVal = normalizeBoolean(val);
  if (boolVal !== null && typeof val === 'boolean') {
    return boolVal ? 'True' : 'False';
  }

  return String(val).trim();
}

/**
 * Universal evaluator for a single question response.
 */
export function evaluateQuestionAnswer(
  userAnswer: any,
  correctAnswer: any,
  options?: string[],
  questionType?: string
): AnswerEvaluationResult {
  const isAnswered = userAnswer !== null && userAnswer !== undefined && String(userAnswer).trim() !== '';

  const correctIdx = getOptionIndex(correctAnswer, options);

  if (!isAnswered) {
    return {
      isAnswered: false,
      isCorrect: false,
      userOptionIndex: null,
      correctOptionIndex: correctIdx,
      displayUserAnswer: 'None (Skipped)',
      displayCorrectAnswer: formatDisplayAnswer(correctAnswer, correctIdx, options)
    };
  }

  const qType = (questionType || '').toLowerCase();
  const hasOptions = Array.isArray(options) && options.length > 0;
  const isTrueFalse = qType === 'true_false' || qType === 'truefalse' || qType === 'tf' || qType === 'boolean';

  let isCorrect = false;
  let userIdx: number | null = null;

  // 1. Multiple Choice or Questions with Options
  if (hasOptions || qType === 'mcq') {
    userIdx = getOptionIndex(userAnswer, options);

    if (userIdx !== null && correctIdx !== null) {
      isCorrect = userIdx === correctIdx;
    } else {
      // Fallback text comparison
      const userText = userIdx !== null && options?.[userIdx] ? options[userIdx] : String(userAnswer);
      const correctText = correctIdx !== null && options?.[correctIdx] ? options[correctIdx] : String(correctAnswer);
      isCorrect = compareTextAnswers(userText, correctText);
    }
  } else if (isTrueFalse) {
    // 2. True / False
    const userBool = normalizeBoolean(userAnswer);
    const correctBool = normalizeBoolean(correctAnswer);

    if (userBool !== null && correctBool !== null) {
      isCorrect = userBool === correctBool;
    } else {
      isCorrect = cleanStringForComparison(userAnswer) === cleanStringForComparison(correctAnswer);
    }
  } else {
    // 3. Fill in the Blanks / Short / Essay
    isCorrect = compareTextAnswers(userAnswer, correctAnswer);
  }

  return {
    isAnswered: true,
    isCorrect,
    userOptionIndex: userIdx,
    correctOptionIndex: correctIdx,
    displayUserAnswer: formatDisplayAnswer(userAnswer, userIdx, options),
    displayCorrectAnswer: formatDisplayAnswer(correctAnswer, correctIdx, options)
  };
}

/**
 * Calculates complete result summary for all questions given student's answers.
 */
export function calculateMockTestResult(
  questions: MockQuestion[],
  answers: Record<number | string, UserAnswerState>,
  testDurationMinutes: number = 30,
  timeLeftSeconds: number = 0,
  totalMarksOverride?: number
) {
  let totalScore = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  const weakMap: Record<string, { total: number; wrong: number }> = {};
  const strongMap: Record<string, { total: number; correct: number }> = {};
  const evaluatedQuestions: {
    question: MockQuestion;
    evaluation: AnswerEvaluationResult;
    marksAwarded: number;
  }[] = [];

  const safeQuestions = Array.isArray(questions) ? questions : [];

  safeQuestions.forEach((q) => {
    if (!q) return;
    const qNum = q.questionNumber;
    const ansState = answers[qNum] || answers[String(qNum)];
    const chapter = q.chapter || 'General';

    if (!weakMap[chapter]) weakMap[chapter] = { total: 0, wrong: 0 };
    if (!strongMap[chapter]) strongMap[chapter] = { total: 0, correct: 0 };
    weakMap[chapter].total += 1;
    strongMap[chapter].total += 1;

    const evaluation = evaluateQuestionAnswer(
      ansState?.userAnswer,
      q.correctAnswer,
      q.options,
      q.type
    );

    let marksAwarded = 0;
    if (!evaluation.isAnswered) {
      skippedCount += 1;
    } else if (evaluation.isCorrect) {
      marksAwarded = q.marks || 1;
      totalScore += marksAwarded;
      correctCount += 1;
      strongMap[chapter].correct += 1;
    } else {
      wrongCount += 1;
      weakMap[chapter].wrong += 1;
    }

    evaluatedQuestions.push({
      question: q,
      evaluation,
      marksAwarded
    });
  });

  const totalQuestions = safeQuestions.length;
  const computedTotalMarks = safeQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);
  const totalMarks = totalMarksOverride || (computedTotalMarks > 0 ? computedTotalMarks : 20);
  const percentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;
  const attemptedCount = correctCount + wrongCount;
  const accuracy = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;
  const timeSpentSeconds = Math.max(0, testDurationMinutes * 60 - timeLeftSeconds);

  const weakChapters = Object.keys(weakMap).filter(
    (ch) => weakMap[ch].total > 0 && weakMap[ch].wrong / weakMap[ch].total >= 0.3
  );
  const strongChapters = Object.keys(strongMap).filter(
    (ch) => strongMap[ch].total > 0 && strongMap[ch].correct / strongMap[ch].total >= 0.6
  );

  return {
    totalScore,
    totalMarks,
    percentage: Number.isNaN(percentage) ? 0 : Number(percentage.toFixed(1)),
    accuracy: Number.isNaN(accuracy) ? 0 : Number(accuracy.toFixed(1)),
    totalQuestions,
    correctCount,
    wrongCount,
    skippedCount,
    attemptedCount,
    timeSpentSeconds,
    weakChapters,
    strongChapters,
    evaluatedQuestions
  };
}
