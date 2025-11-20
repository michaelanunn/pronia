import { createServerClient } from '@/lib/supabase-server';
import MuseScoreEmbed from '@/components/MuseScoreEmbed';

export default async function PiecePage({ params }: { params: { id: string } }) {
  const supabase = createServerClient();
  
  const { data: piece } = await supabase
    .from('piece_library')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!piece) {
    return <div>Piece not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{piece.title}</h1>
      <p className="text-xl text-gray-600 mb-6">{piece.composer_name}</p>
      
      <div className="mb-6">
        <p>Difficulty: {piece.difficulty}/10</p>
        <p>Key: {piece.key}</p>
        <p>Form: {piece.form}</p>
      </div>

      {piece.musescore_url && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Sheet Music</h2>
          <MuseScoreEmbed 
            musescoreUrl={piece.musescore_url} 
            title={piece.title} 
          />
        </div>
      )}

      <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
        Add to My Repertoire
      </button>
    </div>
  );
}