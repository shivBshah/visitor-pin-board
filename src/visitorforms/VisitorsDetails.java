/*
 This class acts as a model class, holding getters, setters, and properties
 */
package visitorforms;

import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;

/**
 *
 * @author SBS
 */
public class VisitorsDetails {
    private StringProperty firstname;
    private StringProperty lastname;
    private StringProperty email;
    private StringProperty phone;
    
    public VisitorsDetails(String fname, String lname, String email, String phone){
        this.firstname = new SimpleStringProperty(fname);
        this.lastname = new SimpleStringProperty(lname);
        this.email = new SimpleStringProperty(email);
        this.phone = new SimpleStringProperty(phone);
    }
    
    //getters
    public String getFname(){
        return firstname.get();
    }
    
    public String getLname(){
        return lastname.get();
    }
    
    public String getEmail(){
        return email.get();
    }
    
    public String getPhone(){
        return phone.get();
    }
    
    //setters
    public void setFname(String fname){
        firstname.set(fname);
    }
      
    public void setLname(String lname){
        lastname.set(lname);
    }
    
    public void setEmail(String email){
        this.email.set(email);
    }

    public void setPhone(String phone){
        this.phone.set(phone);
    }
    
    public StringProperty fnameProperty(){
        return firstname;
    }
    
    public StringProperty lnameProperty(){
        return lastname;
    }
    
    public StringProperty emailProperty(){
        return email;
    }
    
    public StringProperty phoneProperty(){
        return phone;
    }
}
