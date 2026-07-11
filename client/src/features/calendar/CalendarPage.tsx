import { useEffect, useRef, useState, Dispatch, SetStateAction } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Spinner,
  makeStyles,
  tokens,
  MessageBar,
  MessageBarBody,
  Button,
  Toaster,
} from '@fluentui/react-components';
import { View } from 'react-big-calendar';
import {
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  addHours,
  endOfDay,
} from 'date-fns';
import { useAuth } from '../auth/AuthContext';
import { fetchCurrentSpace } from '../../api/spaces';
import {
  fetchActivities,
  fetchMemories,
  createActivity,
  updateActivity,
  deleteActivity,
  addException,
  detachOccurrence,
} from '../../api/activities';
import { fetchWishlist, createWish, updateWish, deleteWish, scheduleWish } from '../../api/wishlist';
import {
  fetchCountdowns,
  createCountdown,
  updateCountdown,
  deleteCountdown,
} from '../../api/countdowns';
import { monthRange } from '../../lib/dateRange';
import { updateCategory } from '../../api/categories';
import { useIsMobile } from '../../lib/useIsMobile';
import { sortByProximity } from '../../lib/countdown';
import {
  Activity,
  ActivityInput,
  Countdown,
  CountdownInput,
  Idea,
  Memory,
  Suggestion,
  WishInput,
  WishlistItem,
} from '../../types';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { CalendarCanvas } from './CalendarCanvas';
import { ActivityDialog } from '../activities/ActivityDialog';
import { ActivityDetailDialog } from '../activities/ActivityDetailDialog';
import { RecurrenceScopeDialog, RecurrenceScope } from '../activities/RecurrenceScopeDialog';
import { WishlistPanel } from '../wishlist/WishlistPanel';
import { WishDialog } from '../wishlist/WishDialog';
import { MemoriesGallery } from '../memories/MemoriesGallery';
import { MemoryDialog } from '../memories/MemoryDialog';
import { ReminderEngine, REMINDER_TOASTER_ID } from '../reminders/ReminderEngine';
import { useRealtime } from '../realtime/useRealtime';
import { IdeasHub } from '../ideas/IdeasHub';
import { CountdownsPanel } from '../countdowns/CountdownsPanel';
import { CountdownDialog } from '../countdowns/CountdownDialog';
import { SuggestHub } from '../suggest/SuggestHub';
import { HistoryHub } from '../history/HistoryHub';
import { GiftsHub } from '../gifts/GiftsHub';

const useStyles = makeStyles({
  shell: { height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  body: { flex: 1, display: 'flex', minHeight: 0 },
  canvas: {
    flex: 1,
    minWidth: 0,
    padding: '12px',
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground2,
    '@media (max-width: 768px)': { padding: '6px' },
  },
  center: { display: 'grid', placeItems: 'center', height: '100vh', gap: '12px' },
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 1000,
  },
  drawerLeft: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 1001,
    display: 'flex',
    boxShadow: tokens.shadow28,
  },
  drawerRight: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 1001,
    display: 'flex',
    boxShadow: tokens.shadow28,
  },
});

function shift(date: Date, view: View, dir: 1 | -1): Date {
  if (view === 'day') return dir > 0 ? addDays(date, 1) : subDays(date, 1);
  if (view === 'week') return dir > 0 ? addWeeks(date, 1) : subWeeks(date, 1);
  return dir > 0 ? addMonths(date, 1) : subMonths(date, 1);
}

interface DialogState {
  open: boolean;
  activity: Activity | null;
  slot: { start: Date; end: Date } | null;
  initial: Partial<ActivityInput> | null;
  wishId: string | null;
  heading?: string;
  submitLabel?: string;
  // Si esta presente, al guardar se desprende una ocurrencia (editar solo esta).
  detach?: { masterId: string; occurrenceDate: string } | null;
}

const CLOSED_DIALOG: DialogState = {
  open: false,
  activity: null,
  slot: null,
  initial: null,
  wishId: null,
};

