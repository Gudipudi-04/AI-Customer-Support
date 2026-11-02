
"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Analytics from "./components/Analytics";

type Ticket = {
  _id: string;
  customerName: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  assignedAgent: string;
  createdAt?: string;
};

const API = "http://localhost:5000/api/tickets";

export default function Home() {
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedTicket, setSelectedTicket] =
    useState<Ticket | null>(null);

  function getToken() {
    return localStorage.getItem("supportai_token");
  }

  function handleUnauthorized() {
    localStorage.removeItem("supportai_token");
    localStorage.removeItem("supportai_admin");
    router.replace("/login");
  }

  async function fetchTickets() {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      setError("");

      const response = await fetch(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load tickets");
      }

      const list = Array.isArray(data)
        ? data
        : data.tickets || data.data || [];

      setTickets(list);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load tickets"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTickets();
  }, []);

  async function createTicket(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    setSubmitting(true);
    setNotice("");
    setError("");

    try {
      const response = await fetch(`${API}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerName: name,
          email,
          subject,
          message,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ticket creation failed");
      }

      setNotice("Ticket created successfully!");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");

      await fetchTickets();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ticket creation failed"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function updateTicket(
    id: string,
    field: "status" | "assignedAgent",
    value: string
  ) {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    setNotice("");
    setError("");

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ticket update failed");
      }

      setNotice("Ticket updated successfully!");
      await fetchTickets();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ticket update failed"
      );
    }
  }

  async function deleteTicket(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this ticket?"
    );

    if (!confirmed) return;

    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    setDeletingId(id);
    setNotice("");
    setError("");

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ticket deletion failed");
      }

      setTickets((previous) =>
        previous.filter((ticket) => ticket._id !== id)
      );

      if (selectedTicket?._id === id) {
        setSelectedTicket(null);
      }

      setNotice("Ticket deleted successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ticket deletion failed"
      );
    } finally {
      setDeletingId(null);
    }
  }

  function logout() {
    localStorage.removeItem("supportai_token");
    localStorage.removeItem("supportai_admin");
    router.replace("/login");
  }

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const searchableText = [
        ticket.customerName,
        ticket.email,
        ticket.subject,
        ticket.message,
      ]
        .join(" ")
        .toLowerCase();

      return (
        searchableText.includes(search.toLowerCase()) &&
        (categoryFilter === "All" ||
          ticket.category === categoryFilter) &&
        (statusFilter === "All" ||
          ticket.status === statusFilter)
      );
    });
  }, [tickets, search, categoryFilter, statusFilter]);

  const total = tickets.length;
  const open = tickets.filter(t => t.status === "Open").length;
  const progress = tickets.filter(t => t.status === "In Progress").length;
  const resolved = tickets.filter(t => t.status === "Resolved").length;
  const high = tickets.filter(t => t.priority === "High").length;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-sky-400">
              SupportAI Dashboard
            </h1>
            <p className="mt-2 text-slate-400">
              AI-Based Customer Support Ticketing System
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchTickets}
              className="rounded-lg bg-sky-600 px-5 py-2 font-semibold hover:bg-sky-500"
            >
              Refresh Tickets
            </button>

            <button
              onClick={logout}
              className="rounded-lg bg-red-700 px-5 py-2 font-semibold hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Messages */}
        {notice && (
          <p className="mb-4 rounded-lg bg-green-900/40 p-3 text-green-300">
            {notice}
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-lg bg-red-900/40 p-3 text-red-300">
            {error}
          </p>
        )}

        {/* Statistics */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { title: "Total Tickets", value: total },
            { title: "Open Tickets", value: open },
            { title: "In Progress", value: progress },
            { title: "Resolved", value: resolved },
            { title: "High Priority", value: high },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-700 bg-slate-900 p-5"
            >
              <p className="text-sm text-slate-400">{item.title}</p>
              <p className="mt-2 text-3xl font-bold text-sky-400">
                {item.value}
              </p>
            </div>
          ))}
        </section>

        {/* Create Ticket */}
        <section className="mb-8 rounded-xl border border-slate-700 bg-slate-900 p-6">
          <h2 className="mb-5 text-xl font-bold">
            Create Support Ticket
          </h2>

          <form onSubmit={createTicket} className="grid gap-4 md:grid-cols-2">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Customer Name"
              className="rounded-lg border border-slate-700 bg-slate-800 p-3"
            />

            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="rounded-lg border border-slate-700 bg-slate-800 p-3"
            />

            <input
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ticket Subject"
              className="rounded-lg border border-slate-700 bg-slate-800 p-3 md:col-span-2"
            />

            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your problem..."
              rows={4}
              className="rounded-lg border border-slate-700 bg-slate-800 p-3 md:col-span-2"
            />

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-sky-600 px-6 py-3 font-semibold hover:bg-sky-500 disabled:opacity-50 md:col-span-2"
            >
              {submitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        </section>

        {/* Analytics */}
        <Analytics tickets={tickets} />

        {/* Ticket List */}
        <section className="mt-8">
          <h2 className="mb-5 text-2xl font-bold">
            Support Tickets
          </h2>

          <div className="mb-5 grid gap-3 md:grid-cols-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets..."
              className="rounded-lg border border-slate-700 bg-slate-900 p-3"
            />

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 p-3"
            >
              <option value="All">All Categories</option>
              <option value="Technical">Technical</option>
              <option value="Billing">Billing</option>
              <option value="Account">Account</option>
              <option value="General">General</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 p-3"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {loading ? (
            <p className="py-8 text-center text-slate-400">
              Loading tickets...
            </p>
          ) : filteredTickets.length === 0 ? (
            <p className="rounded-xl border border-slate-700 bg-slate-900 p-8 text-center text-slate-400">
              No matching tickets found.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <article
                  key={ticket._id}
                  className="rounded-xl border border-slate-700 bg-slate-900 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-sky-300">
                        {ticket.subject}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {ticket.customerName} · {ticket.email}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-sky-900 px-3 py-1 text-sky-300">
                        {ticket.category}
                      </span>
                      <span className="rounded-full bg-amber-900 px-3 py-1 text-amber-300">
                        {ticket.priority}
                      </span>
                    </div>
                  </div>

                  <p className="my-4 text-slate-300">
                    {ticket.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 border-t border-slate-700 pt-4">
                    <label className="text-sm text-slate-400">
                      Status:
                    </label>

                    <select
                      value={ticket.status}
                      onChange={(e) =>
                        updateTicket(ticket._id, "status", e.target.value)
                      }
                      className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-sm"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>

                    <label className="text-sm text-slate-400">
                      Agent:
                    </label>

                    <select
                      value={ticket.assignedAgent || "Unassigned"}
                      onChange={(e) =>
                        updateTicket(
                          ticket._id,
                          "assignedAgent",
                          e.target.value
                        )
                      }
                      className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-sm"
                    >
                      <option value="Unassigned">Unassigned</option>
                      <option value="Agent 1">Agent 1</option>
                      <option value="Agent 2">Agent 2</option>
                      <option value="Agent 3">Agent 3</option>
                    </select>

                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold hover:bg-indigo-500"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => deleteTicket(ticket._id)}
                      disabled={deletingId === ticket._id}
                      className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold hover:bg-red-600 disabled:opacity-50"
                    >
                      {deletingId === ticket._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Ticket Details Popup */}
        {selectedTicket && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setSelectedTicket(null)}
          >
            <div
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-sky-400">
                  Ticket Details
                </h2>

                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-2xl text-slate-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400">Ticket ID</p>
                  <p className="break-all text-sm">{selectedTicket._id}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Subject</p>
                  <p className="font-semibold">{selectedTicket.subject}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Customer Name</p>
                  <p>{selectedTicket.customerName}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p>{selectedTicket.email}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Description</p>
                  <p className="whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400">AI Category</p>
                    <p>{selectedTicket.category}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Priority</p>
                    <p>{selectedTicket.priority}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Status</p>
                    <p>{selectedTicket.status}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Assigned Agent</p>
                    <p>{selectedTicket.assignedAgent || "Unassigned"}</p>
                  </div>
                </div>

                {selectedTicket.createdAt && (
                  <div>
                    <p className="text-sm text-slate-400">Created At</p>
                    <p>
                      {new Date(selectedTicket.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="mt-6 w-full rounded-lg bg-sky-600 p-3 font-semibold hover:bg-sky-500"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
