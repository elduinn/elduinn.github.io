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

        	var widget = '<div data-type="file" data-name="file_ootb" data-active="true" data-agentonly="false" class="container dform_widget  dform_widget_field dform_widget_type_file dform_widget_file_ootb dform_widget_ file-progress">' + 
							  '<div><input id="custom_fileupload" type="file" name="uploadedFile">' +
							'<div class="dform_fileupload_progressbar" id="custom_fileupload_progressbar"></div>'+
							 '<div class="dform_filenames" id="custom_fileupload_files"></div><br><br></div>'+
						  ' </div>'	;

			CustomFileUploadWidget.html(widget);
			
            formParams.randomNumber = Math.floor((Math.random() * 100000) + 1);
	}
 
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
		 
		 console.log($(this).attr('class'));
		 
		 formParams.imgClickSelector = $(this).attr('class');
		 KDF.customdata('sharepoint_token', 'imgClickEvent', true, true, {});
		
	  })
	  
	   $('body').on('click','.delete_file',function(){
		 
		 console.log($(this).attr('class'));
		 
		 formParams.imgClickSelector = $(this).attr('class');
		 KDF.customdata('sharepoint_token', 'imgClickEvent', true, true, {});
		
	  })
	  
	  

}

function imitateKDFCustom (response, action) {
        if (action === 'sharepoint_token') {
        	var access_token = response.data['access_token'];

        	if (!KDF.kdf().form.readonly) {
                sharepointFileUploader(access_token);
        	} else if (KDF.kdf().form.readonly && formParams.imgClickSelector == '') {
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
	
			setTimeout(function(){ addFileContainer(); $(".dform_fileupload_progressbar").html("<div style='width: 80%;'>"); }, 1000);
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

	console.log(fileName)

	$(".dform_filenames").append('<span> <img id="file_container" style="width: 196px; height: 196px" class="'+ widgetName  +'" src='+ fileThumbnail  + '>' + fileName + '<span class="delete_file">4</span></span>');
         //<img class="obj" src="C:/fakepath/peacock-clean.jpg">

     //$("#custom_fileupload").attr("value", "");
     $(".dform_fileupload_progressbar").html("<div style='width: 99%;'>");
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
	var getFileURL = formParams.fileUploadUrl + sharepointID + '/content';
	
	$.ajax({
    url: getFileURL, 
	crossDomain: true,
    headers: {Authorization: access_token, 'Content-Type': 'text/plain'},
    method: 'GET',
	dataType: 'text'
    
    }).done(function(response) {
    	//console.log(response);
 
    });
	
	formParams.imgClickSelector = '';
}
