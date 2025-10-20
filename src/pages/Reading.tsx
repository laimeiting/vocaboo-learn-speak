import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import InteractiveText from '@/components/InteractiveText';
import WordDefinitionPopup from '@/components/WordDefinitionPopup';
import ProgressBar from '@/components/ProgressBar';
import VocabooMascot from '@/components/VocabooMascot';
import SavedWordsList from '@/components/SavedWordsList';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, BookOpen, Heart, Settings } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Reading = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [showSavedWords, setShowSavedWords] = useState(false);
  const [mascotMessage, setMascotMessage] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.8);

  // Story selection based on navigation state
  const location = useLocation() as any;
  const selectedBookTitle: string | undefined = location?.state?.book?.title;

  type Word = { text: string; definition: string; partOfSpeech: string; pronunciation: string; examples: string[] };

  const queenStory = {
    title: "The Queen's Tale",
    content: `In a magnificent castle perched atop a verdant hill, there lived a benevolent queen who cherished her subjects deeply. The castle's elaborate gardens flourished with vibrant flowers and ancient oak trees that provided shade for countless creatures. Every morning, the queen would contemplate the responsibilities of her realm while sipping tea from her favorite porcelain cup.

The queen possessed remarkable wisdom and always endeavored to make judicious decisions for her kingdom. Her advisors would frequently seek her counsel on matters both trivial and momentous. She believed that true leadership required not only intelligence but also compassion and humility.

One day, a messenger arrived with troubling news from a distant village. The queen listened intently and quickly assembled her most trusted advisors to discuss the matter. Together, they crafted a solution that would benefit all her people.`,
    words: {
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
    }
  };

  const littlePrinceStory = {
    title: "The Little Prince",
    content: `On the small asteroid B-612 lived a curious little prince who tended his volcanoes and watched sunsets. He met a pilot in the desert and learned about friendship from a wise fox who asked to be tamed. The little prince wondered about baobabs, roses, and what truly matters to the heart.`,
    words: {
      asteroid: {
        text: "asteroid",
        definition: "A small rocky body orbiting the sun, much smaller than a planet",
        partOfSpeech: "noun",
        pronunciation: "/ˈæstərɔɪd/",
        examples: [
          "The little prince lived on a tiny asteroid.",
          "Scientists study asteroids to learn about the early solar system."
        ]
      },
      tamed: {
        text: "tamed",
        definition: "Made less wild; trained to behave in a controlled way",
        partOfSpeech: "verb",
        pronunciation: "/teɪmd/",
        examples: [
          "The fox wished to be tamed by the little prince.",
          "Horses can be tamed with patience."
        ]
      },
      baobabs: {
        text: "baobabs",
        definition: "Large African trees; in the story, sprouts that could overrun the planet if not removed",
        partOfSpeech: "noun",
        pronunciation: "/ˈbeɪoʊˌbæbz/",
        examples: [
          "The little prince feared baobabs taking over his planet.",
          "Baobabs have thick trunks and can live thousands of years."
        ]
      },
      fox: {
        text: "fox",
        definition: "A small wild animal; the fox teaches the prince about friendship",
        partOfSpeech: "noun",
        pronunciation: "/fɒks/",
        examples: [
          "The fox asked to be tamed.",
          "A fox is known for being clever."
        ]
      },
      pilot: {
        text: "pilot",
        definition: "A person who flies an aircraft; the narrator of the story",
        partOfSpeech: "noun",
        pronunciation: "/ˈpaɪlət/",
        examples: [
          "The pilot met the little prince in the desert.",
          "The pilot repaired his plane."
        ]
      },
      friendship: {
        text: "friendship",
        definition: "A close and trusting relationship between people",
        partOfSpeech: "noun",
        pronunciation: "/ˈfrendʃɪp/",
        examples: [
          "The story teaches the meaning of friendship.",
          "True friendship takes time and care."
        ]
      }
    }
  };

  const charlottesWebStory = {
    title: "Charlotte's Web",
    content: `Wilbur was a young pig who lived in a barn with many other animals. He was frightened when he learned that the farmer planned to slaughter him in the winter. Charlotte, a wise and clever spider, became his friend and promised to help him. She wove magnificent words into her web above Wilbur's pen, convincing everyone that he was a special pig worth saving.`,
    words: {
      frightened: {
        text: "frightened",
        definition: "Afraid or scared; feeling fear",
        partOfSpeech: "adjective",
        pronunciation: "/ˈfraɪtənd/",
        examples: [
          "Wilbur was frightened when he heard the news.",
          "The frightened child ran to her mother."
        ]
      },
      slaughter: {
        text: "slaughter",
        definition: "To kill animals for food",
        partOfSpeech: "verb",
        pronunciation: "/ˈslɔːtər/",
        examples: [
          "The farmer planned to slaughter the pig.",
          "Animals are slaughtered for meat production."
        ]
      },
      clever: {
        text: "clever",
        definition: "Quick to understand, learn, and devise solutions; intelligent",
        partOfSpeech: "adjective",
        pronunciation: "/ˈklevər/",
        examples: [
          "Charlotte was a clever spider with a good plan.",
          "The clever student solved the puzzle quickly."
        ]
      },
      wove: {
        text: "wove",
        definition: "Past tense of weave; to create fabric or patterns by interlacing threads",
        partOfSpeech: "verb",
        pronunciation: "/woʊv/",
        examples: [
          "Charlotte wove words into her web.",
          "She wove a beautiful blanket from wool."
        ]
      },
      magnificent: {
        text: "magnificent",
        definition: "Extremely beautiful, elaborate, or impressive; splendid",
        partOfSpeech: "adjective",
        pronunciation: "/mæɡˈnɪfɪsənt/",
        examples: [
          "Charlotte wove magnificent words.",
          "The palace was a magnificent building."
        ]
      },
      convincing: {
        text: "convincing",
        definition: "Causing someone to believe that something is true or certain",
        partOfSpeech: "verb",
        pronunciation: "/kənˈvɪnsɪŋ/",
        examples: [
          "Charlotte was convincing everyone of Wilbur's worth.",
          "Her argument was very convincing."
        ]
      }
    }
  };

  const giverStory = {
    title: "The Giver",
    content: `Jonas lived in a seemingly perfect community where everything was controlled and predictable. There was no pain, no war, and no suffering, but there was also no color, no music, and no real emotions. When Jonas turned twelve, he was assigned the extraordinary role of Receiver of Memory. The current Receiver, an elderly man called the Giver, began transmitting memories of the past to Jonas, revealing the truth about his world.`,
    words: {
      seemingly: {
        text: "seemingly",
        definition: "Appearing to be true but not necessarily so; apparently",
        partOfSpeech: "adverb",
        pronunciation: "/ˈsiːmɪŋli/",
        examples: [
          "The community was seemingly perfect.",
          "It was a seemingly simple task that turned out to be difficult."
        ]
      },
      predictable: {
        text: "predictable",
        definition: "Able to be predicted; behaving in a way that is expected",
        partOfSpeech: "adjective",
        pronunciation: "/prɪˈdɪktəbəl/",
        examples: [
          "Life in the community was controlled and predictable.",
          "His reaction was entirely predictable."
        ]
      },
      suffering: {
        text: "suffering",
        definition: "The state of undergoing pain, distress, or hardship",
        partOfSpeech: "noun",
        pronunciation: "/ˈsʌfərɪŋ/",
        examples: [
          "There was no suffering in Jonas's community.",
          "The hospital helps reduce patient suffering."
        ]
      },
      assigned: {
        text: "assigned",
        definition: "Allocated or designated for a particular purpose or person",
        partOfSpeech: "verb",
        pronunciation: "/əˈsaɪnd/",
        examples: [
          "Jonas was assigned the role of Receiver.",
          "Each student was assigned a specific task."
        ]
      },
      extraordinary: {
        text: "extraordinary",
        definition: "Very unusual or remarkable; beyond what is ordinary",
        partOfSpeech: "adjective",
        pronunciation: "/ɪkˈstrɔːrdəneri/",
        examples: [
          "The role of Receiver was extraordinary.",
          "She has an extraordinary talent for music."
        ]
      },
      transmitting: {
        text: "transmitting",
        definition: "Passing or sending something from one place or person to another",
        partOfSpeech: "verb",
        pronunciation: "/trænzˈmɪtɪŋ/",
        examples: [
          "The Giver was transmitting memories to Jonas.",
          "The radio tower is transmitting the signal."
        ]
      },
      revealing: {
        text: "revealing",
        definition: "Making known; showing or disclosing something previously hidden",
        partOfSpeech: "verb",
        pronunciation: "/rɪˈviːlɪŋ/",
        examples: [
          "The memories were revealing the truth.",
          "The document is revealing important information."
        ]
      }
    }
  };

  const harryPotterStory = {
    title: "Harry Potter and the Sorcerer's Stone",
    content: `Harry Potter had lived with the Dursleys for nearly ten years, sleeping in a cupboard under the stairs. The Dursleys were perfectly normal, thank you very much, and they had always pretended that Harry's mother, their late sister, hadn't existed at all. On his eleventh birthday, Harry discovered he was a wizard and was whisked away to Hogwarts School of Witchcraft and Wizardry, where he would embark on magnificent adventures with his new friends Ron and Hermione.`,
    words: {
      cupboard: {
        text: "cupboard",
        definition: "A small storage space or cabinet, usually for food or dishes",
        partOfSpeech: "noun",
        pronunciation: "/ˈkʌbərd/",
        examples: [
          "Harry slept in the cupboard under the stairs.",
          "She kept the plates in the kitchen cupboard."
        ]
      },
      pretended: {
        text: "pretended",
        definition: "Acted as if something is true when it is not; made believe",
        partOfSpeech: "verb",
        pronunciation: "/prɪˈtendɪd/",
        examples: [
          "The Dursleys pretended Harry's mother never existed.",
          "The children pretended to be pirates."
        ]
      },
      wizard: {
        text: "wizard",
        definition: "A person who has magical powers, especially in legends and fairy tales",
        partOfSpeech: "noun",
        pronunciation: "/ˈwɪzərd/",
        examples: [
          "Harry discovered he was a wizard.",
          "The wizard cast a powerful spell."
        ]
      },
      whisked: {
        text: "whisked",
        definition: "Moved or taken somewhere suddenly and quickly",
        partOfSpeech: "verb",
        pronunciation: "/wɪskt/",
        examples: [
          "Harry was whisked away to Hogwarts.",
          "She was whisked off her feet by the news."
        ]
      },
      embark: {
        text: "embark",
        definition: "To begin a journey or start a new experience",
        partOfSpeech: "verb",
        pronunciation: "/ɪmˈbɑːrk/",
        examples: [
          "Harry would embark on magnificent adventures.",
          "They embarked on a trip around the world."
        ]
      },
      magnificent: {
        text: "magnificent",
        definition: "Extremely beautiful, elaborate, or impressive; splendid",
        partOfSpeech: "adjective",
        pronunciation: "/mæɡˈnɪfɪsənt/",
        examples: [
          "Harry's adventures were magnificent.",
          "The castle was a magnificent sight."
        ]
      }
    }
  };

  const wonderStory = {
    title: "Wonder",
    content: `August Pullman was born with a facial difference that prevented him from going to a mainstream school until now. He's about to start fifth grade at Beecher Prep, and if you've ever been the new kid, then you know how hard that can be. The thing is, Auggie's just an ordinary kid with an extraordinary face. But can he convince his new classmates that he's just like them, despite appearances?`,
    words: {
      facial: {
        text: "facial",
        definition: "Relating to the face",
        partOfSpeech: "adjective",
        pronunciation: "/ˈfeɪʃəl/",
        examples: [
          "August had a facial difference.",
          "The doctor examined her facial features."
        ]
      },
      prevented: {
        text: "prevented",
        definition: "Kept something from happening; stopped",
        partOfSpeech: "verb",
        pronunciation: "/prɪˈventɪd/",
        examples: [
          "His condition prevented him from attending school.",
          "The rain prevented us from going outside."
        ]
      },
      mainstream: {
        text: "mainstream",
        definition: "Normal, conventional, or ordinary; what most people do",
        partOfSpeech: "adjective",
        pronunciation: "/ˈmeɪnstriːm/",
        examples: [
          "Auggie is starting at a mainstream school.",
          "The movie appealed to mainstream audiences."
        ]
      },
      ordinary: {
        text: "ordinary",
        definition: "Normal; not special or different in any way",
        partOfSpeech: "adjective",
        pronunciation: "/ˈɔːrdəneri/",
        examples: [
          "Auggie is just an ordinary kid.",
          "It was just an ordinary day."
        ]
      },
      extraordinary: {
        text: "extraordinary",
        definition: "Very unusual or remarkable; beyond what is ordinary",
        partOfSpeech: "adjective",
        pronunciation: "/ɪkˈstrɔːrdəneri/",
        examples: [
          "Auggie had an extraordinary face.",
          "She has extraordinary talent."
        ]
      },
      convince: {
        text: "convince",
        definition: "To make someone believe that something is true",
        partOfSpeech: "verb",
        pronunciation: "/kənˈvɪns/",
        examples: [
          "Auggie wanted to convince his classmates he was just like them.",
          "She tried to convince me to stay."
        ]
      },
      despite: {
        text: "despite",
        definition: "Without being affected by; in spite of",
        partOfSpeech: "preposition",
        pronunciation: "/dɪˈspaɪt/",
        examples: [
          "He wanted acceptance despite appearances.",
          "Despite the rain, we went for a walk."
        ]
      }
    }
  };

  const hobbitStory = {
    title: "The Hobbit",
    content: `In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort. Bilbo Baggins was a respectable hobbit who enjoyed a quiet life until the wizard Gandalf and a company of dwarves arrived at his doorstep, seeking a burglar for their perilous quest to reclaim their treasure from the fearsome dragon Smaug.`,
    words: {
      nasty: {
        text: "nasty",
        definition: "Very unpleasant or disgusting",
        partOfSpeech: "adjective",
        pronunciation: "/ˈnæsti/",
        examples: [
          "Not a nasty, dirty, wet hole.",
          "The medicine had a nasty taste."
        ]
      },
      oozy: {
        text: "oozy",
        definition: "Slowly leaking or giving off a thick liquid",
        partOfSpeech: "adjective",
        pronunciation: "/ˈuːzi/",
        examples: [
          "The hole didn't have an oozy smell.",
          "The mud was oozy and sticky."
        ]
      },
      respectable: {
        text: "respectable",
        definition: "Regarded by society as proper, correct, and good; honorable",
        partOfSpeech: "adjective",
        pronunciation: "/rɪˈspektəbəl/",
        examples: [
          "Bilbo was a respectable hobbit.",
          "She came from a respectable family."
        ]
      },
      burglar: {
        text: "burglar",
        definition: "A person who breaks into buildings to steal things",
        partOfSpeech: "noun",
        pronunciation: "/ˈbɜːrɡlər/",
        examples: [
          "The dwarves sought a burglar for their quest.",
          "The burglar was caught by the police."
        ]
      },
      perilous: {
        text: "perilous",
        definition: "Full of danger or risk",
        partOfSpeech: "adjective",
        pronunciation: "/ˈperələs/",
        examples: [
          "They embarked on a perilous quest.",
          "The journey through the mountains was perilous."
        ]
      },
      reclaim: {
        text: "reclaim",
        definition: "To get back something that was lost or taken away",
        partOfSpeech: "verb",
        pronunciation: "/rɪˈkleɪm/",
        examples: [
          "The dwarves wanted to reclaim their treasure.",
          "He tried to reclaim his reputation."
        ]
      },
      fearsome: {
        text: "fearsome",
        definition: "Frightening, especially in appearance; causing fear",
        partOfSpeech: "adjective",
        pronunciation: "/ˈfɪrsəm/",
        examples: [
          "Smaug was a fearsome dragon.",
          "The warrior had a fearsome reputation."
        ]
      }
    }
  };

  const stories: Record<string, { title: string; content: string; words: Record<string, Word> }> = {
    [littlePrinceStory.title]: littlePrinceStory,
    [charlottesWebStory.title]: charlottesWebStory,
    [giverStory.title]: giverStory,
    [harryPotterStory.title]: harryPotterStory,
    [wonderStory.title]: wonderStory,
    [hobbitStory.title]: hobbitStory,
  };

  const activeStory = (selectedBookTitle && stories[selectedBookTitle]) ? stories[selectedBookTitle] : littlePrinceStory;
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
    definition: activeStory.words[word]?.definition || "",
    partOfSpeech: activeStory.words[word]?.partOfSpeech || "",
    pronunciation: activeStory.words[word]?.pronunciation || "",
    examples: activeStory.words[word]?.examples || [],
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
                <h1 className="text-xl font-bold gradient-text">{activeStory.title}</h1>
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
              progress={Math.round((savedWords.size / Object.keys(activeStory.words).length) * 100)}
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
                content={activeStory.content}
                words={activeStory.words}
                savedWords={savedWords}
                onSaveWord={handleSaveWord}
                className="prose prose-lg max-w-none"
                style={{ fontSize: `${fontSize}px`, lineHeight }}
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => navigate('/')}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Change Story
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Reading Settings
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Reading Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reading Settings</DialogTitle>
            <DialogDescription>
              Customize your reading experience
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Font Size: {fontSize}px</Label>
              <Slider
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
                min={14}
                max={24}
                step={1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Line Height: {lineHeight.toFixed(1)}</Label>
              <Slider
                value={[lineHeight]}
                onValueChange={(value) => setLineHeight(value[0])}
                min={1.4}
                max={2.2}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reading;