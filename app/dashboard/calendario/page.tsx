import { Metadata } from "next";
import { getCalendarEvents } from "@/services/calendar";
import { CalendarView } from "@/components/CalendarView";

export const metadata: Metadata = {
  title: "Calendário | Dashboard Auxilia",
  description: "Confira a agenda de eventos do Movimento Auxilia",
};

export default async function CalendarPage() {
  const events = await getCalendarEvents();

  return (
    <section className="section">
      <header className="section-header">
        <h2>Calendário de Eventos</h2>
        <p>Acompanhe a agenda de encontros, retiros, missões e formações</p>
      </header>

      <CalendarView events={events} />
    </section>
  );
}
