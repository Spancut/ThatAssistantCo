import Link from "next/link";
import type { Contact } from "@/lib/server/contacts";
import { PIPELINE_STAGES, PIPELINE_STAGE_LABELS } from "@/lib/validations/contact";
import { StageSelect } from "@/components/contacts/stage-select";

export function ContactBoard({ orgSlug, contacts }: { orgSlug: string; contacts: Contact[] }) {
  const byStage = new Map<string, Contact[]>(PIPELINE_STAGES.map((stage) => [stage, []]));
  for (const contact of contacts) {
    byStage.get(contact.pipeline_stage)?.push(contact);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {PIPELINE_STAGES.map((stage) => {
        const stageContacts = byStage.get(stage) ?? [];
        return (
          <div key={stage} className="w-64 shrink-0 space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-medium text-foreground">
                {PIPELINE_STAGE_LABELS[stage]}
              </h3>
              <span className="text-xs text-muted-foreground">{stageContacts.length}</span>
            </div>
            <div className="space-y-2">
              {stageContacts.map((contact) => (
                <div key={contact.id} className="rounded-lg border border-border bg-card p-3">
                  <Link
                    href={`/${orgSlug}/contacts/${contact.id}`}
                    className="block hover:underline"
                  >
                    <p className="font-medium text-foreground">{contact.name}</p>
                    {contact.company ? (
                      <p className="text-xs text-muted-foreground">{contact.company}</p>
                    ) : null}
                  </Link>
                  <div className="mt-2">
                    <StageSelect
                      orgSlug={orgSlug}
                      contactId={contact.id}
                      contactName={contact.name}
                      currentStage={contact.pipeline_stage}
                    />
                  </div>
                </div>
              ))}
              {stageContacts.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                  Empty
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
