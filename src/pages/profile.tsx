import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Settings, Share2, User, Music, Flame } from "lucide-react";
import { useState } from "react";

const badges = [
  { icon: Music, color: "text-foreground", isComponent: false },
  { icon: User, color: "text-foreground", isComponent: false },
  { text: "#127", isComponent: true },
  { icon: Flame, color: "text-accent", isComponent: false },
];

const posts = [
  { id: 1, views: "1,234" },
  { id: 2, views: "2,156" },
  { id: 3, views: "987" },
  { id: 4, views: "3,421" },
  { id: 5, views: "1,876" },
  { id: 6, views: "2,543" },
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState("posts");

  return (
    <Layout streak={7}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex justify-end items-center gap-2 mb-4">
          <Button variant="ghost" size="icon">
            <Share2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex justify-center gap-3 mb-6">
            {badges.map((badge, i) => (
              <div
                key={i}
                className="h-12 w-12 rounded-full border-2 border-border bg-background flex items-center justify-center"
              >
                {badge.isComponent ? (
                  <span className="text-xs font-bold">{badge.text}</span>
                ) : (
                  <badge.icon className={`h-5 w-5 ${badge.color}`} />
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center text-center mb-4">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-3">
              <User className="h-12 w-12" />
            </div>
            <h1 className="text-xl font-bold mb-1">Emma Smith</h1>
            <p className="text-sm text-muted-foreground mb-3">@emmasmith</p>
            <p className="text-sm mb-4 px-4">
              Classical pianist | Sharing my musical journey 🎹
            </p>
            <Button variant="outline" className="w-full max-w-xs">Edit Profile</Button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center py-6">
            <div>
              <p className="text-2xl font-bold">24</p>
              <p className="text-xs text-muted-foreground">Mastered</p>
            </div>
            <div>
              <p className="text-2xl font-bold">1.2K</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div>
              <p className="text-2xl font-bold">834</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
          </div>
        </div>

        <div className="flex gap-6 mb-6 border-b border-border justify-center">
          <button
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === "posts"
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("posts")}
          >
            Posts
          </button>
          <button
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === "logs"
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("logs")}
          >
            Logs
          </button>
          <button
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === "liked"
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("liked")}
          >
            Liked
          </button>
        </div>

        {activeTab === "posts" && (
          <div className="grid grid-cols-3 gap-1">
            {posts.map((post) => (
              <div key={post.id} className="aspect-square bg-muted relative group cursor-pointer">
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-white text-xs font-medium">{post.views} views</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "logs" && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-border rounded-lg">
                <h3 className="font-semibold mb-1">Practice Session</h3>
                <p className="text-sm text-muted-foreground">Today at 2:30 PM • 45 minutes</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "liked" && (
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-muted" />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
