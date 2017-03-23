window.onload = function(){
    document.querySelector('button[type="submit"]').addEventListener('click', (e)=>{
    e.preventDefault();

    let user = document.querySelector('input[type="user"]').value;
    let password= document.querySelector('input[type="password"]').value;

    let conn = dbConnection();

    conn.connect();
    conn.query(`select * from admin where user_name = "${user}" and password = "${password}"`, function(err, rows, fields){
        if (err) throw err;
        if (rows.length > 0) {
          document.getElementById("invalid").innerHTML = "";
          document.querySelector(".form").submit();
        }
        else{
          document.getElementById("invalid").innerHTML = "Invalid Username and Password";
          document.querySelector(".alert").classList.toggle("alert-danger",true);
        }
      });
   });
};
