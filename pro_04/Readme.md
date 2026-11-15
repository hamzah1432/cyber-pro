# XML External Entity (XXE) Vulnerability

## What is XXE?
XXE stands for **XML External Entity**. It is a security vulnerability that happens when a web application processes XML data but does not disable a feature called "External Entities". 

In XML, you can create variables (called entities) to store data. If the XML parser (the tool reading the XML) is not protected, an attacker can create a bad entity that tells the server to read secret files or connect to internal networks.

## Exploitation Scenarios
Here are two common ways attackers can use the XXE vulnerability:

### 1. Reading Local Files (Local File Disclosure)
The attacker sends an XML file that asks the server to read a file from its own hard drive. For example, the attacker can use the `SYSTEM` command to read the `/etc/passwd` file on a Linux server. The server reads the file and shows the secret information to the attacker.

### 2. Server-Side Request Forgery (SSRF)
The attacker uses the server as a bridge to attack other systems. Instead of asking for a local file, the attacker puts an internal network link in the XML file (like `http://192.168.1.50/admin`). The server connects to that internal link. This allows the attacker to reach private systems that are not connected to the internet.