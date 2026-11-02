
"use client";

import { useState } from "react";

export default function LoginPage() {
  const [isSetup, setIsSetup] = useState(false);
  const [name, setName] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const endpoint = isSetup ? "setup" : "login";

      const response = await fetch(
        `http://localhost:5000/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isSetup
              ? { name, email, password }
              : { email, password }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      if (isSetup) {
        setMessage("Admin created successfully! Please login.");
        setIsSetup(false);
        setPassword("");
      } else {
        localStorage.setItem("supportai_token", data.token);
        localStorage.setItem("supportai_admin", JSON.stringify(data.admin));
        window.location.href = "/";
      }
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-xl">
        <div className="mb-7 text-center">
          <div className="mb-3 text-4xl">🎧</div>
          <h1 className="text-3xl font-bold text-sky-400">
            SupportAI
          </h1>
          <p className="mt-2 text-slate-400">
            Admin Control Panel
          </p>
        </div>

        <h2 className="mb-5 text-xl font-semibold">
          {isSetup ? "Create Admin Account" : "Admin Login"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSetup && (
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Admin Name"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-sky-500"
            />
          )}

          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin Email"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-sky-500"
          />

          <input
            required
            minLength={8}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (minimum 8 characters)"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-sky-500"
          />

          {message && (
            <p className="rounded-lg bg-slate-800 p-3 text-sm text-amber-300">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sky-600 p-3 font-semibold hover:bg-sky-500 disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : isSetup
                ? "Create Admin"
                : "Login"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsSetup(!isSetup);
            setMessage("");
          }}
          className="mt-5 w-full text-sm text-sky-400 hover:text-sky-300"
        >
          {isSetup
            ? "Already have an account? Login"
            : "First time? Create Admin Account"}
        </button>
      </div>
    </main>
  );
}
