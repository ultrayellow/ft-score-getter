import { z } from 'zod';

export const coalitionsUsersSchema = z.object({
  id: z.coerce.string(),
  coalition_id: z.coerce.string(),
  user_id: z.coerce.string(),
  score: z.coerce.string(),
  rank: z.coerce.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type CoalitionsUsersDto = {
  readonly id: number;
  readonly coalition_id: number;
  readonly user_id: number;
  readonly score: number;
  readonly rank: number;
  readonly created_at: string;
  readonly updated_at: string;
};

export type CoalitionsUsers = Readonly<z.infer<typeof coalitionsUsersSchema>>;
