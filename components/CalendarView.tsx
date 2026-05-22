import type { EventItem } from "@/types/content";

export interface CalendarViewProps {
  events: EventItem[];
}

export function CalendarView({ events }: CalendarViewProps) {
  if (events.length === 0) {
    return (
      <div className="section">
        <p className="muted">Nenhum evento agendado no momento.</p>
      </div>
    );
  }

  return (
    <div className="calendar-list">
      {events.map((event) => {
        const startDate = new Date(event.startsAt);
        const formattedDate = new Intl.DateTimeFormat("pt-BR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(startDate);

        const monthLabel = new Intl.DateTimeFormat("pt-BR", {
          month: "short",
        })
          .format(startDate)
          .toUpperCase();
        const dayLabel = startDate.getDate();

        return (
          <article key={event.id} className="calendar-event">
            <div className="calendar-date">
              <div className="date-badge">
                <span className="month">{monthLabel}</span>
                <span className="day">{dayLabel}</span>
              </div>
            </div>

            <div className="event-info">
              <h3>{event.title}</h3>
              <p className="event-summary">{event.summary}</p>

              <div className="event-meta">
                <span className="meta-item">
                  <strong>Horário:</strong> {formattedDate}
                </span>
                <span className="meta-item">
                  <strong>Local:</strong> {event.location}
                </span>
                <span className="meta-item">
                  <span className={`tag event-type-${event.eventType}`}>
                    {event.eventType}
                  </span>
                </span>
              </div>

              {event.externalSignupUrl && (
                <a href={event.externalSignupUrl} target="_blank" rel="noreferrer" className="btn btn-sm">
                  Saiba mais
                </a>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
