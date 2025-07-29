import OpenAI from 'openai';

export interface TTSOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number; // 0.25 to 4.0
}

export class TTSService {
  private static audioCache = new Map<string, string>();
  private static currentAudio: HTMLAudioElement | null = null;

  static async generateSpeech(text: string, options: TTSOptions = {}): Promise<string> {
    // Check if API key is available and valid
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your-openai-api-key-here' || apiKey.includes('*')) {
      throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY environment variable with your actual API key.');
    }

    const { voice = 'alloy', speed = 1.0 } = options;
    
    // Create cache key based on text and options
    const cacheKey = `${text}-${voice}-${speed}`;
    
    // Return cached audio if available
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    try {
      // Clean text for better speech (remove markdown, excessive punctuation)
      const cleanText = this.cleanTextForSpeech(text);

      const response = await openai.audio.speech.create({
        model: 'tts-1',
        voice: voice,
        input: cleanText,
        speed: speed,
      });

      // Convert response to blob and create URL
      const audioBlob = new Blob([await response.arrayBuffer()], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Cache the URL
      this.audioCache.set(cacheKey, audioUrl);

      return audioUrl;
    } catch (error: any) {
      console.error('TTS generation failed:', error);
      
      if (error?.status === 429) {
        throw new Error('OpenAI usage limits reached. Please check your billing.');
      }
      
      if (error?.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your API key at https://platform.openai.com/account/api-keys and update your VITE_OPENAI_API_KEY environment variable.');
      }
      
      throw new Error('Failed to generate speech. Please try again.');
    }
  }

  static async speak(text: string, options: TTSOptions = {}): Promise<HTMLAudioElement> {
    const audioUrl = await this.generateSpeech(text, options);
    
    // Stop current audio if playing
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }

    const audio = new Audio(audioUrl);
    this.currentAudio = audio;

    // Clean up when audio ends
    audio.addEventListener('ended', () => {
      if (this.currentAudio === audio) {
        this.currentAudio = null;
      }
    });

    return audio;
  }

  static stopCurrentSpeech(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  static isCurrentlyPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  static getCurrentAudio(): HTMLAudioElement | null {
    return this.currentAudio;
  }

  private static cleanTextForSpeech(text: string): string {
    let cleaned = text;
    
    // Remove markdown formatting
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold
    cleaned = cleaned.replace(/\*(.*?)\*/g, '$1'); // Italic
    cleaned = cleaned.replace(/`(.*?)`/g, '$1'); // Code
    cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, ''); // List items
    cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, ''); // Numbered lists
    cleaned = cleaned.replace(/#{1,6}\s+/g, ''); // Headers
    
    // Replace multiple spaces and newlines with single space
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // Clean up punctuation for better speech flow
    cleaned = cleaned.replace(/([.!?])\s*([.!?])+/g, '$1'); // Multiple punctuation
    cleaned = cleaned.replace(/\s*\.\s*\.\s*\./g, '...'); // Ellipsis
    
    // Add pauses for better speech rhythm
    cleaned = cleaned.replace(/([.!?])\s+([A-Z])/g, '$1 $2'); // Sentence breaks
    cleaned = cleaned.replace(/:\s+/g, ': '); // Colon pauses
    cleaned = cleaned.replace(/;\s+/g, '; '); // Semicolon pauses
    
    return cleaned.trim();
  }

  static clearCache(): void {
    // Revoke all cached URLs to free memory
    this.audioCache.forEach(url => URL.revokeObjectURL(url));
    this.audioCache.clear();
  }

  // Get available voices
  static getAvailableVoices(): { value: string; label: string; description: string }[] {
    return [
      { value: 'alloy', label: 'Alloy', description: 'Neutral, balanced voice' },
      { value: 'echo', label: 'Echo', description: 'Male, clear and confident' },
      { value: 'fable', label: 'Fable', description: 'British accent, storytelling' },
      { value: 'onyx', label: 'Onyx', description: 'Deep, authoritative male' },
      { value: 'nova', label: 'Nova', description: 'Young, energetic female' },
      { value: 'shimmer', label: 'Shimmer', description: 'Soft, gentle female' }
    ];
  }
}
