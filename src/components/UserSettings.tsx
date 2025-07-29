import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { getUserPreferences, saveUserPreferences } from "@/lib/userContext";
import { Settings, User, MessageCircle, Globe, Heart, Volume2 } from "lucide-react";
import { useNotifications } from "@/components/NotificationSystem";
import { Switch } from "@/components/ui/switch";
import { TTSService } from "@/lib/tts";

export const UserSettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState(getUserPreferences);
  const notifications = useNotifications();

  const handleSave = () => {
    saveUserPreferences(preferences);
    setIsOpen(false);
    notifications.success(
      "Preferences Saved",
      "Your preferences have been updated and will be applied to future conversations."
    );
  };

  const handleResetToDefault = () => {
    const defaultPrefs = {
      preferredLanguage: 'armenian' as const,
      responseStyle: 'family-like' as const,
      armenianUsage: 'frequent' as const,
      armenianScript: 'transliteration' as const,
      culturalDepth: 'moderate' as const,
      armenianLevel: 'native' as const,
      name: '',
      location: '',
      techBackground: '',
      interests: [],
      ttsEnabled: true,
      ttsAutoSpeak: false,
      ttsVoice: 'alloy' as const,
      ttsSpeed: 1.0
    };
    setPreferences(defaultPrefs);
    notifications.info(
      "Reset to Defaults",
      "All preferences have been reset to their default values."
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          Preferences
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            HagopAI Preferences
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal" className="gap-2">
              <User className="h-4 w-4" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="language" className="gap-2">
              <Globe className="h-4 w-4" />
              Language
            </TabsTrigger>
            <TabsTrigger value="style" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Style
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-2">
              <Volume2 className="h-4 w-4" />
              Voice
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={preferences.name || ''}
                  onChange={(e) => setPreferences(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Armen, Anahit, Hagop..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={preferences.location || ''}
                  onChange={(e) => setPreferences(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Los Angeles, Beirut, Yerevan, Boston..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="techBackground">Professional Background</Label>
                <Input
                  id="techBackground"
                  value={preferences.techBackground || ''}
                  onChange={(e) => setPreferences(prev => ({ ...prev, techBackground: e.target.value }))}
                  placeholder="e.g., Software Engineer, Teacher, Student, Doctor..."
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="language" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Armenian Language Level</Label>
                <Select
                  value={preferences.armenianLevel}
                  onValueChange={(value: any) => setPreferences(prev => ({ ...prev, armenianLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="native">Native Speaker - Fluent in Western Armenian</SelectItem>
                    <SelectItem value="advanced">Advanced - Comfortable with complex conversations</SelectItem>
                    <SelectItem value="learning">Learning - Actively studying Armenian</SelectItem>
                    <SelectItem value="basic">Basic - Simple words and phrases only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Armenian Usage in Responses</Label>
                <Select
                  value={preferences.armenianUsage}
                  onValueChange={(value: any) => setPreferences(prev => ({ ...prev, armenianUsage: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="armenian-only">Armenian Only - Respond primarily in Western Armenian</SelectItem>
                    <SelectItem value="frequent">Frequent - Use Armenian words and phrases often</SelectItem>
                    <SelectItem value="occasional">Occasional - Mix in Armenian naturally</SelectItem>
                    <SelectItem value="none">None - English only, please</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Armenian Text Format</Label>
                <Select
                  value={preferences.armenianScript}
                  onValueChange={(value: any) => setPreferences(prev => ({ ...prev, armenianScript: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transliteration">English Letters - "parev", "shnorhakaloutyoun"</SelectItem>
                    <SelectItem value="armenian-letters">Armenian Letters - "Պարեւ", "շնորհակալություն"</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Overall Language Preference</Label>
                <Select
                  value={preferences.preferredLanguage}
                  onValueChange={(value: any) => setPreferences(prev => ({ ...prev, preferredLanguage: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="armenian">Primarily Armenian</SelectItem>
                    <SelectItem value="mixed">Mix Armenian & English</SelectItem>
                    <SelectItem value="english">Primarily English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Response Style</Label>
                <Select
                  value={preferences.responseStyle}
                  onValueChange={(value: any) => setPreferences(prev => ({ ...prev, responseStyle: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family-like">Family-like - Warm and familial, like a beloved cousin</SelectItem>
                    <SelectItem value="elder-like">Elder-like - Wise and nurturing, like a respected Armenian elder</SelectItem>
                    <SelectItem value="casual">Casual - Relaxed and friendly, like talking to a peer</SelectItem>
                    <SelectItem value="formal">Formal - Respectful and professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cultural Knowledge Depth</Label>
                <Select
                  value={preferences.culturalDepth}
                  onValueChange={(value: any) => setPreferences(prev => ({ ...prev, culturalDepth: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scholarly">Scholarly - Deep academic and historical analysis</SelectItem>
                    <SelectItem value="deep">Deep - Rich cultural context and insights</SelectItem>
                    <SelectItem value="moderate">Moderate - Balanced cultural references</SelectItem>
                    <SelectItem value="minimal">Minimal - Light, accessible cultural touches</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="my-4" />

              <div className="text-sm text-muted-foreground">
                <Heart className="h-4 w-4 inline mr-2" />
                These preferences help me understand how to communicate with you in a way that feels most comfortable and culturally appropriate.
              </div>
            </div>
          </TabsContent>

          <TabsContent value="voice" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="tts-enabled">Enable Text-to-Speech</Label>
                  <p className="text-sm text-muted-foreground">Allow HagopAI to speak responses aloud</p>
                </div>
                <Switch
                  id="tts-enabled"
                  checked={preferences.ttsEnabled ?? true}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, ttsEnabled: checked }))}
                />
              </div>

              {preferences.ttsEnabled && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="tts-auto-speak">Auto-Speak AI Responses</Label>
                      <p className="text-sm text-muted-foreground">Automatically speak new AI messages</p>
                    </div>
                    <Switch
                      id="tts-auto-speak"
                      checked={preferences.ttsAutoSpeak ?? false}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, ttsAutoSpeak: checked }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Voice Selection</Label>
                    <Select
                      value={preferences.ttsVoice || 'alloy'}
                      onValueChange={(value: any) => setPreferences(prev => ({ ...prev, ttsVoice: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TTSService.getAvailableVoices().map((voice) => (
                          <SelectItem key={voice.value} value={voice.value}>
                            <div>
                              <div className="font-medium">{voice.label}</div>
                              <div className="text-xs text-muted-foreground">{voice.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Speech Speed</Label>
                    <Select
                      value={String(preferences.ttsSpeed || 1.0)}
                      onValueChange={(value) => setPreferences(prev => ({ ...prev, ttsSpeed: parseFloat(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">0.5× (Slow)</SelectItem>
                        <SelectItem value="0.75">0.75× (Slower)</SelectItem>
                        <SelectItem value="1.0">1× (Normal)</SelectItem>
                        <SelectItem value="1.25">1.25× (Faster)</SelectItem>
                        <SelectItem value="1.5">1.5× (Fast)</SelectItem>
                        <SelectItem value="2.0">2× (Very Fast)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                    <Volume2 className="h-4 w-4 inline mr-2" />
                    Voice features are powered by OpenAI's advanced text-to-speech technology. Usage may count towards your OpenAI API quota.
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleResetToDefault}
            className="text-muted-foreground hover:text-destructive"
          >
            Reset to Default
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-gradient-armenian text-white">
              Save Preferences
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
