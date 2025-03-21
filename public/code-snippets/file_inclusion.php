<?php
// PHP example with local file inclusion vulnerability

// SECURITY ISSUE: Directly using user input in file inclusion
// can lead to LFI/RFI attacks

function loadTemplate($template) {
    // Vulnerable code
    include($template);  // No validation or sanitization
}

// Example usage with malicious input
$userTemplate = $_GET['template'];  // e.g. "../../../../etc/passwd"
loadTemplate($userTemplate);

// A safer approach would be:
// $allowedTemplates = ['home', 'about', 'contact'];
// if (in_array($userTemplate, $allowedTemplates)) {
//     include("templates/{$userTemplate}.php");
// }
?>

<html>
<body>
    <h1>Welcome to our website</h1>
    <?php
    // More code...
    ?>
</body>
</html>

