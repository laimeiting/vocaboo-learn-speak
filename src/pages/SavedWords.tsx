import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SavedWordsList from '@/components/SavedWordsList';
import { ArrowLeft, BookOpen, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import VocabooMascot from '@/components/VocabooMascot';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SavedWords = () => {
  // Sample saved words data - in real app this would come from database
  const [savedWords, setSavedWords] = useState([
    {
      word: "magnificent",
      definition: "Extremely beautiful, elaborate, or impressive; splendid",
      partOfSpeech: "adjective",
      pronunciation: "/mæɡˈnɪfɪsənt/",
      examples: [
        "The magnificent cathedral took centuries to build.",
        "She wore a magnificent gown to the royal ball."
      ],
      savedAt: new Date()
    },
    {
      word: "benevolent",
      definition: "Well-meaning and kindly; charitable",
      partOfSpeech: "adjective",
      pronunciation: "/bəˈnevələnt/",
      examples: [
        "The benevolent ruler was loved by all.",
        "Her benevolent nature made her many friends."
      ],
      savedAt: new Date()
    },
    {
      word: "flourished",
      definition: "Grew or developed in a healthy or vigorous way",
      partOfSpeech: "verb",
      pronunciation: "/ˈflʌrɪʃt/",
      examples: [
        "The business flourished under new management.",
        "Art flourished during the Renaissance period."
      ],
      savedAt: new Date()
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const handleRemoveWord = (word: string) => {
    setSavedWords(prevWords => prevWords.filter(w => w.word !== word));
    toast.success(`"${word}" removed from your saved words`);
  };

  const filteredWords = savedWords.filter(word => {
    const matchesSearch = word.word.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || word.partOfSpeech === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-primary/10 sticky top-0 z-40 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-bold gradient-text">My Saved Words</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Mascot */}
        <div className="mb-6">
          <VocabooMascot
            mood="encouraging"
            message={`You've saved ${savedWords.length} words! Keep building your vocabulary! 📚`}
            size="md"
          />
        </div>

        {/* Search and Filter */}
        <Card className="p-4 mb-6 shadow-card border-primary/10">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search your words..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className={filterType !== 'all' ? 'border-primary' : ''}>
                  <Filter className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterType('all')}>
                  All Words
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('noun')}>
                  Nouns
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('verb')}>
                  Verbs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('adjective')}>
                  Adjectives
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('adverb')}>
                  Adverbs
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>

        {/* Saved Words List */}
        <SavedWordsList
          savedWords={filteredWords}
          onRemoveWord={handleRemoveWord}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Card className="p-4 shadow-card border-primary/10">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{savedWords.length}</p>
              <p className="text-sm text-muted-foreground">Total Words</p>
            </div>
          </Card>
          <Card className="p-4 shadow-card border-primary/10">
            <div className="text-center">
              <p className="text-3xl font-bold text-success">85%</p>
              <p className="text-sm text-muted-foreground">Mastery Rate</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SavedWords;
