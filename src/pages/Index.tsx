import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import VocabooMascot from '@/components/VocabooMascot';
import { BookOpen, Headphones, Film, Star, Zap, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <VocabooMascot mood="celebrating" size="lg" />
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 font-heading">
              Learn English Through
              <span className="block text-secondary">Stories, Shows & Songs</span>
            </h1>
            
            <p className="text-xl lg:text-2xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
              Discover new words naturally while enjoying your favorite content. 
              Tap, learn, and master English in a fun, gamified way! 🎉
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/reading">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Start Reading
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10">
                <Star className="w-5 h-5 mr-2" />
                Try for Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Categories */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 gradient-text">
              Choose Your Learning Adventure
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Engage with interactive content that makes learning English enjoyable and effective
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Books */}
            <Card className="p-6 lg:p-8 card-hover border-primary/10">
              <div className="bg-gradient-primary rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Interactive Books</h3>
              <p className="text-muted-foreground mb-4">
                Read engaging stories with tap-to-translate functionality. Perfect for building vocabulary through context.
              </p>
              <Link to="/reading">
                <Button variant="outline" className="w-full">
                  Explore Stories
                </Button>
              </Link>
            </Card>

            {/* Shows */}
            <Card className="p-6 lg:p-8 card-hover border-primary/10">
              <div className="bg-gradient-secondary rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Film className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Shows & Movies</h3>
              <p className="text-muted-foreground mb-4">
                Watch with smart subtitles. Learn from real conversations and natural expressions.
              </p>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </Card>

            {/* Music */}
            <Card className="p-6 lg:p-8 card-hover border-primary/10">
              <div className="bg-gradient-success rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Headphones className="w-6 h-6 text-success-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Songs & Lyrics</h3>
              <p className="text-muted-foreground mb-4">
                Learn through music with interactive lyrics and karaoke-style practice sessions.
              </p>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why Vocaboo Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Our method combines entertainment with effective learning techniques
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Definitions</h3>
              <p className="text-muted-foreground text-sm">
                Tap any word to see meanings, pronunciation, and examples instantly
              </p>
            </div>

            <div className="text-center">
              <div className="bg-secondary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Progress</h3>
              <p className="text-muted-foreground text-sm">
                Track your learning with streaks, badges, and personalized goals
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Social Learning</h3>
              <p className="text-muted-foreground text-sm">
                Share word lists and compete with friends in fun challenges
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <Card className="p-8 lg:p-12 text-center bg-gradient-primary text-primary-foreground border-0">
            <VocabooMascot mood="encouraging" size="md" />
            <div className="mt-6">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                Ready to Transform Your English Learning?
              </h2>
              <p className="text-lg mb-6 text-primary-foreground/90">
                Join thousands of learners who are mastering English through content they love
              </p>
              <Link to="/reading">
                <Button variant="secondary" size="lg">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Start Your Journey
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
