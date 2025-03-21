// C++ example with buffer overflow vulnerability
#include <iostream>
#include <cstring>

void processInput(const char* input) {
    // SECURITY ISSUE: Fixed-size buffer with unchecked strcpy
    // can lead to buffer overflow attacks
    char buffer[10];
    
    // Vulnerable code
    strcpy(buffer, input);  // No bounds checking
    
    std::cout << "Processed: " << buffer << std::endl;
}

int main() {
    // Example usage with malicious input
    const char* userInput = "This string is way too long and will overflow the buffer";
    processInput(userInput);
    
    return 0;
}

