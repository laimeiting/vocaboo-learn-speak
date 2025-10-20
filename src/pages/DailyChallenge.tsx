import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Star, CheckCircle2, XCircle, ArrowRight, Home } from 'lucide-react';
import GhostAvatar from '@/components/GhostAvatar';
import GhostButton from '@/components/GhostButton';
import SpeechBubble from '@/components/SpeechBubble';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ChallengeQuestion {
  id: number;
  word: string;
  definition: string;
  options: string[];
  correctAnswer: string;
}

const dailyChallenges: ChallengeQuestion[] = [
  {
    id: 1,
    word: "ephemeral",
    definition: "Choose the correct meaning of 'ephemeral':",
    options: ["Lasting for a very short time", "Extremely beautiful", "Very old", "Mysterious"],
    correctAnswer: "Lasting for a very short time"
  },
  {
    id: 2,
    word: "serendipity",
    definition: "What does 'serendipity' mean?",
    options: ["Good luck", "Finding something good by accident", "A peaceful place", "Sadness"],
    correctAnswer: "Finding something good by accident"
  },
  {
    id: 3,
    word: "melancholy",
    definition: "Select the meaning of 'melancholy':",
    options: ["Joyful", "Deep sadness or gloom", "Angry", "Confused"],
    correctAnswer: "Deep sadness or gloom"
  },
  {
    id: 4,
    word: "eloquent",
    definition: "What does 'eloquent' describe?",
    options: ["Speaking fluently and persuasively", "Being quiet", "Moving quickly", "Eating slowly"],
    correctAnswer: "Speaking fluently and persuasively"
  },
  {
    id: 5,
    word: "resilient",
    definition: "Choose the correct meaning of 'resilient':",
    options: ["Weak", "Able to recover quickly", "Very tall", "Colorful"],
    correctAnswer: "Able to recover quickly"
  }
];

const DailyChallenge = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    const isCorrect = selectedAnswer === dailyChallenges[currentQuestion].correctAnswer;
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);
    
    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentQuestion < dailyChallenges.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleCheckAnswer = () => {
    setShowResult(true);
  };

  const isCorrect = selectedAnswer === dailyChallenges[currentQuestion].correctAnswer;
  const progress = ((currentQuestion + 1) / dailyChallenges.length) * 100;

  if (isComplete) {
    const percentage = Math.round((score / dailyChallenges.length) * 100);
    const isPerfect = score === dailyChallenges.length;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light/20 via-secondary-light/15 to-accent-light/20 p-6"
           style={{ background: 'var(--gradient-hero)' }}>
        <div className="max-w-2xl mx-auto pt-8">
          <Card className="backdrop-blur border-0" style={{ background: 'var(--gradient-card)' }}>
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <GhostAvatar 
                  size="xl" 
                  variant={isPerfect ? "happy" : score >= 3 ? "winking" : "sleepy"} 
                  accessory={isPerfect ? "crown" : "none"}
                  floating 
                />
              </div>
              
              <h1 className="font-heading text-3xl font-bold mb-4 text-foreground">
                Challenge Complete! {isPerfect ? "🎉" : ""}
              </h1>
              
              <div className="mb-6">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Trophy className="w-8 h-8 text-accent" />
                  <span className="text-5xl font-bold text-accent">{score}/{dailyChallenges.length}</span>
                </div>
                <p className="text-xl text-muted-foreground mb-4">
                  {percentage}% Correct
                </p>
                
                <div className="flex justify-center gap-2 mb-6">
                  {answers.map((correct, idx) => (
                    correct ? 
                      <CheckCircle2 key={idx} className="w-6 h-6 text-success" /> :
                      <XCircle key={idx} className="w-6 h-6 text-destructive" />
                  ))}
                </div>
              </div>

              <SpeechBubble variant={isPerfect ? "encouraging" : "default"} className="mb-6">
                <p className="font-body">
                  {isPerfect ? (
                    <>🌟 Perfect score! You're a vocabulary master!</>
                  ) : score >= 3 ? (
                    <>Great job! Keep practicing to improve even more!</>
                  ) : (
                    <>Keep going! Practice makes perfect! 💪</>
                  )}
                </p>
              </SpeechBubble>

              <div className="flex gap-4 justify-center">
                <GhostButton
                  variant="default"
                  size="lg"
                  icon={Home}
                  onClick={() => navigate('/')}
                >
                  Go Home
                </GhostButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const question = dailyChallenges[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/20 via-secondary-light/15 to-accent-light/20 p-6"
         style={{ background: 'var(--gradient-hero)' }}>
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <Home className="w-5 h-5 mr-2" />
            Home
          </Button>
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-accent" />
            <span className="font-bold text-foreground">{score}/{dailyChallenges.length}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Question {currentQuestion + 1} of {dailyChallenges.length}</span>
            <span className="font-medium text-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Question Card */}
        <Card className="backdrop-blur border-0 mb-6" style={{ background: 'var(--gradient-card)' }}>
          <CardContent className="p-8">
            <div className="flex items-start space-x-4 mb-6">
              <GhostAvatar size="lg" variant="winking" floating />
              <div className="flex-1">
                <h2 className="font-heading text-2xl font-bold mb-2 text-foreground">
                  {question.word}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {question.definition}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {question.options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const shouldShowCorrect = showResult && option === question.correctAnswer;
                const shouldShowWrong = showResult && isSelected && !isCorrect;
                
                return (
                  <button
                    key={idx}
                    onClick={() => !showResult && handleAnswer(option)}
                    disabled={showResult}
                    className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                      shouldShowCorrect
                        ? 'bg-success/20 border-success'
                        : shouldShowWrong
                        ? 'bg-destructive/20 border-destructive'
                        : isSelected
                        ? 'bg-primary/20 border-primary'
                        : 'bg-muted/50 border-transparent hover:border-primary/50'
                    } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{option}</span>
                      {shouldShowCorrect && <CheckCircle2 className="w-5 h-5 text-success" />}
                      {shouldShowWrong && <XCircle className="w-5 h-5 text-destructive" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {showResult && (
              <div className="mt-6">
                <SpeechBubble variant={isCorrect ? "encouraging" : "default"}>
                  <p className="font-body">
                    {isCorrect ? (
                      <>🎉 That's right! Great job!</>
                    ) : (
                      <>Not quite! The correct answer is: <strong>{question.correctAnswer}</strong></>
                    )}
                  </p>
                </SpeechBubble>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end">
          {!showResult ? (
            <GhostButton
              variant="success"
              size="lg"
              onClick={handleCheckAnswer}
              disabled={!selectedAnswer}
              icon={Star}
            >
              Check Answer
            </GhostButton>
          ) : (
            <GhostButton
              variant="default"
              size="lg"
              onClick={handleNext}
              icon={ArrowRight}
            >
              {currentQuestion < dailyChallenges.length - 1 ? 'Next Question' : 'Finish'}
            </GhostButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyChallenge;
