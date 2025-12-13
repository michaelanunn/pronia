"use client";

import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Search, Music, User } from "lucide-react";
import { useState } from "react";

const mockResults = {
  pieces: [
    { id: 1, title: "Liszt - La Campanella", composer: "Franz Liszt" },
    { id: 2, title: "Hungarian Rhapsody No. 2", composer: "Franz Liszt" },
    { id: 3, title: "Liebestraum No. 3", composer: "Franz Liszt" },
  ],
  users: [
    { id: 1, name: "Lisa Chen", username: "@lisachen", followers: "2.4k" },
    { id: 2, name: "John Lister", username: "@johnlister", followers: "1.8k" },
  ],
};

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(true);
    }
  };

  return (
    <Layout streak={7}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search composers, users, pieces..."
              className="pl-10 bg-muted/50 border-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </form>

        {showResults && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Music className="h-5 w-5" />
                Pieces
              </h2>
              <div className="space-y-2">
                {mockResults.pieces.map((piece) => (
                  <div
                    key={piece.id}
                    className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  >
                    <p className="font-semibold">{piece.title}</p>
                    <p className="text-sm text-muted-foreground">{piece.composer}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <User className="h-5 w-5" />
                Users
              </h2>
              <div className="space-y-2">
                {mockResults.users.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer flex items-center gap-3"
                  >
                    <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center">
                      <User className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.username}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.followers} followers</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!showResults && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Search for composers, users, or pieces</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

