export type ContentStatus = "draft" | "published";

export type BaseContentItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  featured?: boolean;
  status: ContentStatus;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
};

export type NewsItem = BaseContentItem & {
  type: "news";
  author?: string;
  coverImage?: string;
  content: string;
};

export type EventItem = BaseContentItem & {
  type: "event";
  location: string;
  audience: string;
  startsAt: string;
  endsAt?: string;
  externalSignupUrl?: string;
  eventType: "retiro" | "missao" | "formacao" | "oratorio" | "adoracao" | "outro";
};

export type SongItem = BaseContentItem & {
  type: "song";
  lyrics: string;
  songType: "hino" | "adoracao" | "animacao" | "oracao" | "outro";
  youtubeUrl?: string;
  spotifyUrl?: string;
};

export type SpiritualContentItem = BaseContentItem & {
  type: "spiritual";
  content: string;
  spiritualType: "evangelho" | "reflexao" | "oracao" | "formacao" | "mensagem";
};

export type AdminUserRole = "editor" | "publisher" | "admin";

export type SupportedCollection = "noticias" | "eventos" | "musicas" | "espiritualidades";
