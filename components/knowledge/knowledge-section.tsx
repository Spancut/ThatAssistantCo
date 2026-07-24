"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import type { KnowledgeBaseItem } from "@/lib/server/knowledge";
import type { KnowledgeItemFormState } from "@/lib/validations/knowledge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const initialState: KnowledgeItemFormState = {};

export function KnowledgeSection({
  items,
  addAction,
  deleteAction,
}: {
  items: KnowledgeBaseItem[];
  addAction: (
    prevState: KnowledgeItemFormState,
    formData: FormData
  ) => Promise<KnowledgeItemFormState>;
  deleteAction: (itemId: string) => Promise<void>;
}) {
  const [state, formAction, isPending] = useActionState(addAction, initialState);

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No knowledge items linked yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{item.title}</p>
                  {item.content ? (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                      {item.content}
                    </p>
                  ) : null}
                  {item.tags.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
                <form action={deleteAction.bind(null, item.id)}>
                  <Button type="submit" variant="ghost" size="icon-sm" aria-label="Delete knowledge item">
                    <Trash2 className="size-3.5" />
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form
        action={formAction}
        className="space-y-3 rounded-lg border border-dashed border-border p-4"
      >
        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required minLength={1} placeholder="e.g. Preferred greeting" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <textarea
            id="content"
            name="content"
            rows={3}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input id="tags" name="tags" placeholder="comma, separated, tags" />
        </div>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Adding…" : "Add knowledge item"}
        </Button>
      </form>
    </div>
  );
}
