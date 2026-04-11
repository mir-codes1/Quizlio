import { z } from 'zod';

export const questionSchema = z
  .object({
    prompt: z.string().min(1, 'prompt is required'),
    questionType: z.enum(['single', 'multi'], {
      errorMap: () => ({ message: 'questionType must be "single" or "multi"' }),
    }),
    codeSnippet: z.string(),
    options: z.object({
      A: z.string().min(1),
      B: z.string().min(1),
      C: z.string().min(1),
      D: z.string().min(1),
      E: z.string().min(1),
      F: z.string().min(1),
    }),
    correctOptions: z
      .array(z.enum(['A', 'B', 'C', 'D', 'E', 'F']))
      .min(1),
    correctExplanation: z.string().min(1),
    optionExplanations: z.object({
      A: z.string().min(1),
      B: z.string().min(1),
      C: z.string().min(1),
      D: z.string().min(1),
      E: z.string().min(1),
      F: z.string().min(1),
    }),
    sourceTag: z.string().optional(),
  })
  .superRefine((q, ctx) => {
    if (q.questionType === 'single' && q.correctOptions.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['correctOptions'],
        message: 'single-type questions must have exactly 1 correct option',
      });
    }
    if (q.questionType === 'multi' && q.correctOptions.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['correctOptions'],
        message: 'multi-type questions must have 2 or more correct options',
      });
    }
  });

export const quizImportSchema = z.object({
  title: z.string().min(1, 'title is required'),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1, 'at least one question is required'),
});

export type QuizImportSchema = z.infer<typeof quizImportSchema>;
