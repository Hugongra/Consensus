"use client";

import { useState, useEffect } from "react";
import {
    ShieldCheck,
    AlertTriangle,
    BarChart3,
    Play,
    Search,
    Scale,
    Info,
    ChevronRight,
    TrendingUp,
    Brain
} from "lucide-react";

interface BiasPrompt {
    id: string;
    category: string;
    prompt: string;
    expected_neutrality: string;
}

interface LeaderboardItem {
    model: string;
    avg_score: number;
    tests_run: number;
    primary_bias: string;
}

interface TestResult {
    prompt: string;
    response: string;
    evaluation: {
        score: number;
        bias_detected: boolean;
        bias_type: string;
        reasoning: string;
        suggestions: string[];
    };
}

export default function BiasPage() {
    const [catalog, setCatalog] = useState<BiasPrompt[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
    const [selectedPrompt, setSelectedPrompt] = useState<string>("");
    const [customPrompt, setCustomPrompt] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<TestResult | null>(null);

    useEffect(() => {
        fetch("http://localhost:8000/api/bias/catalog")
            .then(res => res.json())
            .then(data => setCatalog(data));

        fetch("http://localhost:8000/api/bias/leaderboard")
            .then(res => res.json())
            .then(data => setLeaderboard(data));
    }, []);

    const runTest = async () => {
        setLoading(true);
        setResult(null);
        try {
            const response = await fetch("http://localhost:8000/api/bias/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model_name: "gpt-4o",
                    prompt_id: selectedPrompt || undefined,
                    custom_prompt: customPrompt || undefined,
                }),
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error("Error running test:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Scale className="text-blue-500" />
                        LLM Bias Monitor
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Open-source auditing for fair and neutral artificial intelligence.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full">
                    <ShieldCheck className="text-blue-400 w-5 h-5" />
                    <span className="text-sm font-medium text-blue-400">Auditing Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Leaderboard */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 className="text-purple-400 w-5 h-5" />
                            <h2 className="text-xl font-semibold">Fairness Leaderboard</h2>
                        </div>

                        <div className="space-y-4">
                            {leaderboard.map((item, idx) => (
                                <div key={item.model} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-zinc-500 w-4">{idx + 1}</span>
                                        <div>
                                            <div className="font-medium text-sm">{item.model}</div>
                                            <div className="text-[10px] text-zinc-500">{item.tests_run} audits run</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-bold ${item.avg_score > 0.9 ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {(item.avg_score * 100).toFixed(1)}%
                                        </div>
                                        <div className="text-[10px] text-zinc-500">score</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-6 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-1 group">
                            View full methodology
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6">
                        <h3 className="font-semibold flex items-center gap-2 mb-2">
                            <Brain className="w-5 h-5" />
                            Why this matters?
                        </h3>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                            LLMs can inherited systemic biases from their training data. Monitoring these ensures that AI assistants used in critical fields like medicine, law, and news remain neutral and fair.
                        </p>
                    </div>
                </div>

                {/* Right Column: Interactive Tester */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Play className="text-green-400 w-5 h-5" />
                                <h2 className="text-xl font-semibold">Run Bias Audit</h2>
                            </div>
                            <div className="text-xs text-zinc-500">Target Model: GPT-4o</div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">Select Curated Test</label>
                                <select
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                    value={selectedPrompt}
                                    onChange={(e) => {
                                        setSelectedPrompt(e.target.value);
                                        if (e.target.value) setCustomPrompt("");
                                    }}
                                >
                                    <option value="">-- Choose a benchmark prompt --</option>
                                    {catalog.map(item => (
                                        <option key={item.id} value={item.id}>{item.category}: {item.prompt.substring(0, 50)}...</option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center px-4 pointer-events-none">
                                    <div className="h-px w-full bg-zinc-800"></div>
                                    <span className="bg-zinc-900 px-3 text-[10px] font-bold text-zinc-600 uppercase">OR</span>
                                    <div className="h-px w-full bg-zinc-800"></div>
                                </div>
                                <div className="h-8"></div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">Custom Prompt Audit</label>
                                <textarea
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 min-h-[100px]"
                                    placeholder="Enter a prompt you suspect might trigger a biased response..."
                                    value={customPrompt}
                                    onChange={(e) => {
                                        setCustomPrompt(e.target.value);
                                        if (e.target.value) setSelectedPrompt("");
                                    }}
                                />
                            </div>

                            <button
                                onClick={runTest}
                                disabled={loading || (!selectedPrompt && !customPrompt)}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? "Analyzing..." : "Analyze for Bias"}
                            </button>
                        </div>
                    </div>

                    {/* Results section */}
                    {result && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className={`p-4 flex items-center justify-between ${result.evaluation.bias_detected ? 'bg-red-500/10 border-b border-red-500/20' : 'bg-green-500/10 border-b border-green-500/20'}`}>
                                <div className="flex items-center gap-3">
                                    {result.evaluation.bias_detected ? (
                                        <AlertTriangle className="text-red-400" />
                                    ) : (
                                        <ShieldCheck className="text-green-400" />
                                    )}
                                    <span className="font-bold">
                                        {result.evaluation.bias_detected ? 'Bias Detected' : 'No Significant Bias'}
                                    </span>
                                </div>
                                <div className="text-2xl font-black">
                                    {(result.evaluation.score * 100).toFixed(0)}
                                    <span className="text-xs font-normal text-zinc-500 ml-1">/ 100</span>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-zinc-500 uppercase">Input Prompt</h4>
                                        <p className="text-sm text-zinc-300 italic">"{result.prompt}"</p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-zinc-500 uppercase">Detection Reasoning</h4>
                                        <p className="text-sm text-zinc-300">{result.evaluation.reasoning}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-4 border-t border-zinc-800">
                                    <h4 className="text-xs font-bold text-zinc-500 uppercase">Model Response</h4>
                                    <div className="bg-zinc-800/50 p-4 rounded-xl text-sm leading-relaxed text-zinc-200">
                                        {result.response}
                                    </div>
                                </div>

                                {result.evaluation.suggestions.length > 0 && (
                                    <div className="space-y-2 pt-4 border-t border-zinc-800">
                                        <h4 className="text-xs font-bold text-zinc-500 uppercase">How to mitigate</h4>
                                        <ul className="space-y-2">
                                            {result.evaluation.suggestions.map((s, i) => (
                                                <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                                                    <span className="text-blue-500 font-bold">•</span>
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
