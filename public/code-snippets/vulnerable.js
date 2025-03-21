// JavaScript example with eval() vulnerability
function processUserInput(userInput) {
  // SECURITY ISSUE: Using eval on user input is dangerous
  // as it can lead to code injection attacks
  return eval(userInput)
}

// Example usage
const userInput = "console.log('User input'); alert('XSS attack')"
const result = processUserInput(userInput)
console.log(result)

