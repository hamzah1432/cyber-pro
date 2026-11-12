# How to Protect Against SSTI

Protecting a web application from Server-Side Template Injection requires ensuring that user input is never evaluated as template code. Here are the best practices to fix and prevent this vulnerability:

## 1. Separate Data from Templates (Best Practice)
The most effective way to prevent SSTI is to pass user input into the template as data (variables or context), not by concatenating it directly into the template string. 
Template engines automatically sanitize variables.
* **Bad:** `render("Welcome " + user.name)`
* **Good:** `render("Welcome {{ name }}", name=user.name)`

## 2. Use Logic-Less Templates
If your application requires users to create their own templates (like custom email layouts), use a logic-less template engine. Engines like **Mustache** only allow data replacement and do not allow the execution of complex code or system functions.

## 3. Sandboxing
If you must use a feature-rich template engine and allow users to edit templates, you must configure a strict sandbox. A sandbox restricts the template environment so that it cannot access dangerous functions, system commands, or file reading operations. 
*Note: Sandboxes can sometimes be bypassed, so this should not be your only line of defense.*

## 4. Input Validation and Sanitization
Always validate user input. If the input is not supposed to contain template syntax (like `{{`, `}}`, `{%`, `%}`), filter those characters out or encode them. However, this is less effective than separating data from templates, as attackers frequently find ways to bypass filters.