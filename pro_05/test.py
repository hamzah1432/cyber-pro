import base64
from urllib.parse import quote, unquote

original_token_b64 = 'kcEjWy5OwU8D89An4yckuQ%3D%3D'

clean_b64 = unquote(original_token_b64)

iv = bytearray(base64.b64decode(clean_b64))

old = b'guest'
new = b'admin'

for i in range(len(old)):
    iv[i] ^= old[i] ^ new[i]

admin_token = quote(base64.b64encode(iv).decode())
print('Your Admin Token:', admin_token)
