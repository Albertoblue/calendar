import { useMemo, ComponentType } from 'react';
import {
  Calendar,
  dateFnsLocalizer,
  View,
  SlotInfo,
  Messages,
  CalendarProps,
  Navigate,
} from 'react-big-calendar';
import withDragAndDrop, {
  EventInteractionArgs,
} from 'react-big-calendar/lib/addons/dragAndDrop';
// @ts-ignore -- TimeGrid interno de react-big-calendar no expone tipos; se usa
// para armar una vista personalizada que solo muestra sabado y domingo.
import TimeGrid from 'react-big-calendar/lib/TimeGrid';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Activity } from '../../types';

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales,
});

// Vista personalizada: renderiza solo las columnas de domingo y sabado.
// Al pasar un `range` con esas dos fechas, react-big-calendar omite el resto.
function weekendRange(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 0 }); // domingo
  return [start, addDays(start, 6)]; // [domingo, sabado]
}

const WeekendView: any = (props: any) => (
  <TimeGrid {...props} range={weekendRange(props.date)} eventOffset={15} />
);
WeekendView.range = weekendRange;
WeekendView.navigate = (date: Date, action: any): Date => {
  if (action === Navigate.PREVIOUS) return addDays(date, -7);
  if (action === Navigate.NEXT) return addDays(date, 7);
  return date;
};
WeekendView.title = (date: Date): string => {
  const [start, end] = weekendRange(date);
  return `${format(start, 'd MMM', { locale: es })} - ${format(end, 'd MMM yyyy', { locale: es })}`;
};

const messages: Messages = {
  today: 'Hoy',
  previous: 'Anterior',
  next: 'Siguiente',
  month: 'Mes',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Actividad',
  allDay: 'Todo el dia',
  noEventsInRange: 'No hay actividades en este rango.',
  showMore: (total: number) => `+${total} mas`,
};

interface CalEvent {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource: Activity;
}

const DnDCalendar = withDragAndDrop<CalEvent>(
  Calendar as ComponentType<CalendarProps<CalEvent>>
);

interface Props {
  activities: Activity[];
  date: Date;
  view: View;
  /** Si esta activo, usa la vista de fin de semana (solo domingo y sabado). */
  weekendsOnly?: boolean;
  onView: (view: View) => void;
  onNavigate: (date: Date) => void;
  onSelectActivity: (activity: Activity) => void;
  onSelectSlot: (start: Date, end: Date) => void;
  /** Se suelta un deseo desde el panel sobre un hueco del calendario. */
  onDropWish: (start: Date, end: Date, allDay: boolean) => void;
  /** Se mueve o redimensiona una actividad existente arrastrandola. */
  onMoveActivity: (activity: Activity, start: Date, end: Date, allDay: boolean) => void;
}

export function CalendarCanvas({
  activities,
  date,
  view,
  weekendsOnly,
  onView,
  onNavigate,
  onSelectActivity,
  onSelectSlot,
  onDropWish,
  onMoveActivity,
}: Props) {
  const events = useMemo<CalEvent[]>(
    () =>
      activities.map((a) => {
        const done = a.status === 'done' ? '★ ' : '';
        const recur = a.recurrence || a.isOccurrence ? '🔁 ' : '';
        return {
          title: `${done}${recur}${a.title}`,
          start: new Date(a.start),
          end: new Date(a.end),
          allDay: a.allDay,
          resource: a,
        };
      }),
    [activities]
  );

  const handleInteraction = (args: EventInteractionArgs<CalEvent>) => {
    const activity = args.event.resource;
    onMoveActivity(activity, new Date(args.start), new Date(args.end), Boolean(args.isAllDay));
  };

  return (
    <DnDCalendar
      localizer={localizer}
      culture="es"
      events={events}
      view={weekendsOnly ? 'work_week' : view}
      date={date}
      onView={onView}
      onNavigate={onNavigate}
      views={{ month: true, week: true, day: true, agenda: true, work_week: WeekendView }}
      toolbar={false}
      selectable
      popup
      resizable
      step={30}
      timeslots={2}
      scrollToTime={new Date(1970, 0, 1, 8, 0, 0)}
      messages={messages}
      formats={{
        timeGutterFormat: 'HH:mm',
        dayFormat: 'EEE d',
        weekdayFormat: 'EEEE',
        monthHeaderFormat: 'MMMM yyyy',
        dayHeaderFormat: "EEEE d 'de' MMMM",
        agendaDateFormat: 'EEE d MMM',
        agendaTimeFormat: 'HH:mm',
      }}
      onSelectEvent={(event) => onSelectActivity(event.resource)}
      onSelectSlot={(slot: SlotInfo) => onSelectSlot(slot.start as Date, slot.end as Date)}
      onEventDrop={handleInteraction}
      onEventResize={handleInteraction}
      onDropFromOutside={({ start, end, allDay }) =>
        onDropWish(new Date(start), new Date(end), allDay)
      }
      onDragOver={(e) => e.preventDefault()}
      eventPropGetter={(event) => {
        const color = event.resource.color || '#0F6CBD';
        return {
          style: {
            backgroundColor: color,
            borderColor: color,
            color: '#ffffff',
            borderRadius: '4px',
          },
        };
      }}
      style={{ height: '100%' }}
    />
  );
}
