/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package visitorforms;

import com.mysql.jdbc.Connection;
import java.net.URL;
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
    
    /*private void handleButtonAction(ActionEvent event) {
        System.out.println("You clicked me!");
        label.setText("Hello World!");
    }*/
    
    @Override
    public void initialize(URL url, ResourceBundle rb) {
        // TODO
        dcon = new DatabaseConnection();
    }    

    @FXML
    private void populateTable(ActionEvent event) {
        displayFromDatabase();
    }
    
    private void displayFromDatabase(){
        try {
            Connection conn = dcon.connect();
            data = FXCollections.observableArrayList();

            //execute query and store result in a resultset
            String query = "SELECT * FROM visitor";
            ResultSet rs = conn.createStatement().executeQuery(query);
            while (rs.next()) {
                String fname = rs.getString("firstname");
                String lname = rs.getString("lastname");
                String email = rs.getString("email");
                String phone = rs.getString("phone");
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
