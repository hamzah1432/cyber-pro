# Deserialization RCE Challenge

## Project Overview
This project demonstrates a critical web security vulnerability known as **Insecure Deserialization**. The vulnerable application is built using Python and the Flask framework. By exploiting this vulnerability, an attacker can achieve **Remote Code Execution (RCE)**, allowing them to run arbitrary commands on the host server.

## OWASP Classification
This vulnerability is classified by the Open Worldwide Application Security Project (OWASP). In the latest OWASP Top 10 list (2021), it falls under the category:
**A08:2021 – Software and Data Integrity Failures**

In previous OWASP Top 10 lists (like 2017), it had its own specific category: **A08:2017 – Insecure Deserialization**.

## What is Serialization and Deserialization?
To understand the vulnerability, we first need to understand how applications handle complex data:

*   **Serialization:** This is the process of taking a complex "object" in the program's memory (like a user profile with a username, role, and settings) and converting it into a format that can be easily stored or sent over a network. In Python, this is often done using a library called `pickle`, which turns the object into a stream of bytes.
*   **Deserialization:** This is the exact opposite. The server receives the byte stream (for example, from a user's cookie) and rebuilds the original object back into the program's memory.

## How the Vulnerability Works
The vulnerability happens when a web application deserializes data provided by a user *without* checking if the data is safe. 

In Python, the `pickle` library is designed to rebuild complex objects, and it can even execute custom functions during the rebuilding process. If a developer uses `pickle.loads()` on data that comes from the user (like a session cookie), an attacker can take advantage of this.

The attacker can create a special, "malicious" object on their own computer. They program this object to run system commands (like reading sensitive files or opening a backdoor). Then, they serialize this malicious object and send it to the server. 

When the server tries to deserialize the data, it blindly follows the instructions inside the malicious object. As a result, the server executes the attacker's commands. 

## Impact
The impact of this vulnerability is catastrophic. Because it leads directly to Remote Code Execution (RCE), the attacker gains complete control over the application and potentially the entire server. They can steal databases, read sensitive files like `/etc/passwd`, or destroy the system.