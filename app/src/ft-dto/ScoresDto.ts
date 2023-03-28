// todo: zod
export type ScoreDto = {
  readonly id: number; // use z.coerce.string()
  readonly coalition_id: number;
  readonly scoreable_id: number;
  readonly scoreable_type: string;
  // todo optional
  readonly coalitions_user_id: number;
  readonly calculation_id: number;
  readonly value: number;
  readonly reason: string;
  readonly created_at: string;
  readonly updated_at: string;
};
