import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

const currentSongs = [
  { title: "Moonlight Sonata", artist: "Beethoven", progress: 65 },
  { title: "Clair de Lune", artist: "Debussy", progress: 100 },
  { title: "Für Elise", artist: "Beethoven", progress: 40 },
];

const weeklyPractice = [
  { day: "Mon", hours: 1.5 },
  { day: "Tue", hours: 2.0 },
  { day: "Wed", hours: 1.2 },
  { day: "Thu", hours: 2.5 },
  { day: "Fri", hours: 1.8 },
  { day: "Sat", hours: 0.5 },
  { day: "Sun", hours: 3.0 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const maxHours = Math.max(...weeklyPractice.map(d => d.hours));

  return (
    <Layout streak={7}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        <Button 
          size="lg" 
          className="w-full mb-6"
          onClick={() => navigate("/log-practice")}
        >
          Start Practicing
        </Button>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Practice Time</span>
            </div>
            <p className="text-3xl font-bold">12.5h</p>
            <p className="text-xs text-muted-foreground">This week</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Pieces Mastered</span>
            </div>
            <p className="text-3xl font-bold">8</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Practice Songs</span>
            </div>
            <p className="text-3xl font-bold">24</p>
            <p className="text-xs text-muted-foreground">In library</p>
          </Card>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Weekly Practice</h2>
          <div className="flex items-end justify-between gap-2 h-40">
            {weeklyPractice.map((day) => (
              <div key={day.day} className="flex flex-col items-center flex-1 gap-2">
                <div className="w-full bg-muted rounded-t-lg relative" style={{ height: `${(day.hours / maxHours) * 100}%`, minHeight: '8px' }}>
                  <div className="absolute inset-0 bg-foreground rounded-t-lg" />
                </div>
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Currently Mastering</h2>
          <div className="space-y-3">
            {currentSongs.map((song) => (
              <div key={song.title} className="flex items-center gap-4">
                <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Music className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{song.title}</h3>
                  <p className="text-sm text-muted-foreground">{song.artist}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{song.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Spotify Listening</h2>
            <Button variant="outline" size="sm">Connect</Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Connect your Spotify account to import your listening history and discover new pieces to learn.
          </p>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
