var formParams = {
	fileBlob: '',
	inputFileID: '$("#custom_fileupload")',
	randomNumber: '',
	allowedFileType: ['jpeg','png','jpg'],
	maxFileSize: '4000000',
	imgClickSelector: '',
	deleteFileSelector: '',
	fileUploadUrl: 'https://graph.microsoft.com/v1.0/sites/enfield365.sharepoint.com,8aefec91-2c1c-46fd-b8b3-5432b919e464,02b1cf68-eb76-454d-b501-e1642db1f5d9/drive/items/'
}

function imitateKdfReady (event, kdf) {

    if(KDF.kdf().form.readonly){
    	KDF.hideWidget('ahtm_custom_fileupload');
		KDF.showSection('area_file_view_mode');
    	 KDF.customdata('sharepoint_token', 'imitateKdfReady readonly', true, true, {});
    }

	var CustomFileUploadWidget=$('#custom_fileupload_holder');

	if(CustomFileUploadWidget.length>0){

        	var widget = '<div data-type="file" data-name="file_ootb" data-active="true" data-agentonly="false" class="file-progress">' + 
							  '<div><input id="custom_fileupload" type="file" name="uploadedFile">' +
							'<div class="dform_fileupload_progressbar" id="custom_fileupload_progressbar"></div>'+
							 '<div class="filenames" id="custom_fileupload_files"></div><br><br></div>'+
						  ' </div>'	;

			CustomFileUploadWidget.html(widget);
			
            formParams.randomNumber = Math.floor((Math.random() * 100000) + 1);
	}
	
	$(document).on('drop dragover', function (e) {
				e.preventDefault();
			});
			
 
    $("#custom_fileupload").change(function(){
		
		var fileError= false;
		var fileName = $("#custom_fileupload")[0].files[0].name;
		var fileNameClean = fileName.split('.').pop();
		
		if ( $("#custom_fileupload")[0].files[0].size <= formParams.maxFileSize) {
				fileError= false;
		} else {
				fileError = true;
				KDF.showError('File size is too large');
		}
		
		if (!fileError) {
			formParams.allowedFileType.forEach(function (arrayItem) {
				//console.log(arrayItem);
				//console.log(fileName.split('.').pop());
				if (arrayItem === fileNameClean.toLowerCase()){
					fileError= false;
				} else {
					fileError= true;
				}
				
			});
			
			if (fileError) {
					KDF.showError('File type is not allowed');
			}
		}
		
		if (!fileError) {
			if (KDF.getVal('txt_filename_one') == ''){
					fileError = false;
			} else if (KDF.getVal('txt_filename_two') == '') {
					fileError = false;
			} else {
					fileError = true;
					KDF.showError('Maximum file upload has reach');
			}
				
		}
		
		if (!fileError) {
			KDF.hideMessages();
            $(".dform_fileupload_progressbar").html("<div style='width: 0%;'>");
            var selector = formParams.inputFileID;
            
            $(".dform_fileupload_progressbar").html("<div style='width: 10%;'>");
			
			$("#custom_fileupload").prop('disabled', true);
			
            var reader = new FileReader();
             reader.readAsArrayBuffer($("#custom_fileupload")[0].files[0]);
              
              reader.onloadend = function() {
                setFileBlobData(reader.result);
                
                $(".dform_fileupload_progressbar").html("<div style='width: 30%;'>");
                KDF.customdata('sharepoint_token', 'imitateKdfReady', true, true, {});

              };
		}
       });

        function setFileBlobData (fileBlob){
            formParams.fileBlob = fileBlob;
        }

     $('body').on('click','img',function(){
		 
		 if(KDF.kdf().form.readonly){
		 
			console.log($(this).attr('class').closest);
		 
			formParams.imgClickSelector = $(this).attr('class');
			KDF.customdata('sharepoint_token', 'imgClickEvent', true, true, {});
		 }
	  })
	  
	   $('body').on('click','.delete_file',function(){
		 
		 console.log($(this).closest('span').attr('id'));
		 
		 formParams.deleteFileSelector = $(this).closest('span').attr('id');
		 KDF.customdata('sharepoint_token', 'imgClickEvent', true, true, {});
		
	  })
	  
	  

}

