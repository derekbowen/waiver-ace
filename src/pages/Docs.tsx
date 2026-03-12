import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";
import { KB_CATEGORIES, KB_ARTICLES } from "@/lib/kb-data";
import {
  ArrowRight,
  BookOpen,
  Code,
  CreditCard,
  Globe,
  LayoutTemplate,
  Scale,
  Search,
  Send,
  Users,
  Webhook,
  ChevronRight,
  QrCode,
  Key,
  FileText,
  UserCircle,
  HelpCircle,
} from "lucide-react";

const iconMap: Record<string, any> = {
  BookOpen, Code, CreditCard, Globe, LayoutTemplate, Scale, Send, Users,
  Webhook, QrCode, Key, FileText, UserCircle, HelpCircle,
};

export default function Docs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredArticles = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return KB_ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q)
    );
  }, [search]);

  const isSearching = search.trim().length > 0;

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

      <main className="container px-4 py-8 max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Knowledge Base
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
            Everything you need to set up, integrate, and manage waivers for your
            rental marketplace.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Search Results */}
        {isSearching && (
          <div className="mb-10">
            <p className="text-sm text-muted-foreground mb-4">
              {filteredArticles.length} result{filteredArticles.length !== 1 ? "s" : ""} for "{search}"
            </p>
            {filteredArticles.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground">No articles found. Try different keywords.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredArticles.map((article) => {
                  const category = KB_CATEGORIES.find((c) => c.id === article.category);
                  return (
                    <Link key={article.id} to={`/docs/${article.id}`}>
                      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                        <CardContent className="flex items-center gap-4 py-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{article.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {category?.label} · {article.description}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Category Grid */}
        {!isSearching && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {KB_CATEGORIES.map((cat) => {
              const Icon = iconMap[cat.icon] || BookOpen;
              const articleCount = KB_ARTICLES.filter((a) => a.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    const el = document.getElementById(`cat-${cat.id}`);
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="text-left"
                >
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                    <CardContent className="pt-5 pb-4">
                      <div className={`inline-flex items-center justify-center rounded-lg p-2 mb-3 ${cat.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="font-medium text-sm mb-1">{cat.label}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {cat.description}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-2">
                        {articleCount} article{articleCount !== 1 ? "s" : ""}
                      </p>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>
        )}

        {/* Articles by Category */}
        {!isSearching &&
          KB_CATEGORIES.map((cat) => {
            const Icon = iconMap[cat.icon] || BookOpen;
            const articles = KB_ARTICLES.filter((a) => a.category === cat.id);
            if (articles.length === 0) return null;
            return (
              <section
                key={cat.id}
                id={`cat-${cat.id}`}
                className="mb-10 scroll-mt-20"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className={`inline-flex items-center justify-center rounded-md p-1.5 ${cat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <h2 className="font-heading text-lg font-bold">{cat.label}</h2>
                </div>
                <div className="space-y-2">
                  {articles.map((article) => (
                    <Link key={article.id} to={`/docs/${article.id}`}>
                      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                        <CardContent className="flex items-center gap-4 py-3 px-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{article.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {article.description}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}

        {/* CTA */}
        {!isSearching && (
          <section className="text-center py-10 rounded-xl border bg-accent/30 mb-8">
            <h2 className="font-heading text-xl font-bold mb-2">
              Ready to get started?
            </h2>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
              Create your account, set up a template, and send your first waiver
              in under 5 minutes. 250 free credits included.
            </p>
            <Link to={user ? "/dashboard" : "/login"}>
              <Button className="gap-2">
                {user ? "Go to Dashboard" : "Get Started Free"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
