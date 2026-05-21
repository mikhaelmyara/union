import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

import fr from "./messages/fr.json";
import en from "./messages/en.json";
import es from "./messages/es.json";
import ar from "./messages/ar.json";

const messages = { fr, en, es, ar };

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "fr";
  const validLocales = ["fr", "en", "es", "ar"] as const;
  const safeLocale = validLocales.includes(locale as never) ? (locale as typeof validLocales[number]) : "fr";

  return {
    locale: safeLocale,
    messages: messages[safeLocale],
  };
});