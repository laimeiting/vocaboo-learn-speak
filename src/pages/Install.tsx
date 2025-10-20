import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Download } from 'lucide-react';

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Capture the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-accent/20">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Install Vocaboo</CardTitle>
          <CardDescription>
            Get quick access to Vocaboo by installing it on your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isInstalled ? (
            <div className="text-center py-4">
              <p className="text-success font-medium">✓ App is already installed!</p>
              <p className="text-sm text-muted-foreground mt-2">
                You can find Vocaboo on your home screen
              </p>
            </div>
          ) : deferredPrompt ? (
            <>
              <Button 
                onClick={handleInstallClick} 
                className="w-full"
                size="lg"
              >
                <Download className="mr-2 h-5 w-5" />
                Install App
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Install Vocaboo to use it offline and get a native app experience
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To install this app on your device:
              </p>
              <div className="space-y-2 text-sm">
                <p className="font-medium">On iPhone:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Tap the Share button in Safari</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" in the top right</li>
                </ol>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium">On Android:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Tap the menu (3 dots) in Chrome</li>
                  <li>Tap "Install app" or "Add to Home screen"</li>
                  <li>Tap "Install"</li>
                </ol>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Install;
