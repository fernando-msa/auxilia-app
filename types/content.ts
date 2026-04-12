export type ContentStatus = "draft" | "published" | "archived";

export type BaseContentItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  coverImage?: string;
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
  content: string;
};

export type EventLifecycleStatus = "upcoming" | "ongoing" | "finished";

export type EventItem = BaseContentItem & {
  type: "event";
  location: string;
  audience: string;
  startsAt: string;
  endsAt?: string;
  externalSignupUrl?: string;
  eventType: "retiro" | "missao" | "formacao" | "oratorio" | "adoracao" | "outro";
  lifecycleStatus?: EventLifecycleStatus;
};

export type EventPreSignup = {
  id: string;
  eventId: string;
  eventSlug: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
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

export type OfficialNotice = {
  id: string;
  title: string;
  message: string;
  level: "info" | "warning" | "important";
  status: ContentStatus;
  startsAt?: string;
  endsAt?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminUserRole = "editor" | "publisher" | "admin";

export type SupportedCollection =
  | "noticias"
  | "eventos"
  | "musicas"
  | "espiritualidades"
  | "avisos_oficiais";
