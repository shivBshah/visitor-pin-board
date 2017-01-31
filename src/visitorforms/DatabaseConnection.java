/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package visitorforms;

import com.mysql.jdbc.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author SBS
 */
public class DatabaseConnection {
    public Connection connect(){
        try {
            String url = "jdbc:mysql://krixardb.cn0cpun8b1mz.us-west-2.rds.amazonaws.com:3306/CVBDB";
            //String url = "jdbc:mysql://localhost:3306/visitors";
            String user = "dbmaster";
            String password = "CSCI4060";

            Class.forName("com.mysql.jdbc.Driver");
            Connection conn = (Connection) DriverManager.getConnection(url, user, password);
            return conn;
        }
        catch (ClassNotFoundException | SQLException ex) {
            Logger.getLogger(DatabaseConnection.class.getName()).log(Level.SEVERE, null, ex);
        }
        return null;
    }
}
