import { z } from 'zod';

export const scoreSchema = z.object({
  id: z.string(),
  coalition_id: z.coerce.string(),
  scoreable_id: z.coerce.string(),
  scoreable_type: z.string(),
  coalitions_user_id: z.nullable(z.coerce.string()),
  calculation_id: z.string(),
  value: z.number(),
  reason: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type ScoreDto = {
  readonly id: number; // use z.coerce.string()
  readonly coalition_id: number;
  readonly scoreable_id: number;
  readonly scoreable_type: string;
  readonly coalitions_user_id: number | null;
  readonly calculation_id: number;
  readonly value: number;
  readonly reason: string;
  readonly created_at: string;
  readonly updated_at: string;
};

// todo: camel case
export type Score = Readonly<z.infer<typeof scoreSchema>>
