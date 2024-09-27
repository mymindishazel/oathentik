import { ScopeClaims } from "./_claims.ts";

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

const is_json = (res: Response) =>
  res.headers.get("content-type") === "application/json";

/**
 * client for interfacing with authentik
 *
 * @example
 * ```ts
 * const authentik = new Oath("https://authentik.example", {
 *   id: env.CLIENT_ID,
 *   secret: env.CLIENT_SECRET,
 *   redirect: "https://app.example/callback",
 * })
 *
 * const auth_url = authentik.url({
 *   scopes: ["openid", "profile", "email"],
 *   state: expected_state,
 * })
 * ```
 *
 * @example
 * ```ts
 * const { code, state } = request.query
 * assert(state === expected_state)
 *
 * const user = await authentik.user(code)
 * ```
 */
export class Oath {
  #endpoint: string;
  #client_id: string;
  #client_secret: string;
  #redirect_uri: string;

  /**
   * create a new authentik client instance
   *
   * @param endpoint url of your authentik instance
   * @param id client id of the application
   * @param secret client secret of the application
   * @param redirect where to send users upon successfully authenticating
   *
   * @example
   * ```ts
   * const authentik = new Oath("https://authentik.example", {
   *   id: env.CLIENT_ID,
   *   secret: env.CLIENT_SECRET,
   *   redirect: "https://app.example/callback",
   * })
   * ```
   */
  constructor(
    endpoint: string,
    { id, secret, redirect }: Record<
      "id" | "secret" | "redirect",
      string
    >,
  ) {
    this.#endpoint = endpoint;
    this.#client_id = id;
    this.#client_secret = secret;
    this.#redirect_uri = redirect;
  }

  /**
   * generates a URL for authorizing your application via oauth2
   *
   * @param scopes required scopes for your application
   * @param state random value used for for csrf protection
   * @returns the URL
   */
  public url(
    { scopes, state }: { scopes: string[]; state: string },
  ): string {
    return this.#url("/application/o/authorize/", {
      client_id: this.#client_id,
      redirect_uri: this.#redirect_uri,
      response_type: "code",
      scope: scopes.join(" "),
      state,
    }).href;
  }

  /**
   * gets an access token from authentik and uses it to fetch the logged in user's data
   *
   * @param code the authorization code received once the user gets redirected back to the applications
   * @returns the logged in user's data
   */
  public async user<T = ScopeClaims<["openid", "email", "profile"]>>(
    code: string,
  ): Promise<T> {
    const res = await this.#post("/application/o/token/", {
      code,
      grant_type: "authorization_code",
      redirect_uri: this.#redirect_uri,
    });
    if (!is_json(res)) {
      throw new OathError(`invalid token response, got ${await res.text()}`);
    }

    const { access_token } = await res.json();
    if (!access_token) {
      throw new OathError("missing access_token in token response");
    }

    return this.fetch_user<T>(access_token);
  }

  private async fetch_user<T>(access_token: string) {
    const res = await this.#post("/application/o/userinfo/", { access_token });
    if (!is_json(res)) {
      throw new OathError(`invalid user data, got ${await res.text()}`);
    }

    return res.json() as T;
  }

  #url(path: string, params?: Record<string, string>) {
    const url = new URL(path, this.#endpoint);
    if (params) url.search = new URLSearchParams(params).toString();

    return url;
  }

  #post(path: string, params: Record<string, string>) {
    const auth = `Basic ${btoa(`${this.#client_id}:${this.#client_secret}`)}`;
    const body = new URLSearchParams(params);

    return fetch(this.#url(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": auth,
      },
      body,
    });
  }
}
