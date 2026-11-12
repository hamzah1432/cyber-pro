# Payloads and Exploitation Scenarios

## 1. Payloads Used
During the exploitation phase, the following payloads were tested to exploit the Server-Side Template Injection (SSTI) vulnerability:

* **Payload 1 (Testing for vulnerability):**
{{7*7}}
  *Result:* The application evaluated the expression, confirming the SSTI vulnerability.

* **Payload 2 (Reading /etc/passwd):**
{{ request.__class__._load_form_data.__globals__.__builtins__.open("/etc/passwd").read() }}

  *Result:* Successfully bypassed the template engine restrictions and displayed the contents of the `/etc/passwd` file.

---

## 2. Exploitation Scenarios
This vulnerability could be exploited in real-world applications in several critical ways:

### Scenario A: Sensitive Information Disclosure
An attacker could use SSTI to read arbitrary files on the server. By navigating the file system, the attacker might access configuration files (e.g., `.env`), application source code, or internal database credentials. This can lead to a massive data breach or provide the necessary keys to escalate the attack further.

### Scenario B: Remote Code Execution (RCE) and Server Takeover
If the template engine allows access to the underlying operating system commands (like Python's `os` module), an attacker could execute arbitrary terminal commands. This allows them to install malware, open a reverse shell to gain persistent control over the server, or use the compromised server to pivot and attack other internal systems within the company's network.