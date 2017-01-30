/*
 This class acts as a model class, holding getters, setters, and properties
 */
package visitorforms;

import javafx.beans.property.StringProperty;

/**
 *
 * @author SBS
 */
public class VisitorsDetails {
    private String firstname;
    private String lastname;
    private String email;
    private int phone;
    
    public VisitorsDetails(String fname, String lname, String email, int phone){
        this.firstname = fname;
        this.lastname = lname;
        this.email = email;
        this.phone = phone;
    }
    
    //getters
    public String getFname(){
        return firstname;
    }
    
    public String getLname(){
        return lastname;
    }
    
    public String getEmail(){
        return email;
    }
    
    public int getPhone(){
        return phone;
    }
    
    //setters
    public void setFname(String fname){
        firstname = fname;
    }
      
    public void setLname(String lname){
        lastname = lname;
    }
    
    public void setEmail(String email){
        this.email = email;
    }

    public void setPhone(int phone){
        this.phone = phone;
    }
}
