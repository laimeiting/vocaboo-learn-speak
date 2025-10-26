import { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, Globe, Bell, BellOff, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import GhostAvatar from '@/components/GhostAvatar';
import SpeechBubble from '@/components/SpeechBubble';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { toast as sonnerToast } from 'sonner';

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('soundEnabled');
    return saved ? JSON.parse(saved) : true;
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('notificationsEnabled');
    return saved ? JSON.parse(saved) : true;
  });
  const [translationLanguage, setTranslationLanguage] = useState(() => {
    return localStorage.getItem('translationLanguage') || 'es';
  });
  const [dailyGoal, setDailyGoal] = useState(() => {
    return localStorage.getItem('dailyGoal') || '10';
  });
  const [name, setName] = useState('Alex');
  const [email, setEmail] = useState('alex@example.com');

  const handleSave = () => {
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
    localStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled));
    localStorage.setItem('translationLanguage', translationLanguage);
    localStorage.setItem('dailyGoal', dailyGoal);
    
    toast({
      title: "Settings Saved! 👻",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        sonnerToast.error('Failed to logout');
        return;
      }
      sonnerToast.success('Logged out successfully');
      navigate('/auth');
    } catch (error) {
      sonnerToast.error('An error occurred during logout');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/20 via-secondary-light/15 to-accent-light/20"
         style={{ background: 'var(--gradient-hero)' }}>
      <div className="relative z-10 p-4 max-w-md mx-auto pb-24">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <GhostAvatar size="sm" accessory="hat" className="w-8 h-8" />
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Settings
            </h1>
          </div>

          <div className="w-20" /> {/* Spacer for alignment */}
        </header>

        {/* Intro Message */}
        <div className="mb-6 flex items-start space-x-3">
          <GhostAvatar size="md" variant="happy" floating />
          <SpeechBubble variant="default" position="left" className="flex-1">
            <p className="font-body text-sm">
              Customize your learning experience! ⚙️
            </p>
          </SpeechBubble>
        </div>

        {/* Profile Settings */}
        <Card className="mb-4 backdrop-blur border-0" style={{ background: 'var(--gradient-card)' }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-foreground">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
          </CardContent>
        </Card>

        {/* Learning Preferences */}
        <Card className="mb-4 backdrop-blur border-0" style={{ background: 'var(--gradient-card)' }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-foreground">
              <Globe className="w-5 h-5" />
              <span>Learning Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="translationLanguage">Native Language (for translations)</Label>
              <Select value={translationLanguage} onValueChange={setTranslationLanguage}>
                <SelectTrigger id="translationLanguage">
                  <SelectValue placeholder="Select your language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Spanish (Español)</SelectItem>
                  <SelectItem value="fr">French (Français)</SelectItem>
                  <SelectItem value="de">German (Deutsch)</SelectItem>
                  <SelectItem value="ja">Japanese (日本語)</SelectItem>
                  <SelectItem value="zh">Chinese (中文)</SelectItem>
                  <SelectItem value="pt">Portuguese (Português)</SelectItem>
                  <SelectItem value="it">Italian (Italiano)</SelectItem>
                  <SelectItem value="ru">Russian (Русский)</SelectItem>
                  <SelectItem value="ko">Korean (한국어)</SelectItem>
                  <SelectItem value="ar">Arabic (العربية)</SelectItem>
                  <SelectItem value="hi">Hindi (हिन्दी)</SelectItem>
                  <SelectItem value="nl">Dutch (Nederlands)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyGoal">Daily Goal (minutes)</Label>
              <Select value={dailyGoal} onValueChange={setDailyGoal}>
                <SelectTrigger id="dailyGoal">
                  <SelectValue placeholder="Select daily goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="20">20 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card className="mb-4 backdrop-blur border-0" style={{ background: 'var(--gradient-card)' }}>
          <CardHeader>
            <CardTitle className="text-foreground">App Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                <Label htmlFor="sound" className="cursor-pointer">Sound Effects</Label>
              </div>
              <Switch
                id="sound"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                <Label htmlFor="notifications" className="cursor-pointer">Notifications</Label>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="theme" className="cursor-pointer">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme" className="w-32">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button 
          onClick={handleSave}
          className="w-full"
          size="lg"
        >
          Save Settings
        </Button>

        {/* Logout Button */}
        <Button 
          onClick={handleLogout}
          variant="destructive"
          className="w-full mt-4"
          size="lg"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>

        {/* Account Info */}
        <Card className="mt-4 backdrop-blur border-0" style={{ background: 'var(--gradient-card)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>App Version</span>
              <span>1.0.0</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
