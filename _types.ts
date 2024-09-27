/**
 * success response to `/o/userinfo` containing the user data
 */
export interface UserData {
  email: string;
  email_verified: boolean;
  given_name: string;
  groups: string[];
  name: string;
  nickname: string;
  preferred_username: string;
  sub: string;
}

/**
 * error encountered while trying to contact authentik
 *
 * @example
 * ```ts
 * if (err instanceof OathError) {
 *   console.error("fatal error contacting authentik:", err.message)
 * }
 * ```
 */
export class OathError extends Error {
  constructor(message: string) {
    super(message);
  }
}
