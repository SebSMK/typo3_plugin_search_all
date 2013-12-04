login();

function login(){
	    //The json api requires login before we can query it
	    //Call must be async or cookie will not be saved and login will fail (ajax bug)
	    var loginUrl = "http://cstest:8180/collectionspace/tenant/smk/login",   
	        data = "userid=reader%40smk.dk&password=reader"; 
	    $.ajax({
	        type: "POST",
	        url: loginUrl,
	        data: data,
	        crossDomain: true,
	        headers: {
	            Accept : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
	            "Content-Type": "application/x-www-form-urlencoded"
	        },
	        xhrFields: {
	            /*Use this header to indicate that cookies should be included in CORS requests*/
	            withCredentials: true 
	        },  
	        success: function(data, status, jqXHR){
	          //  getArtworksByArtistName("urn:cspace:smk.dk:personauthorities:name(person):item:name(WilhelmBendz1376477637014)'Wilhelm Bendz'");
	         // getArtworksByArtistName(artistName);
	        },
	        error: function(xhr, ajaxOptions, thrownError){
	            //Try anyway. Successful login returns a 303 redirect, which Chrome will 
	            //cancel (chrome bug) and throw this error - but we don't care as long as the login 
	            //request succeeded and the response set our cookie
	            //urn:cspace:smk.dk:personauthorities:name(person):item:name(HenrideToulouseLautrec1376477638585)'Henri de Toulouse-Lautrec'
	            //getArtworksByArtistName("urn:cspace:smk.dk:personauthorities:name(person):item:name(WilhelmBendz1376477637014)'Wilhelm Bendz'");
	         //   getArtworksByArtistName(artistName);
	        }
	    });
	}