import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";
import { KB_ARTICLES, KB_CATEGORIES } from "@/lib/kb-data";
import { ArrowLeft, ChevronRight } from "lucide-react";

/** Simple markdown-to-JSX renderer for KB articles */
function renderContent(content: string) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  const parseInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    // Handle inline code, bold, and links
    const regex = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
    let lastIndex = 0;
    let match;
    let pKey = 0;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      if (match[1]) {
        parts.push(
          <code key={pKey++} className="bg-accent px-1.5 py-0.5 rounded text-xs font-mono">
            {match[1]}
          </code>
        );
      } else if (match[2]) {
        parts.push(<strong key={pKey++}>{match[2]}</strong>);
      } else if (match[3] && match[4]) {
        parts.push(
          <a key={pKey++} href={match[4]} className="text-primary underline">
            {match[3]}
          </a>
        );
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts;
  };

  while (i < lines.length) {
    const line = lines[i];

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Code block
    if (line.trim().startsWith("```")) {
      const lang = line.trim().replace("```", "");
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <pre
          key={key++}
          className="bg-foreground text-background rounded-lg p-4 text-xs overflow-x-auto font-mono my-4"
        >
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    // Blockquote
    if (line.trim().startsWith("> ")) {
      elements.push(
        <div
          key={key++}
          className="border-l-4 border-primary/30 bg-accent/30 rounded-r-lg pl-4 pr-4 py-3 my-4"
        >
          <p className="text-sm">{parseInline(line.trim().slice(2))}</p>
        </div>
      );
      i++;
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="font-heading text-base font-semibold mt-6 mb-2">
          {parseInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="font-heading text-xl font-bold mt-8 mb-3">
          {parseInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    // Table
    if (line.includes("|") && lines[i + 1]?.includes("---")) {
      const headers = line
        .split("|")
        .map((h) => h.trim())
        .filter(Boolean);
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(
          lines[i]
            .split("|")
            .map((c) => c.trim())
            .filter(Boolean)
        );
        i++;
      }
      elements.push(
        <div key={key++} className="rounded-lg border overflow-x-auto my-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-accent/50">
                {headers.map((h, hi) => (
                  <th key={hi} className="px-3 py-2 text-left font-medium text-xs">
                    {parseInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b last:border-0">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-xs">
                      {parseInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={key++} className="list-decimal pl-6 text-sm text-muted-foreground space-y-1.5 my-3">
          {items.map((item, ii) => (
            <li key={ii}>{parseInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Unordered list
    if (line.trim().startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <ul key={key++} className="list-disc pl-6 text-sm text-muted-foreground space-y-1.5 my-3">
          {items.map((item, ii) => (
            <li key={ii}>{parseInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Paragraph
    elements.push(
      <p key={key++} className="text-sm text-muted-foreground leading-relaxed my-2">
        {parseInline(line.trim())}
      </p>
    );
    i++;
  }

  return elements;
}

export default function DocsArticle() {
  const { articleId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const article = KB_ARTICLES.find((a) => a.id === articleId);
  const category = article
    ? KB_CATEGORIES.find((c) => c.id === article.category)
    : null;

  // Related articles in same category
  const related = article
    ? KB_ARTICLES.filter(
        (a) => a.category === article.category && a.id !== article.id
      )
    : [];

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center">
            <p className="text-muted-foreground mb-4">Article not found.</p>
            <Link to="/docs">
              <Button variant="outline">Back to Knowledge Base</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Rental Waivers" className="h-7 w-7" />
            <span className="font-heading text-base font-bold tracking-tight">
              Rental Waivers
            </span>
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
              KB
            </span>
          </Link>
          <Link to={user ? "/dashboard" : "/login"}>
            <Button size="sm" variant="outline">
              {user ? "Dashboard" : "Get Started"}
            </Button>
          </Link>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
          <Link to="/docs" className="hover:text-foreground transition-colors">
            Knowledge Base
          </Link>
          <ChevronRight className="h-3 w-3" />
          <button
            onClick={() => {
              navigate("/docs");
              setTimeout(() => {
                document
                  .getElementById(`cat-${article.category}`)
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
            className="hover:text-foreground transition-colors"
          >
            {category?.label}
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {article.title}
          </span>
        </nav>

        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/docs")}
          className="gap-1.5 mb-4 -ml-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Button>

        {/* Article */}
        <article className="prose-sm">
          {renderContent(article.content)}
        </article>

        {/* Related articles */}
        {related.length > 0 && (
          <section className="mt-12 pt-8 border-t">
            <h3 className="font-heading text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
              Related Articles
            </h3>
            <div className="space-y-2">
              {related.map((r) => (
                <Link key={r.id} to={`/docs/${r.id}`}>
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                    <CardContent className="flex items-center gap-4 py-3 px-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{r.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {r.description}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