function imitateKDFCustom (response, action) {
        if (action === 'sharepoint_token') {
        	var access_token = response.data['access_token'];

        	if (!KDF.kdf().form.readonly && formParams.deleteFileSelector == '') {
                sharepointFileUploader(access_token);
        	} else if (!KDF.kdf().form.readonly && formParams.deleteFileSelector !== '') {
                deleteFile(access_token);
        	} 
			
			if (KDF.kdf().form.readonly && formParams.imgClickSelector == '') {
        		//sharepointFileThumbnail (itemID, access_token)
				console.log('asfsafs');
				if (KDF.getVal('txt_filename_one') !== ''){
					
					sharepointFileThumbnail (KDF.getVal('txt_sharepointID_one'), access_token, 'txt_filename_one')
				}
				
				if (KDF.getVal('txt_filename_two') !== ''){
					
					sharepointFileThumbnail (KDF.getVal('txt_sharepointID_two'), access_token, 'txt_filename_two')
				}
        	} else if (KDF.kdf().form.readonly && formParams.imgClickSelector !== '') {
				sharepointDownloadFile(access_token)
			}
        }
}

function sharepointFileUploader (access_token){
	var fileName = $("#custom_fileupload")[0].files[0].name;
	var fileSize = $("#custom_fileupload")[0].files[0].size;
	console.log(fileSize);

    var uploadURL = formParams.fileUploadUrl + 'root:/DFORM_FILES/' + formParams.randomNumber + '/' + fileName + ':/content';
    console.log(uploadURL);
    $(".dform_fileupload_progressbar").html("<div style='width: 50%;'>");
    console.log(formParams.fileBlob)
    $.ajax({
    	url: uploadURL, 
    	dataType: 'json',
    	processData: false,
    	headers: {'Authorization': access_token},
    	data: formParams.fileBlob,
    	method: 'PUT',
    
    }).done(function(response) {
    	console.log(response.id);
        sharepointFileThumbnail(response.id, access_token)
        $(".dform_fileupload_progressbar").html("<div style='width: 60%;'>");

        if(KDF.getVal('txt_sharepointID_one') == ''){
        	KDF.setVal('txt_sharepointID_one', response.id);
        	KDF.setVal('txt_filename_one', fileName);
        } else {
        	KDF.setVal('txt_sharepointID_two', response.id);
        	KDF.setVal('txt_filename_two', fileName);
        }

    });
	
	
}

function sharepointFileThumbnail (itemID, access_token, widgetName){
    var getThumbnailURL = formParams.fileUploadUrl + itemID + '/thumbnails';
    console.log(getThumbnailURL);

    $.ajax({
    	url: getThumbnailURL, 
    	dataType: 'json',
    	headers: {Authorization: access_token},
    	method: 'GET',
    
    }).done(function(response) {
    	console.log(response);
    	console.log(response.value[0].medium['url']);
		
		if (!KDF.kdf().form.readonly) {
			
			$(".dform_fileupload_progressbar").html("<div style='width: 60%;'>");
	
			if(KDF.getVal('txt_filename_one_thumb') == ''){
				KDF.setVal('txt_filename_one_thumb', response.value[0].medium['url']);
			} else {
				KDF.setVal('txt_filename_two_thumb', response.value[0].medium['url']);
			}
	
			setTimeout(function(){ addFileContainer(); $(".dform_fileupload_progressbar").html("<div style='width: 100%;'>"); }, 1000);
		} else {
				var thumbnailUrl = response.value[0].medium['url'];
				var html;
		
				html =	'<div id="' + widgetName + '"style="float: left;">' +
				'<div style="margin-right: 100px"><img style="width: 196px; height: 196px" class="' + widgetName + '"src=' + thumbnailUrl + '></img></div><div>' + KDF.getVal(widgetName) + '</div></div>';
		
				console.log(html)
		
				setTimeout(function(){ $('#custom_fileupload_view').append(html)}, 1000);
		}
    });
	
	$("#custom_fileupload").prop('disabled', false);
}

