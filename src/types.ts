export type LanguageMode = 'id' | 'en' | 'bilingual';

export type VoicePersona = 'Kore' | 'Leda' | 'Puck' | 'Fenrir' | 'Aoede' | 'Charon';

export interface VoiceProfile {
  id: VoicePersona;
  name: string;
  title: string;
  description: string;
  avatar: string;
  gender: 'female' | 'male' | 'fairy';
  accentColor: string;
  pitch: number;
  rate: number;
  elevenVoiceId: string;
  sampleSentence: string;
}

export type TargetAge = 'toddler' | 'early' | 'middle' | 'preteen';

export type SceneSetting =
  | 'enchanted-forest'
  | 'starry-sky'
  | 'underwater-coral'
  | 'village-morning'
  | 'cozy-bedroom'
  | 'futuristic-city'
  | 'cloud-kingdom'
  | 'mountain-river'
  | 'magical-library'
  | 'sunny-meadow';

export interface StoryCharacter {
  name: string;
  role: string;
  traits: string;
  emoji: string;
}

export interface StoryPage {
  pageNumber: number;
  sceneTitle: string;
  narrativeText: string;
  englishTranslation?: string;
  dialogue?: string;
  interactiveQuestion: string;
  activityPrompt: string;
  sceneSetting: SceneSetting | string;
  colorPalette: string;
  illustrationPrompt: string;
  imageUrl?: string;
}

export interface StoryCover {
  visualDescription: string;
  sceneSetting: SceneSetting | string;
  colorPalette: string;
  imageUrl?: string;
}

export interface StoryBook {
  id: string;
  title: string;
  tagline: string;
  moralLesson: string;
  readingTimeMinutes: number;
  targetAgeGroup: string;
  genre: string;
  artStyle: string;
  characters: StoryCharacter[];
  cover: StoryCover;
  pages: StoryPage[];
  createdAt: string;
  isCustom?: boolean;
}

export interface StoryGenerationParams {
  topic: string;
  language: LanguageMode;
  targetAge: TargetAge;
  genre: string;
  artStyle: string;
  moralTheme: string;
  characters: StoryCharacter[];
  pageCount: number;
  customNotes?: string;
}
