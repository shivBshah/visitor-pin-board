/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package visitorforms;

import com.mysql.jdbc.Connection;
import java.net.URL;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ResourceBundle;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.TextField;
import javafx.scene.control.cell.PropertyValueFactory;
import javax.swing.JOptionPane;

/**
 *
 * @author SBS
 */
public class FXMLDocumentController implements Initializable {
    
    private Label label;
    @FXML
    private TextField txtFname;
    @FXML
    private TextField txtLname;
    @FXML
    private TextField txtEmail;
    @FXML
    private TextField txtPhone;
    @FXML
    private Button btnSave;
    @FXML
    private TableView<VisitorsDetails> tblView;
    @FXML
    private TableColumn<VisitorsDetails, String> colFname;
    @FXML
    private TableColumn<VisitorsDetails, String> colLname;
    @FXML
    private TableColumn<VisitorsDetails, String> colEmail;
    @FXML
    private TableColumn<VisitorsDetails, Integer> colPhone;
    
    private DatabaseConnection dcon;
    private ObservableList<VisitorsDetails> data;
    private Connection conn;
    
    @Override
    public void initialize(URL url, ResourceBundle rb) {
        // TODO
        dcon = new DatabaseConnection();
        conn = dcon.connect();
        displayFromDatabase();
    }    

    @FXML
    private void populateTable(ActionEvent event) {
        String fname = txtFname.getText();
        String lname = txtLname.getText();
        String email = txtEmail.getText();
        String phone = txtPhone.getText();
        
        String error = validate(fname,lname,phone);
        if (!error.equals("")) {
            JOptionPane.showMessageDialog(null,error);
            return;
        }
        saveToDatabase(fname,lname,email,phone);
        clearForm();
        displayFromDatabase();
    }
    
    private String validate(String fname, String lname, String phone){
        String error = "";
        if (fname.equals(""))
                error = "Enter First Name";
        else if (lname.equals(""))
            error = "Enter Last Name";
        else if (phone.equals(""))
            error = "Enter Phone";
        return error;
    }
    
    private void clearForm(){
        txtFname.setText("");
        txtLname.setText("");
        txtEmail.setText("");
        txtPhone.setText("");
    }
    
    private void saveToDatabase(String fname,String lname,String email,String phone){
        
            try {
                //execute query and store data in database
                String query = "INSERT INTO VISITOR(Fname,Lname,Email,Phone) VALUES(?,?,?,?)";
                PreparedStatement pst = conn.prepareStatement(query);
                pst.setString(1, fname);
                pst.setString(2, lname);
                pst.setString(3, email);
                pst.setString(4, phone);
                int i = pst.executeUpdate();
                if (i>0){
                    JOptionPane.showMessageDialog(null, "Data saved successfully!!!");
                }        
                else {
                    JOptionPane.showMessageDialog(null, "Error Saving Data!!!");
                }

            } catch (Exception e){
                JOptionPane.showMessageDialog(null, e);
            }
                
    }
    
    private void displayFromDatabase(){
        try {
            data = FXCollections.observableArrayList();

            //execute query and store result in a resultset
            String query = "SELECT * FROM VISITOR ORDER BY Fname";
            ResultSet rs = conn.createStatement().executeQuery(query);
            while (rs.next()) {
                String fname = rs.getString("Fname");
                String lname = rs.getString("Lname");
                String email = rs.getString("Email");
                String phone = rs.getString("Phone");
                data.add(new VisitorsDetails(fname,lname,email,phone));
            }
        } catch (Exception e){
            JOptionPane.showMessageDialog(null, e);
        }
        
        colFname.setCellValueFactory(new PropertyValueFactory<>("fname"));
        colLname.setCellValueFactory(new PropertyValueFactory<>("lname"));
        colEmail.setCellValueFactory(new PropertyValueFactory<>("email"));
        colPhone.setCellValueFactory(new PropertyValueFactory<>("phone"));
        
        tblView.setItems(null);
        tblView.setItems(data);
    }
    
}
