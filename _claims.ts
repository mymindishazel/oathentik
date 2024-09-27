/**
 * @file Contains mappings of OpenID `scope` to standard `claims`
 * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims|OIDC Core 1.0, §5.1}
 * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#ScopeClaims|OIDC Core 1.0, §5.4}
 */

/**
 * always present claims
 */
export interface OpenIDClaims {
  sub: string;
}

/**
 * claims implicitly requested by the `profile` scope
 */
export interface ProfileClaims {
  name: string;
  given_name: string;
  preferred_username: string;
  nickname: string;
  groups: string[];
}

/**
 * claims implicitly requested by the `email` scope
 */
export interface EmailClaims {
  email: `${string}@${string}`;
  email_verified: true;
}

type SetClaims<
  A extends ReadonlyArray<string>,
  S extends string,
  T extends object,
> = S extends A[number] ? T : Record<string | number | symbol, never>;

/**
 * calculates which oidc claims should be present based on a list of scopes
 */
export type ScopeClaims<A extends ReadonlyArray<string>> =
  & SetClaims<A, "openid", OpenIDClaims>
  & SetClaims<A, "profile", ProfileClaims>
  & SetClaims<A, "email", EmailClaims>;
