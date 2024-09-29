import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { quizId, answers, timeTaken } = await request.json();

    try {
        // Fetch quiz details
        const { data: quiz, error: quizError } = await supabase
            .from('quizzes')
            .select('*')
            .eq('quiz_id', quizId)
            .single();

        if (quizError) throw quizError;

        // Fetch questions and correct answers
        const { data: questions, error: questionsError } = await supabase
            .from('questions')
            .select(`
                question_id,
                answers (
                    answer_id,
                    is_correct
                )
            `)
            .eq('quiz_id', quizId);

        if (questionsError) throw questionsError;

        // Calculate score
        let score = 0;
        questions.forEach((question: any) => {
            const userAnswer = answers.find((a: any) => a.questionId === question.question_id);
            const correctAnswer = question.answers.find((a: any) => a.is_correct);
            if (userAnswer && correctAnswer && userAnswer.answerId === correctAnswer.answer_id) {
                score++;
            }
        });

        // Save quiz result
        const { data: quizResult, error: resultError } = await supabase
            .from('quiz_results')
            .insert({
                quiz_id: quizId,
                user_id: userId,
                score: score,
                attempt_date: new Date().toISOString(),
                time_taken: timeTaken,
                feedback: `You scored ${score} out of ${questions.length} questions.`
            })
            .select()
            .single();

        if (resultError) throw resultError;

        // Update user progress (simplified version, you may want to expand this)
        const { error: progressError } = await supabase.rpc('update_user_progress', {
            p_user_id: userId,
            p_quiz_id: quizId,
            p_score: score
        });

        if (progressError) throw progressError;

        return NextResponse.json({
            success: true,
            score: score,
            totalQuestions: questions.length,
            quizResult: quizResult
        });

    } catch (error) {
        console.error('Error submitting quiz:', error);
        return NextResponse.json({ error: 'Failed to submit quiz' }, { status: 500 });
    }
}