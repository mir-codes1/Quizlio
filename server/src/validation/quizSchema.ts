import { z } from 'zod';

export const QuestionSchema = z
  .object({
    prompt: z.string().min(1, 'prompt is required'),
    questionType: z.enum(['single', 'multi'], {
      errorMap: () => ({ message: 'questionType must be "single" or "multi"' }),
    }),
    codeSnippet: z.string(),
    options: z.object({
      A: z.string().min(1, 'option A is required'),
      B: z.string().min(1, 'option B is required'),
      C: z.string().min(1, 'option C is required'),
      D: z.string().min(1, 'option D is required'),
      E: z.string().min(1, 'option E is required'),
      F: z.string().min(1, 'option F is required'),
    }),
    correctOptions: z
      .array(z.enum(['A', 'B', 'C', 'D', 'E', 'F']))
      .min(1, 'correctOptions must have at least one entry'),
    correctExplanation: z.string().min(1, 'correctExplanation is required'),
    optionExplanations: z.object({
      A: z.string().min(1, 'explanation for A is required'),
      B: z.string().min(1, 'explanation for B is required'),
      C: z.string().min(1, 'explanation for C is required'),
      D: z.string().min(1, 'explanation for D is required'),
      E: z.string().min(1, 'explanation for E is required'),
      F: z.string().min(1, 'explanation for F is required'),
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

export const QuizImportSchema = z.object({
  title: z.string().min(1, 'title is required'),
  description: z.string().optional(),
  questions: z
    .array(QuestionSchema)
    .min(1, 'at least one question is required'),
});

export const RenameSchema = z.object({
  title: z.string().min(1, 'title is required'),
});

export type QuizImport = z.infer<typeof QuizImportSchema>;
export type QuestionImport = z.infer<typeof QuestionSchema>;
