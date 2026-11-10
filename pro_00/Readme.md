# What is XSS?

**XSS (Cross-Site Scripting)** is a common security vulnerability found in web applications. According to **OWASP** (Open Worldwide Application Security Project), XSS allows attackers to inject malicious scripts into web pages viewed by other users.

Instead of attacking the server directly, the attacker uses the vulnerable website to send malicious code (usually JavaScript) to the victim's browser. Because the browser trusts the website, it executes the code.

This vulnerability happens when an application includes untrusted data in a web page without proper validation or encoding.