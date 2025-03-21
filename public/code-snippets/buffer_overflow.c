// C example with buffer overflow vulnerability
#include <stdio.h>
#include <string.h>

void processInput(const char* input) {
    // SECURITY ISSUE: Fixed-size buffer with unchecked strcpy
    // can lead to buffer overflow attacks
    char buffer[10];
    
    // Vulnerable code
    strcpy(buffer, input);  // No bounds checking
    
    printf("Processed: %s\n", buffer);
}

int main() {
    // Example usage with malicious input
    const char* userInput = "This string is way too long and will overflow the buffer";
    processInput(userInput);
    
    return 0;
}

