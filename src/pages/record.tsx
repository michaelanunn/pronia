import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Video, Square, Play, Check, SwitchCamera, Timer } from "lucide-react";
import { useState } from "react";

const Record = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [timerDelay, setTimerDelay] = useState<3 | 10>(3);

  const handleStopRecording = () => {
    setIsRecording(false);
    setShowPostForm(true);
  };

  return (
    <Layout streak={7} showBranding={true}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {!showPostForm ? (
          <>
            <Card className="p-6 mb-6">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4 relative">
                <Video className="h-16 w-16 text-muted-foreground" />
                
                {!isRecording && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button variant="outline" size="icon" className="h-9 w-9 bg-background">
                      <SwitchCamera className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-background"
                      onClick={() => setTimerDelay(timerDelay === 3 ? 10 : 3)}
                    >
                      <Timer className="h-4 w-4 mr-1" />
                      {timerDelay}s
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-center">
                <Button
                  size="lg"
                  variant={isRecording ? "destructive" : "default"}
                  className="mb-4 w-full"
                  onClick={() => isRecording ? handleStopRecording() : setIsRecording(true)}
                >
                  {isRecording ? (
                    <>
                      <Square className="mr-2 h-5 w-5" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Start Recording
                    </>
                  )}
                </Button>
                
                <p className="text-sm text-muted-foreground text-center">
                  {isRecording
                    ? "Recording video and audio..."
                    : "Record your performance with video and audio"}
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Recordings</h2>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                    <Play className="h-5 w-5" />
                    <div className="flex-1">
                      <p className="font-medium">Recording {i}</p>
                      <p className="text-sm text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        ) : (
          <>
            <Card className="p-6">
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                  <Play className="h-16 w-16 text-muted-foreground" />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Piece Title</label>
                  <Input placeholder="e.g., Moonlight Sonata" />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Composer</label>
                  <Input placeholder="e.g., Beethoven" />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Caption (optional)</label>
                  <Textarea placeholder="Share your thoughts about this performance..." />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowPostForm(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1">
                    <Check className="mr-2 h-5 w-5" />
                    Post to Profile
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Record;
