"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Piano, Guitar, Mic, User } from "lucide-react";

const instruments = [
  { id: "piano", name: "Piano", icon: Piano },
  { id: "guitar", name: "Guitar", icon: Guitar },
  { id: "violin", name: "Violin", icon: Mic },
  { id: "drums", name: "Drums", icon: Mic },
  { id: "bass", name: "Bass", icon: Guitar },
  { id: "vocals", name: "Vocals", icon: Mic },
];

const popularPieces = [
  { id: 1, title: "Moonlight Sonata", composer: "Beethoven", level: "intermediate" },
  { id: 2, title: "Für Elise", composer: "Beethoven", level: "beginner" },
  { id: 3, title: "Clair de Lune", composer: "Debussy", level: "advanced" },
  { id: 4, title: "Canon in D", composer: "Pachelbel", level: "beginner" },
  { id: 5, title: "La Campanella", composer: "Liszt", level: "professional" },
  { id: 6, title: "Nocturne Op.9 No.2", composer: "Chopin", level: "intermediate" },
  { id: 7, title: "Turkish March", composer: "Mozart", level: "beginner" },
  { id: 8, title: "Prelude in C Major", composer: "Bach", level: "intermediate" },
];

const experienceLevels = [
  { id: "beginner", label: "Beginner", years: "0-2 years" },
  { id: "intermediate", label: "Intermediate", years: "2-5 years" },
  { id: "advanced", label: "Advanced", years: "5+ years" },
  { id: "professional", label: "Professional", years: "" },
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [selectedPieces, setSelectedPieces] = useState<number[]>([]);

  const toggleInstrument = (id: string) => {
    if (selectedInstruments.includes(id)) {
      setSelectedInstruments(selectedInstruments.filter((i) => i !== id));
    } else if (selectedInstruments.length < 3) {
      setSelectedInstruments([...selectedInstruments, id]);
    }
  };

  const togglePiece = (id: number) => {
    if (selectedPieces.includes(id)) {
      setSelectedPieces(selectedPieces.filter((p) => p !== id));
    } else if (selectedPieces.length < 3) {
      setSelectedPieces([...selectedPieces, id]);
    }
  };

  const filteredPieces = experienceLevel
    ? popularPieces.filter((p) => p.level === experienceLevel)
    : popularPieces;

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      router.push("/");
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return name.trim() && username.trim();
      case 2:
        return selectedInstruments.length > 0;
      case 3:
        return selectedPieces.length === 3;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 
          className="text-3xl font-bold text-center mb-8" 
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          PRONIA
        </h1>

        <Card className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-6">Welcome! Let&apos;s get started</h2>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name</label>
                <Input
                  placeholder="Emma Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Username</label>
                <Input
                  placeholder="@emmasmith"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-2">Pick your instruments</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Select up to 3 instruments you play
              </p>
              
              <div className="grid grid-cols-3 gap-3">
                {instruments.map((instrument) => {
                  const Icon = instrument.icon;
                  const isSelected = selectedInstruments.includes(instrument.id);
                  return (
                    <button
                      key={instrument.id}
                      onClick={() => toggleInstrument(instrument.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                        isSelected
                          ? "border-foreground bg-muted"
                          : "border-border hover:border-foreground/50"
                      }`}
                    >
                      <Icon className="h-8 w-8" />
                      <span className="text-xs font-medium">{instrument.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-2">Pick 3 pieces</h2>
              <p className="text-sm text-muted-foreground text-center mb-4">
                What pieces are you working on?
              </p>

              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {experienceLevels.map((level) => (
                  <Button
                    key={level.id}
                    variant={experienceLevel === level.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setExperienceLevel(level.id)}
                    className="whitespace-nowrap"
                  >
                    {level.label}
                  </Button>
                ))}
              </div>
              
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredPieces.map((piece) => {
                  const isSelected = selectedPieces.includes(piece.id);
                  return (
                    <button
                      key={piece.id}
                      onClick={() => togglePiece(piece.id)}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        isSelected
                          ? "border-foreground bg-muted"
                          : "border-border hover:border-foreground/50"
                      }`}
                    >
                      <p className="font-semibold text-sm">{piece.title}</p>
                      <p className="text-xs text-muted-foreground">{piece.composer}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-2">Add profile picture</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Upload a photo or skip for now
              </p>
              
              <div className="flex flex-col items-center gap-4">
                <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-16 w-16 text-muted-foreground" />
                </div>
                <Button variant="outline">Upload Photo</Button>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1"
            >
              {step === 4 ? "All Set" : step === 3 && selectedPieces.length < 3 ? `Selected ${selectedPieces.length}/3` : "Next"}
            </Button>
            {step === 4 && (
              <Button
                variant="ghost"
                onClick={handleNext}
              >
                Skip
              </Button>
            )}
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  i === step ? "bg-foreground" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

