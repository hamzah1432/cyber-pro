# XSS Exploitation and Prevention

## Exploitation Scenarios

Here are two common scenarios where a hacker can exploit an XSS vulnerability:

**1. Stealing Session Cookies (Account Takeover):**
The attacker injects a malicious script into the vulnerable website. When a victim visits the page, the script reads their `document.cookie` and sends it to the attacker's server. With this session cookie, the attacker can log into the victim's account without needing a username or password.

**2. Phishing and Redirection:**
The attacker uses XSS to modify the appearance of the vulnerable page, such as displaying a fake login form to steal credentials. Alternatively, the script can force the victim's browser to redirect to an external malicious website controlled by the attacker.

---

## How to Fix and Protect the Application

To protect web applications from XSS vulnerabilities, developers should implement the following security measures based on OWASP guidelines:

*   **Output Encoding:** Always encode user input before displaying it on the web page. This converts special HTML characters (like `<` and `>`) into safe text entities (like `<` and `>`), ensuring the browser treats them as normal text, not executable code.
*   **Input Validation and Sanitization:** Strictly validate all data submitted by users. Strip out or sanitize dangerous tags, attributes, and JavaScript keywords before saving the data to the database.
*   **Use the HttpOnly Flag for Cookies:** Always set the `HttpOnly` flag when creating session cookies. This security feature prevents client-side scripts (JavaScript) from accessing the cookie, effectively stopping XSS attacks from stealing it.

**Sources:**
* OWASP Cross Site Scripting (XSS)
* OWASP XSS Prevention Cheat Sheet