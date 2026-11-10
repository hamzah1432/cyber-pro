# XSS Payloads

During the test on the vulnerable page, I noticed that standard XSS payloads using `<script>` tags did not work. This means the application either blocks the `<script>` tag or the input is already placed inside a JavaScript execution context.

To bypass this filter, I used pure JavaScript code directly.

Here are the successful payloads I used to display the cookie:

### 1. The Console Payload
This code successfully executed and printed the cookie value inside the browser's developer console.
```javascript
console.log(document.cookie);
```

### 2. The Alert Payload
This code successfully executed and displayed a pop-up alert box on the screen containing the cookie value.
```javascript
alert(document.cookie);
```

### Result
Both payloads successfully bypassed the restrictions and revealed the target cookie value.