"use client";

import { Layout } from "@/components/Layout";

export default function Saved() {
  return (
    <Layout streak={7}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Saved Posts</h1>
        
        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-muted rounded" />
          ))}
        </div>
      </div>
    </Layout>
  );
}

