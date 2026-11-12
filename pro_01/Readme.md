# Cross-Site Request Forgery (CSRF)

## Overview
This project demonstrates the exploitation of a Cross-Site Request Forgery (CSRF) vulnerability. According to the OWASP Foundation, CSRF is an attack that forces an end user to execute unwanted actions on a web application in which they are currently authenticated. 

In this scenario, the application relies solely on session cookies to identify the user and authorize the transaction, without any secondary validation mechanism (such as a CSRF token).

## How the Vulnerability Works
The attack exploits the inherent trust a web application has in the user's browser. When a user logs into a web application, the browser automatically stores a session cookie. If the user visits a malicious website or opens a crafted HTML file while the session is still active, the malicious site can send a forged request (e.g., an unauthorized money transfer) to the vulnerable application. 

Because the browser automatically attaches the stored session cookie to any request made to the original domain, the server perceives this forged request as a legitimate, user-initiated action and executes it.

## OWASP Prerequisites for CSRF
For a CSRF attack to be successful, three key conditions must be met (all of which are present in this application):
1. **Relevant Action:** The application contains a state-changing action that benefits the attacker (e.g., transferring funds).
2. **Cookie-based Session Handling:** The application uses cookies exclusively to track sessions, meaning the browser will automatically append the credentials to cross-site requests.
3. **No Unpredictable Request Parameters:** All parameters required to construct the request are known or can be guessed by the attacker (e.g., the `amount` parameter). The application does not require any secret, unpredictable values like a CSRF token to validate the request.

## Impact
If left unpatched, CSRF can lead to severe consequences, including unauthorized fund transfers, unauthorized password changes, or data manipulation, completely compromising the integrity of the user's account.