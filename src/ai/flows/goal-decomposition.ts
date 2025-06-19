'use server';

/**
 * @fileOverview An AI agent that decomposes a high-level goal into actionable habits and tasks.
 *
 * - goalDecomposition - A function that handles the goal decomposition process.
 * - GoalDecompositionInput - The input type for the goalDecomposition function.
 * - GoalDecompositionOutput - The return type for the goalDecomposition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GoalDecompositionInputSchema = z.object({
  goal: z.string().describe('A high-level goal described in natural language.'),
});
export type GoalDecompositionInput = z.infer<typeof GoalDecompositionInputSchema>;

const GoalDecompositionOutputSchema = z.object({
  plan: z
    .string()
    .describe(
      'A structured plan with actionable habits and tasks to achieve the goal. Should be returned as a JSON array of objects, where each object has a "task" and a "reason" field.'
    ),
});
export type GoalDecompositionOutput = z.infer<typeof GoalDecompositionOutputSchema>;

export async function goalDecomposition(input: GoalDecompositionInput): Promise<GoalDecompositionOutput> {
  return goalDecompositionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'goalDecompositionPrompt',
  input: {schema: GoalDecompositionInputSchema},
  output: {schema: GoalDecompositionOutputSchema},
  prompt: `You are an AI assistant designed to decompose high-level goals into actionable plans.

  The user will provide a high-level goal in natural language. You will generate a structured plan with actionable habits and tasks to achieve the goal. Please respond with valid JSON. Each object in the array should have a "task" field that represents a specific, actionable step, and a "reason" field which gives a justification or explanation of why this task is important.

  Goal: {{{goal}}} `,
});

const goalDecompositionFlow = ai.defineFlow(
  {
    name: 'goalDecompositionFlow',
    inputSchema: GoalDecompositionInputSchema,
    outputSchema: GoalDecompositionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
