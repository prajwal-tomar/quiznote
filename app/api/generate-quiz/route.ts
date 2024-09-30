import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers'

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Add this interface at the top of the file, outside of any function
interface GeneratedQuestion {
    question: string;
    options: string[];
    correct_answer: string;
}

async function ensureUserExists(supabase: SupabaseClient, userId: string, email: string) {
    const { data, error } = await supabase
        .from('users')
        .upsert({
            user_id: userId,
            email: email,
            signup_date: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        .select()
        .single();

    if (error) {
        console.error('Error ensuring user exists:', error);
        throw error;
    }

    return data;
}

export async function POST(request: NextRequest) {
    try {
        const { noteId } = await request.json();

        if (!noteId) {
            return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
        }

        // Create a Supabase client using the auth cookie
        const supabase = createServerComponentClient({ cookies })

        // Get the user session
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            console.error('User not authenticated');
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
        }

        const userId = session.user.id;
        const userEmail = session.user.email;
        console.log('User ID:', userId);
        // Ensure the user exists in the users table
        await ensureUserExists(supabase, userId, userEmail!);

        // Fetch the note content
        const { data: note, error: noteError } = await supabase
            .from('notes')
            .select('extracted_text, note_title')
            .eq('note_id', noteId)
            .single();

        if (noteError) {
            console.error('Error fetching note:', noteError);
            return NextResponse.json({ error: 'Failed to fetch note', details: noteError }, { status: 400 });
        }

        if (!note || !note.extracted_text) {
            console.error('Note or extracted text is empty');
            return NextResponse.json({ error: 'Note content is empty' }, { status: 400 });
        }

        console.log('Successfully fetched note:', note.note_title);

        // Generate quiz questions using OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful assistant that generates multiple-choice questions based on given text." },
                { role: "user", content: `Generate 5 multiple-choice questions based on the following text:\n\n${note.extracted_text}` }
            ],
            functions: [
                {
                    name: "generate_questions",
                    description: "Generate multiple-choice questions with options and correct answers",
                    parameters: {
                        type: "object",
                        properties: {
                            questions: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        question: { type: "string" },
                                        options: { type: "array", items: { type: "string" } },
                                        correct_answer: { type: "string" }
                                    },
                                    required: ["question", "options", "correct_answer"]
                                }
                            }
                        },
                        required: ["questions"]
                    }
                }
            ],
            function_call: { name: "generate_questions" }
        });

        console.log('OpenAI Response:', JSON.stringify(completion, null, 2));

        if (!completion.choices[0].message.function_call) {
            return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
        }

        // Modify the parsing and type checking of generatedQuestions
        let generatedQuestions: GeneratedQuestion[];
        try {
            const parsedArguments = JSON.parse(completion.choices[0].message.function_call!.arguments);
            console.log('Parsed arguments:', JSON.stringify(parsedArguments, null, 2));

            if (!parsedArguments.questions || !Array.isArray(parsedArguments.questions)) {
                throw new Error('Generated questions is not an array');
            }
            generatedQuestions = parsedArguments.questions;

            // Validate the structure of each question
            if (!generatedQuestions.every(q =>
                typeof q.question === 'string' &&
                Array.isArray(q.options) &&
                q.options.every(o => typeof o === 'string') &&
                typeof q.correct_answer === 'string'
            )) {
                throw new Error('Invalid question structure');
            }
        } catch (error) {
            console.error('Error parsing generated questions:', error);
            console.error('Raw function call arguments:', completion.choices[0].message.function_call!.arguments);
            return NextResponse.json({ error: 'Failed to parse generated questions' }, { status: 500 });
        }

        console.log('Parsed Questions:', JSON.stringify(generatedQuestions, null, 2));

        // Create a new quiz in the database
        const { data: quiz, error: quizError } = await supabase
            .from('quizzes')
            .insert({
                note_id: noteId,
                user_id: userId,
                quiz_date: new Date().toISOString(),
                total_questions: generatedQuestions.length,
                time_limit: 600 // Default to 10 minutes (600 seconds), adjust as needed
            })
            .select()
            .single();

        if (quizError) {
            console.error('Error creating quiz:', quizError);
            return NextResponse.json({ error: 'Failed to create quiz', details: quizError }, { status: 500 });
        }

        console.log('Quiz created successfully:', quiz);

        // Insert questions for the quiz
        const questionsToInsert = generatedQuestions.map((q: GeneratedQuestion) => ({
            quiz_id: quiz.quiz_id,
            question_text: q.question,
            question_type: 'MCQ' // Assuming all generated questions are MCQs
        }));

        const { data: insertedQuestions, error: questionsError } = await supabase
            .from('questions')
            .insert(questionsToInsert)
            .select();

        if (questionsError) {
            console.error('Error inserting questions:', questionsError);
            return NextResponse.json({ error: 'Failed to insert questions', details: questionsError }, { status: 500 });
        }

        console.log('Questions inserted successfully:', insertedQuestions);

        // Insert answers for each question
        const answersToInsert = insertedQuestions.flatMap((question: any, index: number) => {
            const currentQuestion = generatedQuestions[index];
            return currentQuestion.options.map((option: string) => ({
                question_id: question.question_id,
                answer_text: option,
                is_correct: option === currentQuestion.correct_answer
            }));
        });

        const { data: insertedAnswers, error: answersError } = await supabase
            .from('answers')
            .insert(answersToInsert);

        if (answersError) {
            console.error('Error inserting answers:', answersError);
            return NextResponse.json({ error: 'Failed to insert answers', details: answersError }, { status: 500 });
        }

        console.log('Answers inserted successfully');

        return NextResponse.json({ quiz, questions: insertedQuestions });

    } catch (error) {
        console.error('Error generating quiz:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: 'Failed to generate quiz', details: error.message }, { status: 500 });
        } else {
            return NextResponse.json({ error: 'Failed to generate quiz', details: 'An unknown error occurred' }, { status: 500 });
        }
    }
}