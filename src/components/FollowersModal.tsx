import { useState } from "react";
import { X, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UserItem {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  isFollowing: boolean;
}

// Mock data - replace with actual API calls
const mockFollowers: UserItem[] = [
  { id: "1", name: "Sarah Johnson", username: "sarahj", avatar: null, isFollowing: true },
  { id: "2", name: "Mike Chen", username: "mikechen", avatar: null, isFollowing: false },
  { id: "3", name: "Alex Rivera", username: "alexr", avatar: null, isFollowing: true },
  { id: "4", name: "Emily Watson", username: "emilyw", avatar: null, isFollowing: false },
  { id: "5", name: "David Kim", username: "davidk", avatar: null, isFollowing: true },
  { id: "6", name: "Lisa Park", username: "lisap", avatar: null, isFollowing: false },
  { id: "7", name: "James Wilson", username: "jamesw", avatar: null, isFollowing: true },
  { id: "8", name: "Anna Lee", username: "annal", avatar: null, isFollowing: false },
];

const mockFollowing: UserItem[] = [
  { id: "1", name: "Taylor Swift", username: "taylorswift", avatar: null, isFollowing: true },
  { id: "2", name: "John Legend", username: "johnlegend", avatar: null, isFollowing: true },
  { id: "3", name: "Alicia Keys", username: "aliciakeys", avatar: null, isFollowing: true },
  { id: "4", name: "Bruno Mars", username: "brunomars", avatar: null, isFollowing: true },
  { id: "5", name: "Adele", username: "adele", avatar: null, isFollowing: true },
];

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: "followers" | "following";
  followersCount: string;
  followingCount: string;
}

export const FollowersModal = ({
  isOpen,
  onClose,
  initialTab,
  followersCount,
  followingCount,
}: FollowersModalProps) => {
  const [activeTab, setActiveTab] = useState<"followers" | "following">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [followState, setFollowState] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const users = activeTab === "followers" ? mockFollowers : mockFollowing;
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFollowToggle = (userId: string, currentlyFollowing: boolean) => {
    setFollowState((prev) => ({
      ...prev,
      [userId]: prev[userId] !== undefined ? !prev[userId] : !currentlyFollowing,
    }));
  };

  const isUserFollowing = (user: UserItem) => {
    return followState[user.id] !== undefined ? followState[user.id] : user.isFollowing;
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md h-[85vh] sm:h-[70vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 fade-in duration-200 flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="w-8" />
            <h2 className="text-base font-semibold text-gray-900">
              {activeTab === "followers" ? "Followers" : "Following"}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("followers")}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === "followers"
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {followersCount} Followers
              {activeTab === "followers" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("following")}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === "following"
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {followingCount} Following
              {activeTab === "following" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
              )}
            </button>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="h-9 pl-9 bg-gray-100 border-0 rounded-lg text-gray-900 placeholder:text-gray-500 focus:bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* User List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <User className="h-12 w-12 mb-3 text-gray-300" />
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-gray-500">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {user.username}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{user.name}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={isUserFollowing(user) ? "outline" : "default"}
                    className={`h-8 px-4 text-xs font-semibold rounded-lg ${
                      isUserFollowing(user)
                        ? "bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                        : "bg-accent hover:bg-accent/90 text-white border-0"
                    }`}
                    onClick={() => handleFollowToggle(user.id, user.isFollowing)}
                  >
                    {isUserFollowing(user) ? "Following" : "Follow"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;