function addFileContainer() {
    var fileName;
    var fileThumbnail;
	var widgetName;

	if(KDF.getVal('txt_sharepointID_one') !== '' && KDF.getVal('txt_sharepointID_two') == ''){
         fileName = KDF.getVal('txt_filename_one');
         fileThumbnail = KDF.getVal('txt_filename_one_thumb');
		 widgetName = 'txt_filename_one';
	} else if (KDF.getVal('txt_sharepointID_one') !== '' && KDF.getVal('txt_sharepointID_two') !== '') {
		fileName = KDF.getVal('txt_filename_two');
         fileThumbnail = KDF.getVal('txt_filename_two_thumb');
		 widgetName = 'txt_filename_two';
	}
	//$(".dform_fileupload_progressbar").html("<div style='width: 100%;'>");
	console.log(fileName)

	$(".filenames").append('<span class="' + widgetName + '"> <img id="file_container" style="width: 196px; height: 196px" class="'+ widgetName  +'" src='+ fileThumbnail  + '><div>' + fileName + '<span id="' + widgetName +  '" style="font-weight:bold;" class="delete_file">4</span></div></span>');

     //$("#custom_fileupload").attr("value", "");
}

function sharepointDownloadFile(access_token) {
	var selector = formParams.imgClickSelector;
	var sharepointID;
	
	if (selector === 'txt_filename_one'){
		sharepointID = KDF.getVal('txt_sharepointID_one');
	} else {
		sharepointID = KDF.getVal('txt_sharepointID_two');
	}
	console.log
	var getFileURL = formParams.fileUploadUrl + sharepointID + '/preview';
	
	$.ajax({
    url: getFileURL, 
    headers: {Authorization: access_token},
    type: 'POST'
	
	}).done(function(response) {
		//console.log(response.getUrl)
		
		window.open(response.getUrl);
	}).fail(function() {
		
	});
	
	formParams.imgClickSelector = '';
}

function deleteFile (access_token){
	
	var fileID;
	var selector = formParams.deleteFileSelector;
	
	if (formParams.deleteFileSelector.includes('one')) {
			fileID = KDF.getVal('txt_sharepointID_one')
	} else if (formParams.deleteFileSelector.includes('two')) {
			fileID = KDF.getVal('txt_sharepointID_two')
	}

    var deleteURL = formParams.fileUploadUrl + fileID;
    console.log(deleteURL);
	
    $.ajax({
    	url: deleteURL, 
    	processData: false,
    	headers: {'Authorization': access_token},
    	method: 'DELETE'
		
	}).done(function(response) {
		
		console.log('done')
		console.log(selector)
		if (selector.includes('one')) {
			console.log('doneasdasd')
			$('span.txt_filename_one').remove()
			KDF.setVal('txt_sharepointID_one', '')
			KDF.setVal('txt_filename_one', '')
			KDF.setVal('txt_filename_one_thumb', '')
			
		} else if (selector.includes('two')) {
			console.log('done82182813')
			$('span.txt_filename_two').remove()
			KDF.setVal('txt_sharepointID_two', '')
			KDF.setVal('txt_filename_two', '')
			KDF.setVal('txt_filename_two_thumb', '')
		}
				
	}).fail(function() {
		KDF.showError('Delete file has failed, please try again');
	});
	
	formParams.deleteFileSelector = '';
}

function aasharepointDownloadFile(access_token) {
	var selector = formParams.imgClickSelector;
	var sharepointID;
	
	if (selector === 'txt_filename_one'){
		sharepointID = KDF.getVal('txt_sharepointID_one');
	} else {
		sharepointID = KDF.getVal('txt_sharepointID_two');
	}
	console.log
	var getFileURL = formParams.fileUploadUrl + sharepointID + '/content';
	/*
	$.ajax({
    url: getFileURL, 
    headers: {Authorization: access_token},
    type: 'GET',
	dataType: 'json',
    complete: function(response) {
		//console.log(data)
		console.log(response.getAllResponseHeaders)
		console.log(response)
		
		console.log('asd')
			if (response.redirect) {
				// data.redirect contains the string URL to redirect to
				window.location.href = response.redirect;
			}
		}
		
    }).fail(function( jqXHR, textStatus ) {
			//console.log(jqXHR.getAllResponseHeaders)
			console.log(textStatus)
	});
	*/
	
	var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
      // return if not ready state 4
      if (this.readyState !== 4) {
        return;
      }
console.log('123123123123')
      // check for redirect
      if (this.status === 302 /* or may any other redirect? */) {
        var location = this.getResponseHeader("Location");
        //return ajax.call(this, location /*params*/, callback);
		console.log(location)
		console.log('asdfasfd')
      } 

      // return data
     // var data = JSON.parse(this.responseText);
      //callback(data);
  };
  xmlhttp.open("GET", getFileURL, true);
  xmlhttp.setRequestHeader('Authorization', access_token)
  xmlhttp.send();
	
	formParams.imgClickSelector = '';
}
