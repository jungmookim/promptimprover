import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder',
});

export async function POST(request: NextRequest) {
  try {
    const { originalPrompt, improvedPrompt } = await request.json();

    if (!originalPrompt || !improvedPrompt) {
      return NextResponse.json(
        { error: 'Both original and improved prompts are required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const systemPrompt = `You are an expert prompt engineer analyzing improvements between two prompts. Compare the original and improved versions and identify the key optimizations made.

Respond with 2-4 concise bullet points (each 10-15 words max) describing what was changed or improved. Focus on:
- Structure improvements
- Clarity enhancements  
- Added specificity
- Better context or instructions
- Improved formatting

Format as bullet points without "•" symbols, just start each line with "- ". Keep it brief and actionable.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Original prompt:\n${originalPrompt}\n\nImproved prompt:\n${improvedPrompt}`,
        },
      ],
      max_tokens: 200,
      temperature: 0.3,
    });

    const analysis = completion.choices[0]?.message?.content || 'Unable to analyze changes';

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error analyzing changes:', error);
    return NextResponse.json(
      { error: 'Failed to analyze changes' },
      { status: 500 }
    );
  }
}