"use client";

import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ChevronRight } from "lucide-react";

const settingsGroups = [
  {
    title: "Account",
    items: [
      { label: "Private Profile", type: "switch" },
      { label: "Email", type: "link", value: "emma@example.com" },
    ],
  },
  {
    title: "Notifications",
    items: [
      { label: "Push Notifications", type: "switch" },
      { label: "Email Updates", type: "switch" },
    ],
  },
];

export default function Settings() {
  return (
    <Layout streak={7}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="space-y-6">
          {settingsGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                {group.title}
              </h2>
              <Card className="divide-y divide-border">
                {group.items.map((item) => (
                  <div key={item.label} className="p-4 flex items-center justify-between">
                    <span className="font-medium">{item.label}</span>
                    {item.type === "switch" ? (
                      <Switch />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{item.value}</span>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </Card>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

