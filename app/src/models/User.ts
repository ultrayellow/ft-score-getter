import { z } from 'zod';

export const userSchema = z.object({
  login: z.string(),
});

export type User = {
  login: string;
};
