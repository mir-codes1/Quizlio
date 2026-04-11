export interface Quiz {
  id: number;
  title: string;
  description: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  questionCount: number;
}

export interface Question {
  id: number;
  quizId: number;
  orderIndex: number;
  prompt: string;
  questionType: 'single' | 'multi';
  codeSnippet: string | null;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  optionF: string;
  correctOptions: string[];
  correctExplanation: string;
  explanationA: string;
  explanationB: string;
  explanationC: string;
  explanationD: string;
  explanationE: string;
  explanationF: string;
  sourceTag: string | null;
}

export interface QuizWithQuestions extends Quiz {
  questions: Question[];
}

// localStorage completion record
export interface CompletionRecord {
  completed: boolean;
  score: number;
  total: number;
  completedAt: string;
}
