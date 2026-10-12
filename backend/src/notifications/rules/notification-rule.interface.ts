export interface NotificationRule {
  verifier(): Promise<void>;
}
