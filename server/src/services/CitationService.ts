import { FilteredSource, CitationItemSchema } from "./types.js";
import { z } from "zod";

type CitationItem = z.infer<typeof CitationItemSchema>;

export class CitationService {
  formatCitations(sources: FilteredSource[], style: string = "apa"): CitationItem[] {
    return sources.map((src, index) => {
      const refNum = index + 1;
      const year = new Date().getFullYear();
      let citationText = "";

      switch (style.toLowerCase()) {
        case "ieee":
          citationText = `[${refNum}] ${src.source}, "${src.title}," Available: ${src.url}. [Accessed: ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}].`;
          break;
        case "mla":
          citationText = `"${src.title}." ${src.source}, ${src.url}. Accessed ${new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}.`;
          break;
        case "harvard":
          citationText = `${src.source} (${year}) '${src.title}'. Available at: ${src.url} (Accessed: ${new Date().toLocaleDateString()}).`;
          break;
        case "chicago":
          citationText = `${src.source}. "${src.title}." Accessed ${new Date().toLocaleDateString()}. ${src.url}.`;
          break;
        case "apa":
        default:
          citationText = `${src.source}. (${year}). ${src.title}. Retrieved from ${src.url}`;
          break;
      }

      return {
        refId: `[${refNum}]`,
        sourceId: src.id,
        title: src.title,
        url: src.url,
        domain: src.domain,
        citationText,
        authorityTier: src.authorityTier,
      };
    });
  }
}
