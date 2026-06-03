interface SpotifyPodcastProps {
    showId: string;
}

export default function SpotifyPodcast({ showId }: SpotifyPodcastProps) {
    return (
        <section className="bg-mamen-black py-12 md:py-16 border-t-4 border-b-4 border-mamen-lime">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-8">
                    <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black text-mamen-white">
                        LATEST <span className="text-mamen-lime">PODCAST</span>
                    </h2>
                </div>
                <div className="card-frame p-2 bg-mamen-gray-900 border-mamen-lime shadow-hard-lime hover:shadow-[8px_8px_0px_var(--shadow-color)] hover:-translate-y-1 transition-transform">
                    <iframe
                        style={{ borderRadius: "0px" }}
                        src={`https://open.spotify.com/embed/show/${showId}?utm_source=generator&theme=0`}
                        width="100%"
                        height="352"
                        frameBorder="0"
                        allowFullScreen
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                    ></iframe>
                </div>
            </div>
        </section>
    );
}
