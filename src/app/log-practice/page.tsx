"use client";

import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export default function LogPractice() {
  return (
    <Layout streak={7}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Log Practice</h1>

        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Piece</label>
              <input
                type="text"
                placeholder="What did you practice?"
                className="w-full px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Duration</label>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <input
                  type="number"
                  placeholder="Minutes"
                  className="flex-1 px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                rows={4}
                placeholder="How was your practice session?"
                className="w-full px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <Button className="w-full">Save Practice Log</Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

