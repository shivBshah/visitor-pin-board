
    document.getElementById("next-btn").addEventListener('click', (event)=>{
          document.getElementById("form").classList.toggle("show");
    });
    
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
       
        
    }

