import { Progress } from '@/components/ui/progress';
import { Star, Flame } from 'lucide-react';

interface ProgressBarProps {
  progress: number;
  streak: number;
  wordsLearned: number;
  className?: string;
}

const ProgressBar = ({ progress, streak, wordsLearned, className }: ProgressBarProps) => {
  return (
    <div className={`bg-card rounded-2xl p-4 shadow-card border border-primary/10 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-card-foreground">Today's Progress</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-secondary">
            <Flame className="w-4 h-4" />
            <span className="font-bold">{streak}</span>
            <span className="text-muted-foreground">day streak</span>
          </div>
          <div className="flex items-center gap-1 text-accent">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-bold">{wordsLearned}</span>
            <span className="text-muted-foreground">words</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Reading Goal</span>
          <span className="font-medium text-foreground">{progress}%</span>
        </div>
        <Progress 
          value={progress} 
          className="h-3 bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Keep going! You're doing great 🎉
        </p>
      </div>
    </div>
  );
};

export default ProgressBar;