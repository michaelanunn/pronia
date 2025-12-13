"use client";

import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, User } from "lucide-react";

const notifications = [
  { icon: Heart, text: "Sarah Chen liked your post", time: "2h ago" },
  { icon: MessageCircle, text: "New comment on your performance", time: "5h ago" },
  { icon: User, text: "Marcus Williams started following you", time: "1d ago" },
  { icon: Heart, text: "Anna Schmidt liked your post", time: "2d ago" },
];

export default function Notifications() {
  return (
    <Layout streak={7}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>
        
        <div className="space-y-3">
          {notifications.map((notif, i) => (
            <Card key={i} className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <notif.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{notif.text}</p>
                <p className="text-sm text-muted-foreground">{notif.time}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}

