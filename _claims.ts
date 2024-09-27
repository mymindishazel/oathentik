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
  name?: string;
  family_name?: string;
  given_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string; // url
  picture?: string; // url
  website?: string;
  gender?: "female" | "male" | string;
  birthdate?: `${number}` | `${number | "0000"}-${number}-${number}`; // yyyy or yyyy-mm-dd
  zoneinfo?: `${string}/${string}` | string; // iana timezone
  locale?: `${Lowercase<string>}${"-" | "_"}${Uppercase<string>}`; // e.g. en-US
  updated_at?: number; // unix timestamp in seconds
}

/**
 * claims implicitly requested by the `email` scope
 */
export interface EmailClaims {
  email?: `${string}@${string}`;
  email_verified?: boolean;
}

interface Address {
  formatted: string; // full address
  street_address: string;
  locality: string; // city or locality
  region: string; // state, province, prefecture, or region
  postal_code: string;
  country: string;
}

/**
 * claims implicitly requested by the `address` scope
 */
export interface AddressClaims {
  address?: Address;
}

/**
 * claims implicitly requested by the `phone` scope
 */
export type PhoneClaims =
  | {
    phone_number?: string;
    phone_number_verified?: false;
  }
  | {
    phone_number: `+${string}` | `+${string};ext=${number}`;
    phone_number_verified: true;
  };

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
  & SetClaims<A, "email", EmailClaims>
  & SetClaims<A, "address", AddressClaims>
  & SetClaims<A, "phone", PhoneClaims>;
