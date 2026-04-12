import { notFound } from "next/navigation";
import { getSongs } from "@/services/content";

export default async function MusicaDetalhe({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const songs = await getSongs();
  const item = songs.find((entry) => entry.slug === slug);

  if (!item) return notFound();

  return (
    <main className="section">
      <article className="content-detail">
        <span className="tag">{item.songType}</span>
        <h1>{item.title}</h1>
        <p>{item.summary}</p>
        <pre className="lyrics">{item.lyrics}</pre>
        <div className="cta-row">
          {item.youtubeUrl ? (
            <a href={item.youtubeUrl} target="_blank" rel="noreferrer" className="text-link">
              Ouvir no YouTube
            </a>
          ) : null}
          {item.spotifyUrl ? (
            <a href={item.spotifyUrl} target="_blank" rel="noreferrer" className="text-link">
              Ouvir no Spotify
            </a>
          ) : null}
        </div>
      </article>
    </main>
  );
}
