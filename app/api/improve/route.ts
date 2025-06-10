import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder',
});

export async function POST(request: NextRequest) {
  try {
    const { currentPrompt, feedback, thumbsUp } = await request.json();

    if (!currentPrompt) {
      return NextResponse.json(
        { error: 'Current prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    let improvementInstructions = '';

    if (thumbsUp === false) {
      improvementInstructions = `The user gave a thumbs down to the current prompt. `;
    }

    if (feedback) {
      improvementInstructions += `User feedback: "${feedback}". `;
    }

    if (!improvementInstructions) {
      improvementInstructions = 'Please improve this prompt to be more effective, clear, and specific. ';
    }

    const systemPrompt = `You are a prompt editor. Your job is to take a user's raw prompt and transform it into a polished, context-rich, ready-to-use prompt while preserving the original's writing style and tone.

CRITICAL: Maintain the original prompt's writing style, tone, and voice. If the original is casual, keep it casual. If it's formal, keep it formal. If it's simple and direct, don't make it academic or overly complex. The goal is enhancement, not transformation of style.

FEEDBACK INTEGRATION: When user feedback is provided, incorporate it thoughtfully while keeping as much of the original prompt intact as possible. Make targeted changes to address the specific feedback rather than completely rewriting the prompt. Only do a full revision if the feedback explicitly requests a complete rewrite.

Follow this internal process (DO NOT include any of these steps in your output):

1. Extract & Restate the Goal - Identify what the user wants
2. Analyze Original Style - Note the tone, formality level, and writing style to preserve
3. Infer Missing Context - Add essential background and domain knowledge  
4. Specify Audience & Tone - Define who it's for while matching the original style
5. Define Output Format & Length - State structure and detail level
6. Embed Examples or Placeholders - Include relevant examples if helpful
7. Add Constraints & Requirements - List must-haves and forbidden elements
8. Frame Success Criteria - Note quality measures if relevant

Your response must be ONLY the final improved prompt - a single, cohesive prompt that someone could copy and paste directly into an AI system. Do not include step headers, explanations, reasoning, or any meta-commentary about your process.

${improvementInstructions}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Current prompt to improve:\n\n${currentPrompt}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const improvedPrompt = completion.choices[0]?.message?.content || currentPrompt;

    return NextResponse.json({ improvedPrompt });
  } catch (error) {
    console.error('Error improving prompt:', error);
    return NextResponse.json(
      { error: 'Failed to improve prompt' },
      { status: 500 }
    );
  }
}