
"use client";

type Ticket = {
    _id: string;
    assignedAgent?: string;
    status: string;
    createdAt?: string;
    resolvedAt?: string;
    slaStatus?: string;
};

type Props = {
    tickets: Ticket[];
};

const AGENTS = ["Agent 1", "Agent 2", "Agent 3"];

export default function AgentPerformance({ tickets }: Props) {
    const performance = AGENTS.map((agent) => {
        const assigned = tickets.filter(
            (ticket) => ticket.assignedAgent === agent
        );

        const resolved = assigned.filter(
            (ticket) => ticket.status === "Resolved"
        );

        const pending = assigned.length - resolved.length;

        const resolutionTimes = resolved
            .filter((ticket) => ticket.createdAt && ticket.resolvedAt)
            .map((ticket) => {
                return (
                    new Date(ticket.resolvedAt!).getTime() -
                    new Date(ticket.createdAt!).getTime()
                ) / (1000 * 60 * 60);
            })
            .filter((hours) => hours >= 0);

        const averageTime = resolutionTimes.length
            ? resolutionTimes.reduce((a, b) => a + b, 0) /
              resolutionTimes.length
            : null;

        const slaEvaluated = resolved.filter(
            (ticket) =>
                ticket.slaStatus === "Met" ||
                ticket.slaStatus === "Breached"
        );

        const slaMet = slaEvaluated.filter(
            (ticket) => ticket.slaStatus === "Met"
        ).length;

        const slaRate = slaEvaluated.length
            ? (slaMet / slaEvaluated.length) * 100
            : null;

        return {
            agent,
            total: assigned.length,
            resolved: resolved.length,
            pending,
            averageTime,
            slaRate,
        };
    });

    return (
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
                Agent Performance Dashboard
            </h2>

            <p className="mb-6 text-sm text-gray-500">
                Individual agent productivity and SLA performance
            </p>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {performance.map((item) => (
                    <div
                        key={item.agent}
                        className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                    >
                        <h3 className="mb-4 text-lg font-bold text-gray-900">
                            {item.agent}
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg bg-white p-3">
                                <p className="text-xs text-gray-500">
                                    Total Tickets
                                </p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {item.total}
                                </p>
                            </div>

                            <div className="rounded-lg bg-white p-3">
                                <p className="text-xs text-gray-500">
                                    Resolved
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {item.resolved}
                                </p>
                            </div>

                            <div className="rounded-lg bg-white p-3">
                                <p className="text-xs text-gray-500">
                                    Pending
                                </p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {item.pending}
                                </p>
                            </div>

                            <div className="rounded-lg bg-white p-3">
                                <p className="text-xs text-gray-500">
                                    Avg. Resolution
                                </p>
                                <p className="text-xl font-bold text-purple-600">
                                    {item.averageTime === null
                                        ? "N/A"
                                        : `${item.averageTime.toFixed(1)} hrs`}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="mb-2 flex justify-between text-sm">
                                <span className="text-gray-600">
                                    SLA Compliance
                                </span>
                                <span className="font-bold text-gray-900">
                                    {item.slaRate === null
                                        ? "N/A"
                                        : `${item.slaRate.toFixed(1)}%`}
                                </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className="h-full rounded-full bg-green-500"
                                    style={{
                                        width: `${item.slaRate ?? 0}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
