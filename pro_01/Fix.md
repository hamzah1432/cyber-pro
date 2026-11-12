# How to Fix and Prevent CSRF Vulnerabilities

To protect a web application from Cross-Site Request Forgery (CSRF) attacks, developers should implement a "Defense in Depth" strategy. This means using multiple layers of security. 

Here are the three best methods to fix this vulnerability:

## 1. Anti-CSRF Tokens (The Strongest Defense)
The most effective way to stop CSRF is by using the Synchronizer Token Pattern. 
* **How it works:** When a user logs in, the server generates a secret, unique, and random token for their session. The server adds this token to any HTML form (as a hidden input) or expects it in a custom HTTP header (like `X-CSRF-Token`).
* **Why it stops the attack:** When the attacker tries to send a fake request from their website (`evil.com`), they must include this secret token. However, because of the browser's Same-Origin Policy, the attacker cannot read or steal the token from the real website. The server will reject the attacker's request because the token is missing or incorrect.

## 2. SameSite Cookie Attribute (Browser-Level Defense)
Modern web browsers offer a great security feature for cookies called the `SameSite` attribute.
* **How it works:** When the server creates a session cookie, it should add `SameSite=Lax` or `SameSite=Strict` to the cookie settings.
* **Why it stops the attack:** This setting tells the browser: "Do not send this cookie if the request is coming from a different website." So, if the victim clicks a button on the attacker's website, the browser will send the request to the server *without* the session cookie. The server will treat it as an unauthenticated request and block the transfer.

## 3. Verifying Origin and Referer Headers (Extra Layer)
Every time the browser sends a request, it usually includes HTTP headers that show where the request came from (`Origin` and `Referer`).
* **How it works:** The server can be programmed to check these headers before processing any sensitive action (like a money transfer). 
* **Why it stops the attack:** If the server sees that a request is coming from an unknown domain (e.g., `malicious-site.com`) instead of the official application domain (e.g., `localhost:8080`), it will immediately block the request. This is a great extra layer of security to use alongside Anti-CSRF Tokens.