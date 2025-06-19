'use server';

/**
 * @fileOverview AI flow for scheduling events based on natural language input.
 *
 * - naturalLanguageScheduling - A function that schedules events based on natural language input.
 * - NaturalLanguageSchedulingInput - The input type for the naturalLanguageScheduling function.
 * - NaturalLanguageSchedulingOutput - The return type for the naturalLanguageScheduling function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NaturalLanguageSchedulingInputSchema = z.object({
  scheduleDescription: z
    .string()
    .describe('A description of the schedule in plain English.'),
});
export type NaturalLanguageSchedulingInput = z.infer<
  typeof NaturalLanguageSchedulingInputSchema
>;

const NaturalLanguageSchedulingOutputSchema = z.object({
  scheduledEvents: z
    .array(z.object({
      startTime: z.string().describe('The start time of the event.'),
      endTime: z.string().describe('The end time of the event.'),
      description: z.string().describe('The description of the event.'),
    }))
    .describe('A list of scheduled events.'),
});
export type NaturalLanguageSchedulingOutput = z.infer<
  typeof NaturalLanguageSchedulingOutputSchema
>;

export async function naturalLanguageScheduling(
  input: NaturalLanguageSchedulingInput
): Promise<NaturalLanguageSchedulingOutput> {
  return naturalLanguageSchedulingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'naturalLanguageSchedulingPrompt',
  input: {schema: NaturalLanguageSchedulingInputSchema},
  output: {schema: NaturalLanguageSchedulingOutputSchema},
  prompt: `You are a personal assistant that schedules events based on natural language descriptions.

  Based on the following description, create a list of scheduled events.

  Description: {{{scheduleDescription}}}

  The output should be a JSON object with a "scheduledEvents" field that is an array of events.
  Each event should have a startTime, endTime, and description field.
`,
});

const naturalLanguageSchedulingFlow = ai.defineFlow(
  {
    name: 'naturalLanguageSchedulingFlow',
    inputSchema: NaturalLanguageSchedulingInputSchema,
    outputSchema: NaturalLanguageSchedulingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
