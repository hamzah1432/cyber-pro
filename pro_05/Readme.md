# Cybersecurity Piscine Pro - Module 02: Padding Oracle

## Overview
This project focuses on discovering, analyzing, and exploiting a well-known cryptographic vulnerability known as the **Padding Oracle Attack**. The application uses a block cipher (such as AES) to manage user sessions and tokens, but it improperly handles decryption errors and padding validation, exposing an "Oracle" behavior.

## Vulnerability Description
A **Padding Oracle vulnerability** occurs when a cryptographic block cipher mode (like CBC) allows an attacker to decrypt or encrypt ciphertexts by observing the server's feedback regarding whether a decrypted block's padding is valid or invalid. 
* **The Oracle:** The server reveals information about the padding validity through distinct error messages, HTTP status code changes, or response time differences.
* **Impact:** Even without knowing the secret encryption key, an attacker can leverage this feedback loop byte-by-byte to decrypt captured tokens or forge new ones (e.g., escalating privileges from a `guest` user to an `admin` user).

## Real-World Exploitation Scenarios
1. **Session Hijacking & Privilege Escalation:** An attacker intercepts a standard user cookie or token, modifies the encrypted data using bit-flipping or padding oracle techniques, and forges an administrative session to gain unauthorized access to restricted backend systems.
2. **Sensitive Data Disclosure:** If an application stores sensitive user data (like PII or credit card fragments) inside encrypted parameters or tokens without proper integrity checks, an attacker can systematically decrypt the payload to extract confidential information.