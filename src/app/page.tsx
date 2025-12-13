"use client";

import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Share2, Play, Search, Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const posts = [
  {
    id: 1,
    user: "John Smith",
    username: "@johnsmith",
    piece: "Moonlight Sonata",
    composer: "Beethoven",
    time: "2h ago",
    likes: 89,
    comments: 12,
  },
  {
    id: 2,
    user: "Emma Wilson",
    username: "@emmawilson",
    piece: "La Campanella",
    composer: "Liszt",
    time: "5h ago",
    likes: 156,
    comments: 24,
  },
  {
    id: 3,
    user: "Sarah Chen",
    username: "@sarahchen",
    piece: "Clair de Lune",
    composer: "Debussy",
    time: "1d ago",
    likes: 234,
    comments: 45,
  },
];

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you");

  return (
    <Layout streak={7}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search composers, users, pieces..."
              className="pl-10 bg-muted/50 border-0"
              onFocus={() => router.push("/explore")}
            />
          </div>

          <div className="flex items-center justify-center gap-8 border-b border-border">
            <button
              className={`pb-3 px-1 text-sm font-medium transition-colors ${
                activeTab === "for-you"
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("for-you")}
            >
              For You
            </button>
            <button
              className={`pb-3 px-1 text-sm font-medium transition-colors ${
                activeTab === "following"
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("following")}
            >
              Following
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <div className="p-3 pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">{post.user}</span>{" "}
                      <span className="text-muted-foreground">{post.username}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{post.time}</p>
                  </div>
                </div>
              </div>

              <div className="aspect-square bg-muted relative group cursor-pointer">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-xl bg-black/80 flex items-center justify-center">
                    <Play className="h-8 w-8 text-white fill-white" />
                  </div>
                </div>
              </div>
              
              <div className="p-3">
                <div className="mb-2">
                  <p className="font-semibold text-sm">{post.piece}</p>
                  <p className="text-xs text-muted-foreground">{post.composer}</p>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="gap-1.5 h-8 px-2">
                    <Heart className="h-4 w-4" />
                    <span className="text-xs">{post.likes}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1.5 h-8 px-2">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">{post.comments}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2 ml-auto">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}

