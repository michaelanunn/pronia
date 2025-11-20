interface MuseScoreEmbedProps {
  musescoreUrl: string;
  title: string;
}

export default function MuseScoreEmbed({ musescoreUrl, title }: MuseScoreEmbedProps) {
  // Extract score ID from URL like https://musescore.com/user/85429/scores/107786
  const scoreId = musescoreUrl.split('/scores/')[1];
  const userId = musescoreUrl.split('/user/')[1]?.split('/')[0];
  
  return (
    <div className="w-full">
      <iframe
        src={`https://musescore.com/user/${userId}/scores/${scoreId}/embed`}
        width="100%"
        height="600"
        frameBorder="0"
        allowFullScreen
        className="rounded-lg shadow-lg"
        title={`Sheet music for ${title}`}
      />
      <a 
        href={musescoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline mt-2 inline-block"
      >
        View on MuseScore →
      </a>
    </div>
  );
}