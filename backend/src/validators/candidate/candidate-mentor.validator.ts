import { z } from "zod";

const skillsSchema = z
  .preprocess((value) => {
    if (Array.isArray(value)) {
      return value.flatMap((item) => String(item).split(",")).filter(Boolean);
    }

    if (typeof value === "string") {
      return value.split(",").filter(Boolean);
    }

    return [];
  }, z.array(z.string().trim().min(1).max(40)).max(20))
  .transform((skills) => {
    const seen = new Set<string>();
    return skills.filter((skill) => {
      const key = skill.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });

export const listCandidateMentorsQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  skills: skillsSchema.default([]),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(9),
});
