
	function sendDesktopNotification(){
		if (!Notification) {
   			 //alert('Desktop notifications not available in your browser.'); 
   			 return;
  		}

 		if (Notification.permission !== "granted")
    		Notification.requestPermission();
  		else {
   		 var notification = new Notification('New Message Received', {
     	 icon: 'msg.png',
     	 body: "You have received a new message!",
   		 });

    	notification.onclick = function () {
     	 //window.open("http://www.google.com");      
    	};

 		 }

	}
		$(function(){
			var socket = io.connect();
			var audio = new Audio('alert.mp3');
			var $userFormContainer =  $('#userFormContainer');
			var $userForm =  $('#userForm');
			var $username =  $('#username');
			var $initiallyHiddenContent =  $('#initiallyHiddenContent');
			var $users =  $('#users');
			var me = '';
			var $messageForm =  $('#messageForm');
			var $message =  $('#message');
			
			if(localStorage.username != null){
				 socket.emit('connect again', localStorage.username, function(data){
				 	if(data){
				 		me = localStorage.username;
				    	$initiallyHiddenContent.show();
				 	}
				 	else{
				 		localStorage.removeItem('username');
						location.reload();
				 	}
				 	

				 });
				 	 
				
			}
			if (Notification.permission !== "granted"){
    		Notification.requestPermission();
    		}
			
			socket.on('get users', function(data){
				var html = '';
				$('#selectUsers').empty();
				

				for(i=0; i < data.length; i++){
					
					if(data[i] == me){
						html += '<li class="list-group-item" style="color:red">' +data[i]+' (You)</li>';

					}
					else{
						html += '<li class="list-group-item">' +data[i]+'</li>';
						$('#selectUsers').append('<option value="'+data[i]+ '">' +data[i]+ '</option');
					}
					

				}
				if( $('#selectUsers').has('option').length < 1 ) {
					$('#selectUsers').append('<option value="nousersonline">No online users</option');
				}
				$users.html(html);
				

			});


			$userForm.submit(function(e){
				e.preventDefault();
				if(!$username.val().length == 0){

					socket.emit('new user', $username.val(), function(data){

							if(data){
							localStorage.username = $username.val();
							me = $username.val();
							$userFormContainer.hide();
							$initiallyHiddenContent.show();
							$username.val('');
							
							}
							else{
								alert("Username taken pick another one");

							}
								
					});

				}

			});



			$messageForm.submit(function(e){
				e.preventDefault();

				if(!$message.val().length == 0 && $('#selectUsers').val() !== "nousersonline" ){
					socket.emit('send message', {msg:$message.val(), to:$('#selectUsers').val()});
					$message.val('');
					
				}
				/*
				else{
					socket.emit('send message', {msg:$message.val(), to:localStorage.username});
					$message.val('');

				}
				*/

			});

			socket.on('new message', function(data){
				if(data.user == me){
					$('#messages').append('<li class="list-group-item"  class="well" style="color:red"><strong>You</strong>: ' +data.msg+ '</li');
					$('#listofMessages').scrollTop($('#listofMessages')[0].scrollHeight);

				}
				if(data.to == me){
					$('#messages li').removeAttr("id");
					$('#messages').append('<li class="list-group-item"  class="well" id="newMsgStyle"><strong>'+data.user+'</strong>: ' +data.msg+ '</li');
					$('#listofMessages').scrollTop($('#listofMessages')[0].scrollHeight);
					var totalMSG = parseInt($('#newMsgTotalNumber').html()) + 1;
					$('#newMsgTotalNumber').html(totalMSG);
					audio.play();
					$('#newMsgTotalNumber').show();
					sendDesktopNotification();

					

				}
				
			});

		});