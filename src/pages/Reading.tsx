import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import InteractiveText from '@/components/InteractiveText';
import WordDefinitionPopup from '@/components/WordDefinitionPopup';
import ProgressBar from '@/components/ProgressBar';
import VocabooMascot from '@/components/VocabooMascot';
import SavedWordsList from '@/components/SavedWordsList';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, BookOpen, Heart, Settings, Search, Clock, BookMarked, Volume2, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Book {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  content: string;
  difficulty_level: string;
  genre: string[] | null;
  page_count: number | null;
  reading_time_minutes: number | null;
  image_url: string | null;
  published_year: number | null;
  vocabulary_words: any;
}

const Reading = () => {
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  
  // Reading view state
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [showSavedWords, setShowSavedWords] = useState(false);
  const [mascotMessage, setMascotMessage] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [isReading, setIsReading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [ttsLoading, setTtsLoading] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [books, searchTerm, selectedGenre, selectedDifficulty]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title');

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast({
        title: "Error",
        description: "Failed to load books",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = [...books];

    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGenre !== 'all') {
      filtered = filtered.filter(book => 
        book.genre?.includes(selectedGenre)
      );
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(book => 
        book.difficulty_level === selectedDifficulty
      );
    }

    setFilteredBooks(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'advanced':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const handleReadBook = (book: Book) => {
    setSelectedBook(book);
  };

  const handleBackToList = () => {
    setSelectedBook(null);
  };

  const handleWordClick = (word: string, definition: string) => {
    console.log('Word clicked:', word);
  };

  const handleSaveWord = (word: string) => {
    setSavedWords(new Set([...savedWords, word]));
    setMascotMessage(`Great! I've saved "${word}" for you! 📚`);
    setTimeout(() => setMascotMessage(""), 3000);
  };

  const handleRemoveWord = (word: string) => {
    const newSavedWords = new Set(savedWords);
    newSavedWords.delete(word);
    setSavedWords(newSavedWords);
  };

  const handleReadAloud = async () => {
    if (!selectedBook) return;

    // If audio is playing, pause it
    if (isReading && currentAudio) {
      currentAudio.pause();
      setIsReading(false);
      return;
    }

    // If audio exists but is paused, resume it
    if (currentAudio && currentAudio.paused) {
      await currentAudio.play();
      setIsReading(true);
      return;
    }

    // Otherwise, start new audio
    setTtsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: selectedBook.content,
          voice: 'alloy'
        }
      });

      if (error) throw error;

      const audio = new Audio(`data:audio/mpeg;base64,${data.audioContent}`);
      audio.onplay = () => setIsReading(true);
      audio.onpause = () => setIsReading(false);
      audio.onended = () => {
        setIsReading(false);
        setCurrentAudio(null);
      };
      setCurrentAudio(audio);

      await audio.play();
      setTtsLoading(false);
    } catch (error) {
      console.error('Error reading aloud:', error);
      toast({
        title: "Error",
        description: "Failed to read book aloud",
        variant: "destructive",
      });
      setTtsLoading(false);
      setIsReading(false);
    }
  };

  // Book list view
  if (!selectedBook) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-12">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              📚 Reading Library
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Improve your English through engaging stories and interactive vocabulary
            </p>
          </div>

          {/* Filters */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search books by title, author, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  <SelectItem value="Fiction">Fiction</SelectItem>
                  <SelectItem value="Fantasy">Fantasy</SelectItem>
                  <SelectItem value="Children">Children</SelectItem>
                  <SelectItem value="Young Adult">Young Adult</SelectItem>
                  <SelectItem value="Dystopian">Dystopian</SelectItem>
                  <SelectItem value="Contemporary">Contemporary</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Books Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-40 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-20 w-full" />
                </Card>
              ))}
            </div>
          ) : filteredBooks.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No books found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search term
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => (
                <Card key={book.id} className="group hover:shadow-lg transition-all duration-300 p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {book.title}
                    </h3>
                    {book.author && (
                      <p className="text-sm text-muted-foreground">by {book.author}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={getDifficultyColor(book.difficulty_level)}>
                      {book.difficulty_level}
                    </Badge>
                    {book.genre?.slice(0, 2).map((genre) => (
                      <Badge key={genre} variant="outline">
                        {genre}
                      </Badge>
                    ))}
                  </div>

                  {book.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {book.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {book.reading_time_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{book.reading_time_minutes} min</span>
                      </div>
                    )}
                    {book.page_count && (
                      <div className="flex items-center gap-1">
                        <BookMarked className="w-4 h-4" />
                        <span>{book.page_count} pages</span>
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={() => handleReadBook(book)} 
                    className="w-full"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Start Reading
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Reading view
  const words = selectedBook.vocabulary_words || {};
  const savedWordsArray = Array.from(savedWords).map(word => ({
    word,
    definition: words[word]?.definition || '',
    partOfSpeech: words[word]?.partOfSpeech || '',
    pronunciation: words[word]?.pronunciation || '',
    examples: words[word]?.examples || [],
    savedAt: new Date(),
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={handleBackToList}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Library
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleReadAloud}
                disabled={ttsLoading}
              >
                {isReading ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSavedWords(true)}
              >
                <Heart className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Book Info */}
          <div className="mb-8 space-y-2">
            <h1 className="text-3xl font-bold">{selectedBook.title}</h1>
            {selectedBook.author && (
              <p className="text-lg text-muted-foreground">by {selectedBook.author}</p>
            )}
            <div className="flex gap-2">
              <Badge className={getDifficultyColor(selectedBook.difficulty_level)}>
                {selectedBook.difficulty_level}
              </Badge>
              {selectedBook.genre?.map((genre) => (
                <Badge key={genre} variant="outline">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          {/* Progress */}
          <ProgressBar progress={0} streak={1} wordsLearned={savedWords.size} />

          {/* Mascot */}
          {mascotMessage && <VocabooMascot message={mascotMessage} />}

          {/* Interactive Text */}
          <Card className="p-8">
            <InteractiveText
              content={selectedBook.content}
              words={words}
              onSaveWord={handleSaveWord}
              savedWords={savedWords}
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight.toString()
              }}
            />
          </Card>

          {/* Saved Words Dialog */}
          <Dialog open={showSavedWords} onOpenChange={setShowSavedWords}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Your Saved Words</DialogTitle>
                <DialogDescription>
                  Review and practice the words you've saved from this story
                </DialogDescription>
              </DialogHeader>
              <SavedWordsList
                savedWords={savedWordsArray}
                onRemoveWord={handleRemoveWord}
              />
            </DialogContent>
          </Dialog>

          {/* Settings Dialog */}
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reading Settings</DialogTitle>
                <DialogDescription>
                  Customize your reading experience
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Font Size: {fontSize}px</Label>
                  <Slider
                    value={[fontSize]}
                    onValueChange={(value) => setFontSize(value[0])}
                    min={14}
                    max={24}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Line Height: {lineHeight.toFixed(1)}</Label>
                  <Slider
                    value={[lineHeight]}
                    onValueChange={(value) => setLineHeight(value[0])}
                    min={1.2}
                    max={2.5}
                    step={0.1}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Reading;
