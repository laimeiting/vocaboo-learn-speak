import React, { useState, useRef } from 'react';
import { Mic, Square, Volume2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PronunciationPracticeProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  title: string;
}

const PronunciationPractice: React.FC<PronunciationPracticeProps> = ({
  isOpen,
  onClose,
  text,
  title,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    transcribed: string;
    feedback: string;
    score: number;
  } | null>(null);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setResult(null);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Failed to access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Audio = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      const { data, error } = await supabase.functions.invoke('pronunciation-check', {
        body: {
          audio: base64Audio,
          originalText: text,
        },
      });

      if (error) throw error;

      setResult(data);
      
      toast({
        title: "Analysis Complete",
        description: `Pronunciation accuracy: ${data.score}%`,
      });
    } catch (error: any) {
      console.error('Error processing audio:', error);
      const friendly = error?.name === 'FunctionsHttpError'
        ? 'Service is temporarily unavailable or rate limited. Please try again in a minute.'
        : 'Failed to analyze pronunciation';
      toast({
        title: 'Pronunciation Unavailable',
        description: friendly,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const playOriginalAudio = async () => {
    setIsPlayingOriginal(true);
    
    try {
      const response = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: 'alloy' }
      });

      if (response.error) throw response.error;

      const { audioContent } = response.data;
      
      const audioBlob = new Blob([
        new Uint8Array(atob(audioContent).split('').map(c => c.charCodeAt(0)))
      ], { type: 'audio/mpeg' });
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlayingOriginal(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsPlayingOriginal(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlayingOriginal(false);
      toast({
        title: "Error",
        description: "Failed to play audio",
        variant: "destructive",
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-secondary';
    return 'text-destructive';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pronunciation Practice - {title}</DialogTitle>
          <DialogDescription>
            Record your voice and get instant, friendly feedback on how close you are to the original.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Original Text */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Practice this:</h3>
                <p className="text-foreground">{text}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={playOriginalAudio}
                disabled={isPlayingOriginal}
              >
                <Volume2 className={`w-4 h-4 ${isPlayingOriginal ? 'animate-pulse' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Recording Controls */}
          <div className="flex justify-center">
            {!isRecording && !isProcessing && (
              <Button
                onClick={startRecording}
                size="lg"
                className="bg-destructive hover:bg-destructive/90 text-white gap-2"
              >
                <Mic className="w-5 h-5" />
                Start Recording
              </Button>
            )}
            
            {isRecording && (
              <Button
                onClick={stopRecording}
                size="lg"
                variant="secondary"
                className="gap-2 animate-pulse"
              >
                <Square className="w-5 h-5" />
                Stop Recording
              </Button>
            )}
            
            {isProcessing && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing pronunciation...
              </div>
            )}
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <div className="bg-primary/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Pronunciation Score</h3>
                  <span className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}%
                  </span>
                </div>
                <Progress value={result.score} className="h-2" />
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">What you said:</h3>
                <p className="text-foreground italic">"{result.transcribed}"</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Feedback:</h3>
                <p className="text-foreground whitespace-pre-line">{result.feedback}</p>
              </div>

              <Button
                onClick={() => setResult(null)}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PronunciationPractice;
