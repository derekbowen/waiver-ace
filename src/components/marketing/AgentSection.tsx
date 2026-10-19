import { Link } from "react-router-dom";
import { ArrowRightIcon, BarChart3Icon, FileTextIcon, ListIcon, SearchIcon, SendIcon } from "lucide-react";

const ACTIONS = [
  {
    icon: BarChart3Icon,
    title: "Account summary",
    text: "Organization name, remaining credits, and waiver counts by status.",
  },
  {
    icon: FileTextIcon,
    title: "List templates",
    text: "Your active waiver templates, or inactive ones too on request.",
  },
  {
    icon: ListIcon,
    title: "List waivers",
    text: "Up to 100 waivers, filtered by status or signer email, newest first.",
  },
  {
    icon: SearchIcon,
    title: "Get waiver details",
    text: "Status, signer details, and recent activity for any single waiver.",
  },
  {
    icon: SendIcon,
    title: "Send a waiver",
    text: "Pick a template and guest email; add booking reference or rental date.",
  },
];

export function AgentSection() {
  return (
    <section id="ai-agents" className="border-b border-hairline bg-surface" aria-labelledby="ai-agents-heading">
      <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-canvas px-3 py-1 text-xs font-medium text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
            AI agent access
          </span>
          <h2 id="ai-agents-heading" className="mt-4 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Ask your AI assistant to run your waivers
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-muted">
            Connect Claude, ChatGPT, Cursor, or any MCP-compatible agent to your account with a key you control.
            Five actions are available today, and an agent can also draft a new waiver template from a description of
            your activity. Connecting is free — you only pay when a guest signs.
          </p>
        </div>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {ACTIONS.map((action) => (
            <li key={action.title} className="rounded-xl border border-hairline bg-canvas p-5">
              <action.icon className="h-5 w-5 text-brand" aria-hidden="true" />
              <h3 className="mt-3 font-display text-sm font-semibold text-ink">{action.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{action.text}</p>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            to="/ai-agents"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-ink-inverse transition-opacity hover:opacity-90"
          >
            See how agent access works
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            to="/settings/agents"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-hairline bg-canvas px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
          >
            Create an agent key
          </Link>
        </div>
      </div>
    </section>
  );
}
