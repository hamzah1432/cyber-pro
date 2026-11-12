# Server-Side Template Injection (SSTI)

## What is it?
Server-Side Template Injection (SSTI) is a security vulnerability that happens when an application safely takes user input and embeds it directly into a template file rather than passing it as data. This allows an attacker to inject malicious template directives.

Template engines (like Jinja2, Twig, or FreeMarker) are designed to combine fixed templates with dynamic data. When user input is evaluated as part of the template logic, the template engine executes it. 

## OWASP Context
According to the OWASP Top 10, SSTI is usually classified under **A03:2021 - Injection**. Injection vulnerabilities occur when untrusted data is sent to an interpreter as part of a command or query. In the case of SSTI, the interpreter is the template engine itself.

## How does it work?
If a developer writes code like this (where `user_input` is not separated from the template structure):
`template = "Hello " + user_input`
`render(template)`

An attacker can input template syntax, such as `{{ 7 * 7 }}`. The server will process this and output `Hello 49`. Once the attacker knows the template engine is executing their input, they can use complex features of the programming language to read sensitive files (Information Disclosure) or execute system commands (Remote Code Execution).