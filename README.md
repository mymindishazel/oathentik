# `-/oathentik`

*very barebones implementation of [authentik](https://goauthentik.io/) oidc*

## Usage

```ts
import { Oath } from "jsr:@dash/oathentik"

// 1. create the client
const authentik = new Oath("https://authentik.example", {
  id: env.CLIENT_ID,
  secret: env.CLIENT_SECRET,
  redirect: "https://app.example/callback",
})

// 2. get an auth code
const expected_state = crypto.randomUUID()
const authorize_url = authentik.url({
  scopes: ["openid", "profile", "email"],
  state: expected_state,
})

respond(302, authorize_url)

// 3. fetch the user data
const { code, state } = request.query // ?code=abc&state=d3e89902-f483-42b7-93fe-c44b6bef0e61
assert(state === expected_state)

const user = await authentik.user(code)

// 4. done!
respond(200, `welcome, ${user.name}`)
```

## Credits

i built this to replace [`Deno-Sandbox-2/oidc`](https://github.com/Deno-Sandbox-2/oidc) in my applications
