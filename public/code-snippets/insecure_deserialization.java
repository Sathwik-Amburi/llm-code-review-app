// Java example with insecure deserialization vulnerability
import java.io.*;
import java.util.Base64;

class User implements Serializable {
    private String username;
    private boolean isAdmin;
    
    public User(String username, boolean isAdmin) {
        this.username = username;
        this.isAdmin = isAdmin;
    }
    
    public boolean isAdmin() {
        return isAdmin;
    }
    
    // Other methods...
}

public class InsecureDeserialization {
    // SECURITY ISSUE: Deserializing untrusted data can lead to
    // remote code execution if the serialized data is manipulated
    
    public static User deserializeUser(String serializedData) {
        try {
            byte[] data = Base64.getDecoder().decode(serializedData);
            ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(data));
            return (User) ois.readObject();  // Vulnerable code
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    public static void main(String[] args) {
        // Example usage with potentially malicious serialized data
        String userInput = "rO0ABXNyAA11c2VyLk1hbGljaW91c...";  // Base64 encoded serialized object
        User user = deserializeUser(userInput);
        
        if (user != null && user.isAdmin()) {
            System.out.println("Admin access granted!");
        }
    }
}

