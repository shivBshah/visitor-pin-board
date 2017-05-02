//let saveInfo = require('./main.js');

// Get the modal
window.onload = function(){
    let modal = document.querySelector('#myModal');

    // Get the button that opens the modal
    let btn = document.querySelector("#myBtn");

    // When the user clicks on the button, open the modal 
    btn.addEventListener('click', ()=>{
        modal.style.display = "block";
    });
};

    $(document).ready(function(){
	var current = 1;
	
	widget      = $(".step");
	btnnext     = $(".next");
	btnback     = $(".back");
    btnclose    = $(".cancel")
	btnsubmit   = $(".submit");
 
	// Init buttons and UI
	widget.not(':eq(0)').hide();
	hideButtons(current);
	setProgress(current);
 
	// Next button click action
	btnnext.click(function(){
		if(current < widget.length){ 			
                   widget.show(); 			
                   widget.not(':eq('+(current++)+')').hide();
                   console.log(widget);
  		        setProgress(current); 
	       } 		
               hideButtons(current); 
           	
       }) 	
       // Back button click action 	
       btnback.click(function(){ 		
                if(current > 1){
			current = current - 2;
			btnnext.trigger('click');
		}
		hideButtons(current);
	})
});
 
// Change progress bar action
setProgress = function(currstep){
	var percent = parseFloat(100 / widget.length) * currstep;
	percent = percent.toFixed();
	$(".progress-bar")
        .css("width",percent+"%")
    	
}
 
// Hide buttons according to the current step
hideButtons = function(current){
	var limit = parseInt(widget.length); 
 
	$(".action").hide();
 
	if(current < limit) btnnext.show(); 	if(current > 1) btnback.show();
	if (current == limit) { btnnext.hide(); btnsubmit.show();}
}

$(document).on('click','.value-control',function(){
    var action = $(this).attr('data-action')
    var target = $(this).attr('data-target')
    var value  = parseFloat($('[id="'+target+'"]').val());
    if ( action == "plus" ) {
      value++;
    }
    if ( action == "minus" ) {
      value--;
    }
    $('[id="'+target+'"]').val(value)
})
