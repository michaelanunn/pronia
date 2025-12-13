import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Filter, Search, Play, Plus } from "lucide-react";
import { useState } from "react";

const pieces = [
  {
    id: 1,
    title: "Moonlight Sonata",
    artist: "Ludwig van Beethoven",
    status: "In Progress",
    progress: 65,
  },
  {
    id: 2,
    title: "Clair de Lune",
    artist: "Claude Debussy",
    status: "Mastered",
    progress: 100,
  },
  {
    id: 3,
    title: "Für Elise",
    artist: "Ludwig van Beethoven",
    status: "In Progress",
    progress: 40,
  },
];

const Library = () => {
  const [filter, setFilter] = useState("all");

  return (
    <Layout streak={7}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Library</h1>
          <Button variant="ghost" size="icon">
            <Filter className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "progress" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("progress")}
          >
            In Progress
          </Button>
          <Button
            variant={filter === "mastered" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("mastered")}
          >
            Mastered
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search your library..."
            className="w-full pl-10 pr-4 py-3 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-3">
          {pieces.map((piece) => (
            <Card key={piece.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Play className="h-6 w-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{piece.title}</h3>
                  <p className="text-sm text-muted-foreground">{piece.artist}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent transition-all"
                        style={{ width: `${piece.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{piece.progress}%</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button className="w-full mt-6 gap-2">
          <Plus className="h-5 w-5" />
          Add New Piece
        </Button>
      </div>
    </Layout>
  );
};

export default Library;
