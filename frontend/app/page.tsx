"use client";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [waitlistStatus, setWaitlistStatus] = useState("");
  const [productType, setProductType] = useState("Vintage Graphic T-Shirt");
  const [features, setFeatures] = useState("Distressed skull logo, 100% organic cotton, acid wash");
  const [demoResult, setDemoResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaitlistStatus("Encrypting protocol...");
    try {
      const res = await fetch(`${API_URL}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setWaitlistStatus("Access granted. You are on the list.");
      else setWaitlistStatus("Error. Might already be registered.");
    } catch {
      setWaitlistStatus("Network anomaly detected.");
    }
  };

  const handleDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDemoResult(null);
    try {
      const res = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_type: productType, key_features: features }),
      });
      const json = await res.json();
      setDemoResult(JSON.parse(json.data));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-mono">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24">
        <span className="text-emerald-400 text-sm tracking-widest uppercase mb-4">AI-Powered Listings</span>
        <h1 className="text-5xl font-bold mb-4">ListingForge</h1>
        <p className="text-slate-400 text-xl max-w-xl mb-10">
          Generate high-converting product titles, descriptions, and SEO tags for your Print-on-Demand store in seconds.
        </p>
        <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <input
            type="email"
            required
            placeholder="Enter your email for early access"
            className="flex-1 px-4 py-3 rounded bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded transition-all">
            Get Access
          </button>
        </form>
        {waitlistStatus && <p className="mt-3 text-emerald-400 text-sm">{waitlistStatus}</p>}
      </section>

      {/* Demo */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold mb-6 text-center">Live Demo</h2>
        <form onSubmit={handleDemo} className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
          <div>
            <label className="text-slate-400 text-sm block mb-1">Product Type</label>
            <input
              type="text"
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="w-full px-4 py-2 rounded bg-slate-950 border border-slate-700 focus:border-emerald-500 text-slate-200 outline-none"
            />
          </div>
          <div>
            <label className="text-slate-400 text-sm block mb-1">Key Features</label>
            <input
              type="text"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              className="w-full px-4 py-2 rounded bg-slate-950 border border-slate-700 focus:border-emerald-500 text-slate-200 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold rounded transition-all"
          >
            {loading ? "Generating..." : "Generate Listing"}
          </button>
        </form>

        {demoResult && (
          <div className="mt-6 bg-slate-900 border border-slate-700 rounded-lg p-6 space-y-4">
            <div>
              <p className="text-emerald-400 text-xs mb-1">// Title</p>
              <p className="text-white font-semibold">{demoResult.title}</p>
            </div>
            <div>
              <p className="text-emerald-400 text-xs mb-1">// Description</p>
              <p className="text-slate-300 whitespace-pre-line">{demoResult.description}</p>
            </div>
            <div>
              <p className="text-emerald-400 text-xs mb-1">// SEO Tags</p>
              <p className="text-slate-400 text-sm">{demoResult.tags}</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
