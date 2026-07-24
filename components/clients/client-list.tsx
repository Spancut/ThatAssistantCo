import Link from "next/link";
import { Archive } from "lucide-react";
import { archiveClientAction } from "@/app/[orgSlug]/clients/actions";
import type { ClientProfile } from "@/lib/server/clients";
import { Button } from "@/components/ui/button";

export function ClientList({ orgSlug, clients }: { orgSlug: string; clients: ClientProfile[] }) {
  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-card">
      {clients.map((client) => (
        <li key={client.id} className="flex items-center justify-between gap-3 p-4">
          <Link
            href={`/${orgSlug}/clients/${client.id}`}
            className="min-w-0 flex-1 hover:underline"
          >
            <span className="block font-medium text-foreground">{client.name}</span>
            {client.brand_voice ? (
              <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                {client.brand_voice}
              </span>
            ) : (
              <span className="mt-0.5 block text-sm text-muted-foreground">
                No brand voice notes yet
              </span>
            )}
          </Link>
          <form action={archiveClientAction.bind(null, orgSlug, client.id)}>
            <Button type="submit" variant="ghost" size="sm" className="shrink-0 gap-1.5">
              <Archive className="size-3.5" />
              Archive
            </Button>
          </form>
        </li>
      ))}
    </ul>
  );
}
