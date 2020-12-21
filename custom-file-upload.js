var formParams = {
	fileBlob: '',
	inputFileID: '$("#custom_fileupload")',
	randomNumber: '',
	fileUploadUrl: 'https://graph.microsoft.com/v1.0/sites/enfield365.sharepoint.com,8aefec91-2c1c-46fd-b8b3-5432b919e464,02b1cf68-eb76-454d-b501-e1642db1f5d9/drive/items/'
}

function imitateKdfReady (event, kdf) {

	var CustomFileUploadWidget=$('#custom_fileupload_holder');

	if(CustomFileUploadWidget.length>0){

        	var widget = '<div data-type="file" data-name="file_ootb" data-active="true" data-agentonly="false" class="container dform_widget  dform_widget_field dform_widget_type_file dform_widget_file_ootb dform_widget_ file-progress">' + 
							  '<div><input id="custom_fileupload" type="file" name="uploadedFile" data-maxsize="5000000">' +
							'<div class="dform_fileupload_progressbar" id="custom_fileupload_progressbar"></div>'+
							 '<div class="dform_filenames" id="custom_fileupload_files"></div><br><br></div>'+
						  ' </div>'	;

			CustomFileUploadWidget.html(widget);
			
            formParams.randomNumber = Math.floor((Math.random() * 100000) + 1);
	}
 
    $("#custom_fileupload").change(function(){
            $(".dform_fileupload_progressbar").html("<div style='width: 0%;'>");
            var selector = formParams.inputFileID;
            var fileName = $("#custom_fileupload")[0].files[0].name;
            $(".dform_fileupload_progressbar").html("<div style='width: 10%;'>");
            var reader = new FileReader();
             reader.readAsArrayBuffer($("#custom_fileupload")[0].files[0]);
              
              reader.onloadend = function() {
                setFileBlobData(reader.result);
                
                $(".dform_fileupload_progressbar").html("<div style='width: 30%;'>");
                KDF.customdata('sharepoint_token', 'imitateKdfReady', true, true, {});

              };
            
       });

        function setFileBlobData (fileBlob){
            formParams.fileBlob = fileBlob;
        }
}

function imitateKDFCustom (response, action) {
        if (action === 'sharepoint_token') {
        	var access_token = response.data['access_token'];
            sharepointFileUploader(access_token);
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

function sharepointFileThumbnail (itemID, access_token){
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
        $(".dform_fileupload_progressbar").html("<div style='width: 60%;'>");

        if(KDF.getVal('txt_filename_one_thumb') == ''){
            KDF.setVal('txt_filename_one_thumb', response.value[0].small['url']);
        } else {
        	KDF.setVal('txt_filename_two_thumb', response.value[0].small['url']);
        }

        setTimeout(function(){ addFileContainer(); $(".dform_fileupload_progressbar").html("<div style='width: 80%;'>"); }, 1000);
    });
}

function addFileContainer() {
    var fileName;
    var fileThumbnail;

	if(KDF.getVal('txt_sharepointID_one') !== '' && KDF.getVal('txt_sharepointID_two') == ''){
         fileName = KDF.getVal('txt_filename_one');
         fileThumbnail = KDF.getVal('txt_filename_one_thumb');
	} else if (KDF.getVal('txt_sharepointID_one') !== '' && KDF.getVal('txt_sharepointID_two') !== '') {
		fileName = KDF.getVal('txt_filename_two');
         fileThumbnail = KDF.getVal('txt_filename_two_thumb');
	}

	console.log(fileName)

	$(".dform_filenames").append('<span> <img style="width: 96px; height: 96px" class="file_thumbnail" src='+ fileThumbnail  + '>' + fileName + '<span class="file_delete">4</span></span>');
         //<img class="obj" src="C:/fakepath/peacock-clean.jpg">

     $("#custom_fileupload").attr("value", "");
     $(".dform_fileupload_progressbar").html("<div style='width: 100%;'>");
}
