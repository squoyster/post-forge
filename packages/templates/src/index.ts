import Handlebars from "handlebars";
import { readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import { z } from "zod";
import YAML from "yaml";

const textTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["text", "video", "audio"]),
  platforms: z.array(z.string()).optional(),
  fields: z.array(z.string()).optional(),
  body: z.string(),
});

export type TextTemplate = z.infer<typeof textTemplateSchema>;

export interface RenderTextInput {
  templateId: string;
  data: Record<string, string>;
}

export interface RenderTextOutput {
  body: string;
}

const templateCache = new Map<string, TextTemplate>();

export function loadTemplateFromFile(filePath: string): TextTemplate {
  const content = readFileSync(filePath, "utf-8");
  const parsed = YAML.parse(content);
  return textTemplateSchema.parse(parsed);
}

export function loadTemplatesFromDir(dirPath: string): TextTemplate[] {
  const files = readdirSync(dirPath).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));
  return files.map((f) => loadTemplateFromFile(resolve(dirPath, f)));
}

export function getTemplate(id: string): TextTemplate | undefined {
  return templateCache.get(id);
}

export function registerTemplate(template: TextTemplate): void {
  templateCache.set(template.id, template);
}

export function renderTextTemplate(input: RenderTextInput): RenderTextOutput {
  const template = templateCache.get(input.templateId);
  if (!template) {
    throw new Error(`Template not found: ${input.templateId}`);
  }

  const compiled = Handlebars.compile(template.body);
  const body = compiled(input.data);
  return { body };
}
