import type UserConfig from '@11ty/eleventy/UserConfig';

type Defaults = typeof import('./defaultConfig.json');

/**
 * Eleventy types `directories` as a bare `object`; this names the members
 * the plugin reads from it. Every project passes a plain `UserConfig`, which
 * is assignable to this type.
 */
export interface EleventyDirectories {
  input?: string;
  includes?: string;
  layouts?: string;
}

export type PluginConfig = UserConfig & { directories?: EleventyDirectories };

export type SiteConfig = Defaults['site'];

export interface NavigationItem {
  label: string;
  url: string;
  icon: string;
}

export type NavigationConfig = Record<
  keyof Defaults['navigation'],
  NavigationItem[]
> &
  Record<string, NavigationItem[]>;

export type PracticeArea = Defaults['practiceAreas'][number];

/**
 * The fully merged theme config: the defaults with a project's options
 * applied, plus the icon search path the plugin entrypoint assembles.
 */
export interface ResolvedConfig extends Omit<Defaults, 'navigation'> {
  navigation: NavigationConfig;
  iconDirs: string[];
}

/**
 * What a project passes to the plugin. Objects merge deep over the
 * defaults and arrays concatenate, so every piece is optional.
 */
export interface DecisionRecordsOptions {
  site?: Partial<SiteConfig>;
  navigation?: Partial<NavigationConfig>;
  practiceAreas?: PracticeArea[];
  dirs?: Partial<Defaults['dirs']>;
  iconDirs?: string[];
}

export interface AdrData {
  title: string;
  date: Date | string;
  status: string;
  topics?: string[];
  contributors?: string[];
  practiceArea?: string;
  context?: string;
}

export interface AdrItem {
  data: AdrData;
  date: Date;
  page: {
    url: string;
    inputPath: string;
  };
  content: string;
}

export interface TopicCount {
  label: string;
  count: number;
}

export interface CollectionApi {
  getFilteredByGlob(glob: string | string[]): AdrItem[];
}
