export interface User {
  id: string;
  name: string;
  email: string;
  color: string;
  avatarUrl?: string;
  spaceId?: string | null;
}

export interface Category {
  _id: string;
  spaceId: string;
  name: string;
  color: string;
  icon: string;
}

export interface SpaceMember {
  _id: string;
  name: string;
  email: string;
  color: string;
  avatarUrl?: string;
}

export interface Space {
  _id: string;
  name: string;
  members: SpaceMember[];
  inviteCode: string;
}

export type ActivityStatus = 'planned' | 'done' | 'cancelled';

export interface Memory {
  rating?: number;
  notes?: string;
  photos?: string[];
}

export type RecurrenceFreq = 'daily' | 'weekly' | 'monthly';

export interface Recurrence {
  freq: RecurrenceFreq;
  interval: number;
  until?: string | null;
}

export interface Activity {
  _id: string;
  spaceId: string;
  title: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
  allDay: boolean;
  categoryId?: string | null;
  color: string;
  createdBy: string;
  status: ActivityStatus;
  reminders?: number[];
  memory?: Memory;
  recurrence?: Recurrence | null;
  exceptions?: string[];
  // Presentes solo en ocurrencias virtuales de una serie recurrente:
  isOccurrence?: boolean;
  masterId?: string;
  masterStart?: string;
  masterEnd?: string;
  occurrenceDate?: string;
}

/** Payload para crear/editar una actividad. */
export interface ActivityInput {
  title: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
  allDay?: boolean;
  categoryId?: string | null;
  color?: string;
  status?: ActivityStatus;
  reminders?: number[];
  memory?: Memory;
  recurrence?: Recurrence | null;
}

export type WishPriority = 'low' | 'medium' | 'high';

export interface WishlistItem {
  _id: string;
  spaceId: string;
  title: string;
  description?: string;
  location?: string;
  categoryId?: string | null;
  color: string;
  createdBy: string;
  priority: WishPriority;
  done: boolean;
  createdAt?: string;
}

/** Payload para crear/editar un deseo. */
export interface WishInput {
  title: string;
  description?: string;
  location?: string;
  categoryId?: string | null;
  color?: string;
  priority?: WishPriority;
  done?: boolean;
}

/** Payload para agendar un deseo (convertirlo en actividad). */
export interface ScheduleWishInput {
  start: string;
  end: string;
  allDay?: boolean;
  title?: string;
  description?: string;
  location?: string;
  categoryId?: string | null;
  color?: string;
}

export type IdeaKind = 'place' | 'watch';

export interface Idea {
  _id: string;
  spaceId: string;
  createdBy: string;
  kind: IdeaKind;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  rating?: number;
  externalId?: string;
  externalUrl?: string;
  extra?: Record<string, unknown>;
  notes?: string;
  done: boolean;
  progress?: { season: number; episode: number };
  ratings?: { userId: string; value: number }[];
  createdAt?: string;
}

/** Resultado normalizado de una busqueda en TMDB o Google Places. */
export interface SearchResult {
  kind: IdeaKind;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  rating?: number;
  externalId?: string;
  externalUrl?: string;
  extra?: Record<string, unknown>;
}

export interface IdeaInput {
  kind: IdeaKind;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  rating?: number;
  externalId?: string;
  externalUrl?: string;
  extra?: Record<string, unknown>;
  notes?: string;
  done?: boolean;
  progress?: { season: number; episode: number };
}

export interface Countdown {
  _id: string;
  spaceId: string;
  createdBy: string;
  title: string;
  date: string;
  icon: string;
  color: string;
  recurring: boolean;
  createdAt?: string;
}

export interface CountdownInput {
  title: string;
  date: string;
  icon?: string;
  color?: string;
  recurring?: boolean;
}

export interface Suggestion {
  title: string;
  description: string;
  category: string;
  estimatedHours: number;
  tip: string;
}

export interface SuggestInput {
  moment?: string;
  vibe?: string;
  budget?: string;
  notes?: string;
}

export interface Stats {
  totalActivities: number;
  memories: number;
  places: number;
  placesVisited: number;
  watchlist: number;
  byCategory: { name: string; color: string; count: number }[];
  byMonth: { month: string; count: number }[];
}

export type GiftOccasion = 'birthday' | 'christmas' | 'other';
export type GiftReserveStatus = 'reserved' | 'bought';

export interface Gift {
  _id: string;
  spaceId: string;
  ownerId: string;
  title: string;
  price?: number;
  url?: string;
  imageUrl?: string;
  occasion: GiftOccasion;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  // Ocultos por el servidor si el regalo es tuyo (la sorpresa):
  reservedBy?: string | null;
  reservedStatus?: GiftReserveStatus | null;
  isOwn?: boolean;
  createdAt?: string;
}

export interface GiftInput {
  title: string;
  price?: number;
  url?: string;
  imageUrl?: string;
  occasion?: GiftOccasion;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}
