import { getDb, templates } from "@post-forge/db";
import { loadTemplatesFromDir } from "@post-forge/templates";
import { eq } from "drizzle-orm";
import { resolve } from "path";

export async function loadTemplatesIntoDb() {
  const db = getDb();
  const templatesDir = resolve(process.cwd(), "../../templates");

  try {
    const loadedTemplates = loadTemplatesFromDir(templatesDir);

    for (const template of loadedTemplates) {
      const existing = await db
        .select()
        .from(templates)
        .where(eq(templates.id, template.id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(templates).values({
          id: template.id,
          name: template.name,
          type: template.type,
          platform: template.platforms?.[0] ?? "facebook",
          filePath: `templates/${template.type}/${template.id}.yaml`,
          config: template.fields ? { fields: template.fields } : {},
          active: true,
        });
        console.log(`Loaded template: ${template.name}`);
      }
    }

    console.log(`Loaded ${loadedTemplates.length} templates`);
  } catch (error) {
    console.error("Failed to load templates:", error);
  }
}
