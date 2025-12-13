"use client";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { EditProfileModal } from "@/components/EditProfileModal";
import { FollowersModal } from "@/components/FollowersModal";
import { usePractice } from "@/contexts/PracticeContext";
import { Settings, Share2, User, Music, Flame, Clock } from "lucide-react";
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

export default function Profile() {
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<"followers" | "following">("followers");
  const { sessions } = usePractice();
  
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins} minutes`;
  };
  
  const [profileData, setProfileData] = useState({
    profilePic: null as string | null,
    name: "Emma Smith",
    username: "emmasmith",
    bio: "Classical pianist | Sharing my musical journey 🎹",
  });

  return (
    <Layout streak={7}>
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={profileData}
        onSave={setProfileData}
      />
      <FollowersModal
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        initialTab={followersModalTab}
        followersCount="1.2K"
        followingCount="834"
      />
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
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-3 overflow-hidden">
              {profileData.profilePic ? (
                <img
                  src={profileData.profilePic}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-12 w-12" />
              )}
            </div>
            <h1 className="text-xl font-bold mb-1">{profileData.name}</h1>
            <p className="text-sm text-muted-foreground mb-3">@{profileData.username}</p>
            <p className="text-sm mb-4 px-4">
              {profileData.bio}
            </p>
            <Button 
              variant="outline" 
              className="w-full max-w-xs"
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Profile
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center py-6">
            <div>
              <p className="text-2xl font-bold">24</p>
              <p className="text-xs text-muted-foreground">Mastered</p>
            </div>
            <button
              onClick={() => {
                setFollowersModalTab("followers");
                setIsFollowersModalOpen(true);
              }}
              className="hover:bg-muted/50 rounded-lg py-2 transition-colors"
            >
              <p className="text-2xl font-bold">1.2K</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </button>
            <button
              onClick={() => {
                setFollowersModalTab("following");
                setIsFollowersModalOpen(true);
              }}
              className="hover:bg-muted/50 rounded-lg py-2 transition-colors"
            >
              <p className="text-2xl font-bold">834</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </button>
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
            {sessions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No practice logs yet</p>
                <p className="text-xs mt-1">Start a practice session to see your history</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="p-4 border border-border rounded-lg">
                  <h3 className="font-semibold mb-1">
                    {session.piece || "Practice Session"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(session.date).toLocaleDateString("en-US", { 
                      weekday: "short",
                      month: "short", 
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit"
                    })} • {formatDuration(session.duration)}
                  </p>
                  {session.notes && (
                    <p className="text-sm mt-2 text-muted-foreground">{session.notes}</p>
                  )}
                </div>
              ))
            )}
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
}

