"use client";

import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Journal() {
  return (
    <Layout streak={7}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Journal</h1>
          <Button size="icon">
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <h3 className="font-semibold mb-2">Practice Reflection</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Today&apos;s session focused on improving my left hand technique...
              </p>
              <p className="text-xs text-muted-foreground">2 days ago</p>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}

