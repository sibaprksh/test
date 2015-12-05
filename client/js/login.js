
// show/hide login & registration tab
$(function() {
	
    $('#login-form-link').click(function(e) {
		e.preventDefault();
		$("#login-form").delay(100).fadeIn(100);
 		$("#register-form").fadeOut(100);
		$('#register-form-link').removeClass('active');
		$(this).addClass('active');		
	});
	$('#register-form-link').click(function(e) {
		e.preventDefault();
		//alert("disabled - login.js(14)");
		//return false;
		$("#register-form").delay(100).fadeIn(100);
 		$("#login-form").fadeOut(100);
		$('#login-form-link').removeClass('active');
		$(this).addClass('active');		
	});

	$(".social-container").on("click","a",function(event){
		event.preventDefault();
		var $this = $(this);
		var href = $this.attr("href");
		
		if( !href ){
			alert("Not Available for Now");
			return;
		}	
		location.href= href;
		console.log( "social clicked " + href );
	});

});


// form validation & submit ( login & registration )
$(function() {
	
	$("#login-form").validate({
		errorPlacement: function(error, element) {				
			$(element).closest("div").find('.error_label').html(error);
		}
	});

	$("#login-form").on("submit",function(e){
		e.preventDefault();

		if($(this).valid()){
			console.log($(this).serialize());

			// $.ajax({
			// 	url : "/rest/auth/login",
			// 	type : "POST",
			// 	data : data,
			// 	success : function(response){
			// 		debugger;
			// 		if(response.flag == 1){						
			// 			amplify.store.sessionStorage("AuthUser",response.AuthUser);
			// 			alert("success");
			// 			location.href = "/home";
			// 		}else{
			// 			alert("failed");
			// 		}
			// 	}
			// });			

			$.post('/auth/local', {
				password : $("#password").val(),
				email : $("#username").val()
			}).done(function (result) {
				//connect_socket(result.token,result.uId);
				$.cookie("token",result.token	);
				$.cookie("uId",result.uId);
				location.href = "/";
			});
		};		
	});


	$("#register-form").validate({
			validClass: "success",
			errorClass: "invalid",
			success: function(label,element) {
				//~ label.addClass("valid-01").text("Great going!")
				//~ label.text("Ok!").removeClass("error").addClass("succ");
			},
			rules: {
				pass: "required",
				confirm_pass: {
					  equalTo: "#pass"
				},
				email: {
				  required: true,							 
				  remote: {
					  url : "api/users/check-email",
					  contentType : 'application/json',
					  data: {
						  email: function(){
							  return $('#email').val();
						  }
					  },
					  beforeSend: function () {
							console.info('before send');
							$("#email-success").empty();
					  },								  						  
					  dataFilter: function(data) {						    
							data = JSON.parse(data);
							if(data.flag == 1){
								$("#email-success").text("Congrats! You can use this email");
								return true;
							}else{
								return false;
							}
							//return '"Available"';
					 }
				  }
				} 							
			  },
			messages: {
				email: {
				  required: "This field is required",							  
				  remote: "Email address already in use. Please use other Email."
				}
			},
			errorPlacement: function(error, element) {							
				$(element).closest("div").find('.error_label').html(error);
			},
			highlight: function (element, errorClass, validClass) {				
				$(element).parent().addClass(errorClass).removeClass(validClass);
			},
			unhighlight: function (element, errorClass, validClass) {				
				$(element).parent().removeClass(errorClass).addClass(validClass);
			}
	});

	$("#register-form").on("submit",function(e){
		e.preventDefault();

		if($(this).valid()){
			console.log($(this).serialize());
			var data = {
					password : $("#pass").val(),
					email : $("#email").val(),
					name : $("#fName").val() + ' ' + $("#lName").val()	
				}

			$.ajax({
				url : "/api/users",
				type : "POST",
				data : data,
				success : function(response){
					debugger;
					
					alert("success. please login");
					$('#login-form-link').trigger("click");						
					
				}
			});			
		};		

	});

});
