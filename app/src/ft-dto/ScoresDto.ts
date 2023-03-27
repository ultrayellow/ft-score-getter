export interface ScoreDto {
  readonly id: number;
  readonly coalition_id: number;
  readonly scoreable_id: number;
  readonly scoreable_type: string;
  readonly coalitions_user_id: number;
  readonly calculation_id: number;
  readonly value: number;
  readonly reason: string;
  readonly created_at: string;
  readonly updated_at: string;
}