export function CalendarPage() {
  const styles = useStyles();
  const { user, logout } = useAuth();
  const qc = useQueryClient();
  useRealtime(true);
  const isMobile = useIsMobile();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<View>(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches ? 'day' : 'week'
  );
  const [activeMembers, setActiveMembers] = useState<Set<string>>(new Set());
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<DialogState>(CLOSED_DIALOG);
  const [detail, setDetail] = useState<Activity | null>(null);
  const [showWishlist, setShowWishlist] = useState(false);
  const [wishDialog, setWishDialog] = useState<{ open: boolean; wish: WishlistItem | null }>({
    open: false,
    wish: null,
  });
  const draggedWish = useRef<WishlistItem | null>(null);
  const [showMemories, setShowMemories] = useState(false);
  const [memoryDialog, setMemoryDialog] = useState<{ open: boolean; activity: Activity | null }>({
    open: false,
    activity: null,
  });
  const [scopePrompt, setScopePrompt] = useState<{
    activity: Activity;
    action: 'edit' | 'delete';
  } | null>(null);
  const [showIdeas, setShowIdeas] = useState(false);
  const [showCountdowns, setShowCountdowns] = useState(false);
  const [countdownDialog, setCountdownDialog] = useState<{
    open: boolean;
    countdown: Countdown | null;
  }>({ open: false, countdown: null });
  const [showSuggest, setShowSuggest] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showGifts, setShowGifts] = useState(false);

  const spaceQuery = useQuery({ queryKey: ['space'], queryFn: fetchCurrentSpace });

  const range = monthRange(currentDate);
  const activitiesQuery = useQuery({
    queryKey: ['activities', range.from, range.to],
    queryFn: () => fetchActivities(range.from, range.to),
    enabled: spaceQuery.isSuccess,
  });
  const wishlistQuery = useQuery({
    queryKey: ['wishlist'],
    queryFn: fetchWishlist,
    enabled: spaceQuery.isSuccess,
  });
  const memoriesQuery = useQuery({
    queryKey: ['memories'],
    queryFn: fetchMemories,
    enabled: spaceQuery.isSuccess && showMemories,
  });
  const countdownsQuery = useQuery({
    queryKey: ['countdowns'],
    queryFn: fetchCountdowns,
    enabled: spaceQuery.isSuccess,
  });
  // Proximas 48h, refrescadas cada minuto, para la campana y el motor de recordatorios.
  const upcomingQuery = useQuery({
    queryKey: ['upcoming'],
    queryFn: () =>
      fetchActivities(new Date().toISOString(), addDays(new Date(), 2).toISOString()),
    enabled: spaceQuery.isSuccess,
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (spaceQuery.data) {
      setActiveMembers(new Set(spaceQuery.data.space.members.map((m) => m._id)));
      setActiveCategories(new Set(spaceQuery.data.categories.map((c) => c._id)));
    }
  }, [spaceQuery.data]);

  const invalidateActs = () => {
    qc.invalidateQueries({ queryKey: ['activities'] });
    qc.invalidateQueries({ queryKey: ['upcoming'] });
  };
  const invalidateWish = () => qc.invalidateQueries({ queryKey: ['wishlist'] });
  const closeDialog = () => setDialog(CLOSED_DIALOG);
  const closeWishDialog = () => setWishDialog({ open: false, wish: null });

  // --- Mutations de actividades ---
  const createMut = useMutation({
    mutationFn: createActivity,
    onSuccess: () => { invalidateActs(); closeDialog(); },
  });
  const updateMut = useMutation({
    mutationFn: (v: { id: string; data: Partial<ActivityInput> }) => updateActivity(v.id, v.data),
    onSuccess: () => { invalidateActs(); closeDialog(); },
  });
  // Para mover/redimensionar arrastrando (sin cerrar dialogos).
  const moveMut = useMutation({
    mutationFn: (v: { id: string; data: Partial<ActivityInput> }) => updateActivity(v.id, v.data),
    onSuccess: invalidateActs,
  });
  const deleteMut = useMutation({
    mutationFn: deleteActivity,
    onSuccess: () => { invalidateActs(); setDetail(null); },
  });
  const detachMut = useMutation({
    mutationFn: (v: {
      masterId: string;
      payload: Partial<ActivityInput> & { occurrenceDate: string };
    }) => detachOccurrence(v.masterId, v.payload),
    onSuccess: () => {
      invalidateActs();
      qc.invalidateQueries({ queryKey: ['memories'] });
      closeDialog();
      setScopePrompt(null);
      setDetail(null);
      setMemoryDialog({ open: false, activity: null });
    },
  });
  const addExceptionMut = useMutation({
    mutationFn: (v: { masterId: string; occurrenceDate: string }) =>
      addException(v.masterId, v.occurrenceDate),
    onSuccess: () => {
      invalidateActs();
      setScopePrompt(null);
      setDetail(null);
    },
  });

  // --- Mutations de lista de deseos ---
  const scheduleWishMut = useMutation({
    mutationFn: (v: { id: string; data: Parameters<typeof scheduleWish>[1] }) =>
      scheduleWish(v.id, v.data),
    onSuccess: () => { invalidateActs(); invalidateWish(); closeDialog(); },
  });
  const createWishMut = useMutation({
    mutationFn: createWish,
    onSuccess: () => { invalidateWish(); closeWishDialog(); },
  });
  const updateWishMut = useMutation({
    mutationFn: (v: { id: string; data: Partial<WishInput> }) => updateWish(v.id, v.data),
    onSuccess: () => { invalidateWish(); closeWishDialog(); },
  });
  const deleteWishMut = useMutation({ mutationFn: deleteWish, onSuccess: invalidateWish });

  // --- Mutation de recuerdos ---
  const saveMemoryMut = useMutation({
    mutationFn: (v: { id: string; memory: Memory }) =>
      updateActivity(v.id, { status: 'done', memory: v.memory }),
    onSuccess: () => {
      invalidateActs();
      qc.invalidateQueries({ queryKey: ['memories'] });
      setMemoryDialog({ open: false, activity: null });
    },
  });

  // --- Mutations de fechas clave ---
  const invalidateCountdowns = () => qc.invalidateQueries({ queryKey: ['countdowns'] });
  const closeCountdownDialog = () => setCountdownDialog({ open: false, countdown: null });
  const createCountdownMut = useMutation({
    mutationFn: createCountdown,
    onSuccess: () => { invalidateCountdowns(); closeCountdownDialog(); },
  });
  const updateCountdownMut = useMutation({
    mutationFn: (v: { id: string; data: Partial<CountdownInput> }) => updateCountdown(v.id, v.data),
    onSuccess: () => { invalidateCountdowns(); closeCountdownDialog(); },
  });
  const deleteCountdownMut = useMutation({
    mutationFn: deleteCountdown,
    onSuccess: invalidateCountdowns,
  });

  // --- Categorias ---
  const updateCategoryMut = useMutation({
    mutationFn: (v: { id: string; color: string }) => updateCategory(v.id, { color: v.color }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['space'] }),
  });

  if (spaceQuery.isLoading) {
    return <div className={styles.center}><Spinner label="Cargando tu calendario..." /></div>;
  }
  if (spaceQuery.isError || !spaceQuery.data) {
    return (
      <div className={styles.center}>
        <MessageBar intent="error"><MessageBarBody>No se pudo cargar tu espacio.</MessageBarBody></MessageBar>
        <Button onClick={logout}>Cerrar sesion</Button>
      </div>
    );
  }

  const { space, categories } = spaceQuery.data;
  const members = space.members;

  const activities = (activitiesQuery.data ?? []).filter(
    (a) => activeMembers.has(a.createdBy) && (!a.categoryId || activeCategories.has(a.categoryId))
  );

  const toggle = (setter: Dispatch<SetStateAction<Set<string>>>, id: string) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // --- Handlers de actividades ---
  const openNewActivity = (slot: { start: Date; end: Date } | null = null) =>
    setDialog({ ...CLOSED_DIALOG, open: true, slot });

  const handleSubmit = (input: ActivityInput, id?: string) => {
    if (dialog.detach) {
      detachMut.mutate({
        masterId: dialog.detach.masterId,
        payload: { ...input, occurrenceDate: dialog.detach.occurrenceDate },
      });
    } else if (id) {
      updateMut.mutate({ id, data: input });
    } else if (dialog.wishId) {
      scheduleWishMut.mutate({ id: dialog.wishId, data: input });
    } else {
      createMut.mutate(input);
    }
  };

  const handleMoveActivity = (activity: Activity, start: Date, end: Date, allDay: boolean) => {
    // Mover/redimensionar una ocurrencia la desprende de la serie (solo esa cambia).
    if (activity.isOccurrence && activity.masterId && activity.occurrenceDate) {
      detachMut.mutate({
        masterId: activity.masterId,
        payload: {
          occurrenceDate: activity.occurrenceDate,
          title: activity.title,
          description: activity.description,
          location: activity.location,
          categoryId: activity.categoryId,
          color: activity.color,
          allDay,
          status: activity.status,
          reminders: activity.reminders,
          start: start.toISOString(),
          end: end.toISOString(),
        },
      });
    } else {
      moveMut.mutate({
        id: activity._id,
        data: { start: start.toISOString(), end: end.toISOString(), allDay },
      });
    }
  };

  // Editar/borrar: si es recurrente, primero preguntar el alcance.
  const requestEdit = (activity: Activity) => {
    setDetail(null);
    if (activity.isOccurrence || activity.recurrence) {
      setScopePrompt({ activity, action: 'edit' });
    } else {
      setDialog({ ...CLOSED_DIALOG, open: true, activity });
    }
  };

  const requestDelete = (activity: Activity) => {
    if (activity.isOccurrence || activity.recurrence) {
      setDetail(null);
      setScopePrompt({ activity, action: 'delete' });
    } else {
      deleteMut.mutate(activity._id);
    }
  };

  const resolveScope = (scope: RecurrenceScope) => {
    if (!scopePrompt) return;
    const a = scopePrompt.activity;
    setScopePrompt(null);

    if (scopePrompt.action === 'delete') {
      if (scope === 'series') deleteMut.mutate(a.masterId ?? a._id);
      else if (a.masterId && a.occurrenceDate)
        addExceptionMut.mutate({ masterId: a.masterId, occurrenceDate: a.occurrenceDate });
      return;
    }

    // Editar
    if (scope === 'series') {
      const master: Activity = a.isOccurrence
        ? {
            ...a,
            _id: a.masterId ?? a._id,
            start: a.masterStart ?? a.start,
            end: a.masterEnd ?? a.end,
            isOccurrence: false,
            occurrenceDate: undefined,
            masterId: undefined,
          }
        : a;
      setDialog({ ...CLOSED_DIALOG, open: true, activity: master, heading: 'Editar la serie' });
    } else if (a.masterId && a.occurrenceDate) {
      setDialog({
        ...CLOSED_DIALOG,
        open: true,
        activity: { ...a, isOccurrence: false },
        detach: { masterId: a.masterId, occurrenceDate: a.occurrenceDate },
        heading: 'Editar solo esta ocurrencia',
        submitLabel: 'Guardar esta',
      });
    }
  };

  // --- Handlers de lista de deseos ---
  const openScheduleFromWish = (wish: WishlistItem) =>
    setDialog({
      ...CLOSED_DIALOG,
      open: true,
      wishId: wish._id,
      heading: 'Agendar deseo',
      submitLabel: 'Agendar',
      initial: {
        title: wish.title,
        description: wish.description,
        location: wish.location,
        categoryId: wish.categoryId ?? null,
        color: wish.color,
      },
    });

  const scheduleIdea = (idea: Idea) => {
    setShowIdeas(false);
    setDialog({
      ...CLOSED_DIALOG,
      open: true,
      heading: idea.kind === 'place' ? 'Agendar salida' : 'Agendar noche de peli',
      initial: {
        title: idea.title,
        location: idea.kind === 'place' ? idea.subtitle : undefined,
        description: idea.notes,
      },
    });
  };

  const handleCountdownSubmit = (input: CountdownInput, id?: string) => {
    if (id) updateCountdownMut.mutate({ id, data: input });
    else createCountdownMut.mutate(input);
  };

  // --- Sugeridor de planes con IA ---
  const matchCategory = (name: string) =>
    categories.find((c) => c.name.toLowerCase() === name.trim().toLowerCase()) ?? null;

  const suggestionText = (s: Suggestion) =>
    s.tip ? `${s.description}\n\n💡 ${s.tip}` : s.description;

  const scheduleSuggestion = (s: Suggestion) => {
    setShowSuggest(false);
    const cat = matchCategory(s.category);
    setDialog({
      ...CLOSED_DIALOG,
      open: true,
      heading: 'Agendar plan sugerido',
      initial: {
        title: s.title,
        description: suggestionText(s),
        categoryId: cat?._id ?? null,
        color: cat?.color,
      },
    });
  };

  const suggestionToWishlist = (s: Suggestion) => {
    const cat = matchCategory(s.category);
    createWishMut.mutate({
      title: s.title,
      description: suggestionText(s),
      categoryId: cat?._id ?? null,
      color: cat?.color ?? '#0F6CBD',
      priority: 'medium',
    });
  };

  const handleDropWish = (start: Date, end: Date, allDay: boolean) => {
    const wish = draggedWish.current;
    if (!wish) return;
    draggedWish.current = null;
    const finalEnd = allDay ? endOfDay(start) : end <= start ? addHours(start, 1) : end;
    scheduleWishMut.mutate({
      id: wish._id,
      data: { start: start.toISOString(), end: finalEnd.toISOString(), allDay },
    });
  };

  const handleWishSubmit = (input: WishInput, id?: string) => {
    if (id) updateWishMut.mutate({ id, data: input });
    else createWishMut.mutate(input);
  };

  const toggleWishDone = (wish: WishlistItem) =>
    updateWishMut.mutate({ id: wish._id, data: { done: !wish.done } });

  // --- Handlers de recuerdos ---
  const openMemoryDialog = (activity: Activity) => {
    setDetail(null);
    setMemoryDialog({ open: true, activity });
  };
  const handleSaveMemory = (id: string, memory: Memory) => {
    const act = memoryDialog.activity;
    if (act?.isOccurrence && act.masterId && act.occurrenceDate) {
      detachMut.mutate({
        masterId: act.masterId,
        payload: {
          occurrenceDate: act.occurrenceDate,
          title: act.title,
          description: act.description,
          location: act.location,
          categoryId: act.categoryId,
          color: act.color,
          allDay: act.allDay,
          reminders: act.reminders,
          start: act.start,
          end: act.end,
          status: 'done',
          memory,
        },
      });
    } else {
      saveMemoryMut.mutate({ id, memory });
    }
  };

  const countdowns = countdownsQuery.data ?? [];
  const nextCountdown = countdowns.length > 0 ? sortByProximity(countdowns)[0] : null;

  const detailCategory = detail ? categories.find((c) => c._id === detail.categoryId) ?? null : null;
  const detailAuthor = detail
    ? detail.createdBy === user?.id
      ? 'ti'
      : members.find((m) => m._id === detail.createdBy)?.name ?? 'tu pareja'
    : '';

  // Props comunes del Sidebar y la Wishlist (se reutilizan en desktop e en el drawer movil).
  const sidebarProps = {
    currentDate,
    spaceName: space.name,
    inviteCode: space.inviteCode,
    currentUserId: user?.id ?? '',
    members,
    categories,
    activeMembers,
    activeCategories,
    onToggleMember: (id: string) => toggle(setActiveMembers, id),
    onToggleCategory: (id: string) => toggle(setActiveCategories, id),
    onChangeCategoryColor: (id: string, color: string) =>
      updateCategoryMut.mutate({ id, color }),
    nextCountdown,
    onOpenCountdowns: () => setShowCountdowns(true),
  };

  const wishlistProps = {
    items: wishlistQuery.data ?? [],
    categories,
    loading: wishlistQuery.isLoading,
    onClose: () => setShowWishlist(false),
    onAdd: () => setWishDialog({ open: true, wish: null }),
    onEdit: (w: WishlistItem) => setWishDialog({ open: true, wish: w }),
    onDelete: (id: string) => deleteWishMut.mutate(id),
    onSchedule: openScheduleFromWish,
    onToggleDone: toggleWishDone,
    onDragStart: (w: WishlistItem) => {
      draggedWish.current = w;
    },
    onDragEnd: () => {
      draggedWish.current = null;
    },
  };

  return (
    <div className={styles.shell}>
      <TopBar
        userName={user?.name ?? ''}
        view={view}
        date={currentDate}
        wishlistOpen={showWishlist}
        upcomingActivities={upcomingQuery.data ?? []}
        onNewActivity={() => openNewActivity()}
        onToday={() => setCurrentDate(new Date())}
        onPrev={() => setCurrentDate((d) => shift(d, view, -1))}
        onNext={() => setCurrentDate((d) => shift(d, view, 1))}
        onViewChange={setView}
        onToggleWishlist={() => setShowWishlist((v) => !v)}
        onOpenMemories={() => setShowMemories(true)}
        onOpenIdeas={() => setShowIdeas(true)}
        onOpenCountdowns={() => setShowCountdowns(true)}
        onOpenSuggest={() => setShowSuggest(true)}
        onOpenHistory={() => setShowHistory(true)}
        onOpenGifts={() => setShowGifts(true)}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onLogout={logout}
      />

      <div className={styles.body}>
        {!isMobile && sidebarOpen && <Sidebar {...sidebarProps} onDateChange={setCurrentDate} />}

        <main className={styles.canvas}>
          <CalendarCanvas
            activities={activities}
            date={currentDate}
            view={view}
            onView={setView}
            onNavigate={setCurrentDate}
            onSelectActivity={setDetail}
            onSelectSlot={(start, end) => openNewActivity({ start, end })}
            onDropWish={handleDropWish}
            onMoveActivity={handleMoveActivity}
          />
        </main>

        {showWishlist && !isMobile && <WishlistPanel {...wishlistProps} />}

        {/* Movil: Sidebar como panel deslizable con fondo oscuro */}
        {isMobile && sidebarOpen && (
          <>
            <div className={styles.backdrop} onClick={() => setSidebarOpen(false)} />
            <div className={styles.drawerLeft}>
              <Sidebar
                {...sidebarProps}
                onDateChange={(d) => {
                  setCurrentDate(d);
                  setSidebarOpen(false);
                }}
              />
            </div>
          </>
        )}

        {/* Movil: Lista de deseos como panel deslizable */}
        {isMobile && showWishlist && (
          <>
            <div className={styles.backdrop} onClick={() => setShowWishlist(false)} />
            <div className={styles.drawerRight}>
              <WishlistPanel {...wishlistProps} />
            </div>
          </>
        )}
      </div>

      <ActivityDialog
        open={dialog.open}
        onClose={closeDialog}
        categories={categories}
        activity={dialog.activity}
        slot={dialog.slot}
        initial={dialog.initial}
        heading={dialog.heading}
        submitLabel={dialog.submitLabel}
        allowRecurrence={!dialog.detach}
        onSubmit={handleSubmit}
        busy={
          createMut.isPending ||
          updateMut.isPending ||
          scheduleWishMut.isPending ||
          detachMut.isPending
        }
      />

      <WishDialog
        open={wishDialog.open}
        onClose={closeWishDialog}
        categories={categories}
        wish={wishDialog.wish}
        onSubmit={handleWishSubmit}
        busy={createWishMut.isPending || updateWishMut.isPending}
      />

      <ActivityDetailDialog
        activity={detail}
        category={detailCategory}
        authorName={detailAuthor}
        onClose={() => setDetail(null)}
        onEdit={requestEdit}
        onDelete={requestDelete}
        onMakeMemory={openMemoryDialog}
        busy={deleteMut.isPending || detachMut.isPending || addExceptionMut.isPending}
      />

      <RecurrenceScopeDialog
        open={Boolean(scopePrompt)}
        action={scopePrompt?.action ?? 'edit'}
        onClose={() => setScopePrompt(null)}
        onChoose={resolveScope}
      />

      <MemoryDialog
        open={memoryDialog.open}
        activity={memoryDialog.activity}
        onClose={() => setMemoryDialog({ open: false, activity: null })}
        onSave={handleSaveMemory}
        busy={saveMemoryMut.isPending}
      />

      <MemoriesGallery
        open={showMemories}
        memories={memoriesQuery.data ?? []}
        categories={categories}
        loading={memoriesQuery.isLoading}
        onClose={() => setShowMemories(false)}
        onEdit={(a) => setMemoryDialog({ open: true, activity: a })}
      />

      <IdeasHub
        open={showIdeas}
        onClose={() => setShowIdeas(false)}
        members={members}
        currentUserId={user?.id ?? ''}
        onSchedule={scheduleIdea}
      />

      <HistoryHub open={showHistory} onClose={() => setShowHistory(false)} categories={categories} />

      <GiftsHub
        open={showGifts}
        onClose={() => setShowGifts(false)}
        members={members}
        currentUserId={user?.id ?? ''}
      />

      <SuggestHub
        open={showSuggest}
        onClose={() => setShowSuggest(false)}
        onSchedule={scheduleSuggestion}
        onAddToWishlist={suggestionToWishlist}
      />

      <CountdownsPanel
        open={showCountdowns}
        countdowns={countdowns}
        loading={countdownsQuery.isLoading}
        onClose={() => setShowCountdowns(false)}
        onAdd={() => setCountdownDialog({ open: true, countdown: null })}
        onEdit={(c) => setCountdownDialog({ open: true, countdown: c })}
        onDelete={(id) => deleteCountdownMut.mutate(id)}
      />

      <CountdownDialog
        open={countdownDialog.open}
        countdown={countdownDialog.countdown}
        onClose={closeCountdownDialog}
        onSubmit={handleCountdownSubmit}
        busy={createCountdownMut.isPending || updateCountdownMut.isPending}
      />

      <Toaster toasterId={REMINDER_TOASTER_ID} position="top-end" />
      <ReminderEngine activities={upcomingQuery.data ?? []} />
    </div>
  );
}
