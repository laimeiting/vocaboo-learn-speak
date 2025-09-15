import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import InteractiveText from '@/components/InteractiveText';
import WordDefinitionPopup from '@/components/WordDefinitionPopup';
import ProgressBar from '@/components/ProgressBar';
import VocabooMascot from '@/components/VocabooMascot';
import SavedWordsList from '@/components/SavedWordsList';
import { ArrowLeft, BookOpen, Heart, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Reading = () => {
  const { toast } = useToast();
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [showSavedWords, setShowSavedWords] = useState(false);
  const [mascotMessage, setMascotMessage] = useState<string>("");

  // Sample interactive text content
  const sampleText = `Once upon a time, in a magnificent castle perched atop a verdant hill, there lived a benevolent queen who cherished her subjects deeply. The castle's elaborate gardens flourished with vibrant flowers and ancient oak trees that provided shade for countless creatures. Every morning, the queen would contemplate the responsibilities of her realm while sipping tea from her favorite porcelain cup.

The queen possessed remarkable wisdom and always endeavored to make judicious decisions for her kingdom. Her advisors would frequently seek her counsel on matters both trivial and momentous. She believed that true leadership required not only intelligence but also compassion and humility.`;

  // Sample word definitions
  const words = {
    magnificent: {
      text: "magnificent",
      definition: "Extremely beautiful, elaborate, or impressive; splendid",
      partOfSpeech: "adjective",
      pronunciation: "/mæɡˈnɪfɪsənt/",
      examples: [
        "The magnificent cathedral took centuries to build.",
        "She wore a magnificent gown to the royal ball."
      ]
    },
    perched: {
      text: "perched",
      definition: "Sitting or resting in a high or precarious position",
      partOfSpeech: "verb",
      pronunciation: "/pɜːrtʃt/",
      examples: [
        "The bird perched on the branch.",
        "The house was perched on the edge of the cliff."
      ]
    },
    verdant: {
      text: "verdant",
      definition: "Green with vegetation; fresh and flourishing",
      partOfSpeech: "adjective", 
      pronunciation: "/ˈvɜːrdənt/",
      examples: [
        "The verdant meadow stretched for miles.",
        "Spring brought verdant life to the barren landscape."
      ]
    },
    benevolent: {
      text: "benevolent",
      definition: "Well-meaning and kindly; charitable",
      partOfSpeech: "adjective",
      pronunciation: "/bəˈnevələnt/",
      examples: [
        "The benevolent ruler was loved by all.",
        "Her benevolent nature made her many friends."
      ]
    },
    cherished: {
      text: "cherished",
      definition: "Protected and cared for lovingly; treasured",
      partOfSpeech: "verb",
      pronunciation: "/ˈtʃerɪʃt/",
      examples: [
        "She cherished the memories of her childhood.",
        "The old photo was a cherished possession."
      ]
    },
    elaborate: {
      text: "elaborate",
      definition: "Involving many carefully arranged parts; detailed and complicated",
      partOfSpeech: "adjective",
      pronunciation: "/ɪˈlæbərət/",
      examples: [
        "The wedding had elaborate decorations.",
        "He created an elaborate plan for the project."
      ]
    },
    flourished: {
      text: "flourished",
      definition: "Grew or developed in a healthy or vigorous way",
      partOfSpeech: "verb",
      pronunciation: "/ˈflʌrɪʃt/",
      examples: [
        "The business flourished under new management.",
        "Art flourished during the Renaissance period."
      ]
    },
    contemplate: {
      text: "contemplate",
      definition: "To think about thoughtfully; consider carefully",
      partOfSpeech: "verb",
      pronunciation: "/ˈkɑːntəmpleɪt/",
      examples: [
        "She contemplated her future career options.",
        "He sat quietly to contemplate the beautiful sunset."
      ]
    },
    endeavored: {
      text: "endeavored", 
      definition: "Tried hard to do or achieve something",
      partOfSpeech: "verb",
      pronunciation: "/ɪnˈdevərd/",
      examples: [
        "The team endeavored to finish the project on time.",
        "She endeavored to learn a new language every year."
      ]
    },
    judicious: {
      text: "judicious",
      definition: "Having, showing, or done with good judgment or sense",
      partOfSpeech: "adjective", 
      pronunciation: "/dʒuˈdɪʃəs/",
      examples: [
        "She made a judicious decision about her investments.",
        "The judge's judicious ruling satisfied both parties."
      ]
    }
  };

  const handleSaveWord = (word: string) => {
    const newSavedWords = new Set(savedWords);
    if (newSavedWords.has(word)) {
      newSavedWords.delete(word);
      setMascotMessage("Word removed from your collection");
      toast({
        title: "Word Removed",
        description: `"${word}" has been removed from your collection.`,
      });
    } else {
      newSavedWords.add(word);
      setMascotMessage(`Great! "${word}" saved to your collection 🎉`);
      toast({
        title: "Word Saved!",
        description: `"${word}" has been added to your collection.`,
        className: "bg-success border-success/20 text-success-foreground"
      });
    }
    setSavedWords(newSavedWords);
    
    // Clear mascot message after 3 seconds
    setTimeout(() => setMascotMessage(""), 3000);
  };

  const savedWordsArray = Array.from(savedWords).map(word => ({
    word,
    definition: words[word]?.definition || "",
    partOfSpeech: words[word]?.partOfSpeech || "",
    pronunciation: words[word]?.pronunciation || "",
    examples: words[word]?.examples || [],
    savedAt: new Date()
  }));

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
                <h1 className="text-xl font-bold gradient-text">The Queen's Tale</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={showSavedWords ? "default" : "outline"}
                size="sm"
                onClick={() => setShowSavedWords(!showSavedWords)}
              >
                <Heart className={`w-4 h-4 mr-2 ${savedWords.size > 0 ? 'fill-current' : ''}`} />
                {savedWords.size}
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Mascot and Progress */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <VocabooMascot
              mood="encouraging"
              message={mascotMessage || "Tap on highlighted words to learn their meanings!"}
              size="md"
            />
          </div>
          <div className="lg:w-80">
            <ProgressBar
              progress={Math.round((savedWords.size / Object.keys(words).length) * 100)}
              streak={3}
              wordsLearned={savedWords.size}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Reading Area */}
          <div className="lg:col-span-2">
            <Card className="p-6 lg:p-8 shadow-card border-primary/10">
              <InteractiveText
                content={sampleText}
                words={words}
                savedWords={savedWords}
                onSaveWord={handleSaveWord}
                className="prose prose-lg max-w-none"
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {showSavedWords ? (
              <SavedWordsList
                savedWords={savedWordsArray}
                onRemoveWord={handleSaveWord}
              />
            ) : (
              <Card className="p-6 shadow-card border-primary/10">
                <h3 className="font-semibold text-card-foreground mb-4">Reading Tips</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-bold">💡</span>
                    <p className="text-muted-foreground">Tap on blue highlighted words to see their definitions</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-success font-bold">💚</span>
                    <p className="text-muted-foreground">Green words are already in your collection</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-secondary font-bold">🔊</span>
                    <p className="text-muted-foreground">Click the pronunciation to hear how words sound</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-4 shadow-card border-primary/10">
              <h4 className="font-medium text-card-foreground mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Change Story
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Reading Settings
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reading;