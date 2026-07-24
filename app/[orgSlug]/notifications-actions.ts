"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { markNotificationRead } from "@/lib/server/notifications";

export async function markNotificationReadAction(notificationId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await markNotificationRead(supabase, notificationId, user.id);
}
