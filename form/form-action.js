
  /*  document.getElementById("next-btn").addEventListener('click', (event)=>{
          document.getElementById("form").classList.toggle("show");
    });*/

    document.getElementById("vform").onsubmit = function saveDate(){
        var form = document.getElementById("vform");
        let values = [];
        console.log(form.elements[0].value, " ", form.elements[0].name);

        for (let i = 0; i < form.elements.length; i++){
            let e = form.elements[i];
            if (e.type == "radio"){
                if (e.checked){
                    if (e.value == "other"){
                        values.push(form.elements[++i].value);
                    }
                    else{
                        values.push(e.value);
                    }
                }
            } else {
                if (e.name != "otherReason" && e.type != "submit"){
                    values.push(e.value);
                }
            }
        }
        console.log(values);
        alert(values);
        storeInDatabase(values);
    }

    function storeInDatabase(values){
       alert("connecting to database");
        var conn = dbConnection();

        conn.connect((err)=>{
          if(err){
            alert('Database connection error');
          } else{
            alert('Database connection successful');
          }
        });
        alert("connected to database");

        conn.query(`INSERT INTO VISITOR(Fname, Lname, Email, HomeCity, HomeState
        Zipcode, DestCity, DestState, TravelingFor, NumInParty, HearAboutCVB, Hotel)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,values, (error, results, fields) => {
          if (error) {
            return alert("An error occurred with the query", error);
          }
          alert('Thank you for visiting Monroe West-Monroe Convention and Visitors Bureau');
        });
    }
