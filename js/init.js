$(document).ready(function(){
  // Get the template HTML and remove it from the doumenthe template HTML and remove it from the doument
  var previewNode = document.querySelector("#template");
  previewNode.id = "";
  var previewTemplate = previewNode.parentNode.innerHTML;
  previewNode.parentNode.removeChild(previewNode);

  var myDropzone = new Dropzone('.drag', { // Make the whole body a dropzone
    url: "/", // Set the url
    thumbnailWidth: 80,
    thumbnailHeight: 80,
    parallelUploads: 20,
    previewTemplate: previewTemplate,
    autoQueue: false, // Make sure the files aren't queued until manually added
    previewsContainer: "#previews", // Define the container to display the previews
    clickable: ".drag", // Define the element that should be used as click trigger to select files.
    acceptedFiles: "image/*",
    maxFilesize: 2
  });

  myDropzone.on("addedfile", function (file) {
    // Hookup the start button
    var imageCode = file.previewTemplate.querySelector('.imagecode');
    var cssCode = file.previewTemplate.querySelector('.csscode');
    var modalDetail = file.previewTemplate.querySelector('.imagedetail');
    addDetail(modalDetail, file);

    addCopyEventLister(imageCode, file, 'image');
    addCopyEventLister(cssCode, file, 'css');

  });

  function addDetail(modalDetail, file) {
    var FR = new FileReader();
    FR.addEventListener("load", function (e) {
      modalDetail.dataset.url = e.target.result;
    });

    FR.readAsDataURL(file);

    modalDetail.dataset.name = file.name;
    modalDetail.dataset.size = (file.size/1000).toFixed(1)+'KB';
  }
  function addCopyEventLister(imageElement, file, type) {
    var FR = new FileReader();
    FR.addEventListener("load", function (e) {
      imageElement.dataset.image = type == 'css' ? 'url('+e.target.result+')' : e.target.result;
    });

    FR.readAsDataURL(file);

    imageElement.onclick = function () {
      document.execCommand("copy");
    };
    imageElement.addEventListener("copy", function (event) {
      event.preventDefault();
      if (event.clipboardData) {
        event.clipboardData.setData("text/plain", imageElement.dataset.image);
      }
    });
  }

  $('#exampleModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var name = button.data('name'),
      size = button.data('size'),
      url = button.data('url');
      
    var modal = $(this)
    modal.find('.modal-body .filename').text(name);
    modal.find('.modal-body .filesize').text(size);
    modal.find('.modal-body .image_thumb').attr('src', url);
    modal.find('.modal-body .imagecode').text(url);
    modal.find('.modal-body .csscode').text('url('+url+'\')');
    enableClipBoardCopy();
  })

  var copyToClipboard;
  function enableClipBoardCopy(){
    copyToClipboard = document.querySelector('.base64data');
    
    copyToClipboard.onclick = function (event) {
      if (event.target.classList[0] == 'copytoclipboard')
        copyTextToClipboard(event.target);
    };

    function copyTextToClipboard(e) {
      if (!navigator.clipboard) {
        fallbackCopyTextToClipboard('text');
        return;
      }
      navigator.clipboard.writeText(e.parentElement.nextSibling.nextElementSibling.innerText).then(function () {
        console.log('Async: Copying to clipboard was successful!');
      }, function (err) {
        console.error('Async: Could not copy text: ', err);
      });
    }
  }

  $("#bse64form").on('submit', function(e){
    e.preventDefault();
    var imageUrl = $("#imageUrl").val();
    toDataURL(imageUrl, function (dataUrl, response) {
      console.log('RESULT:', dataUrl, response);
      var previewHtmlElement = addFileDetails(dataUrl, response);
      $("#profile #previews").append(previewHtmlElement);
    })

  });

  function addFileDetails(dataUrl, response) {
    return '<div id="template" class="file-row container dz-image-preview">'+
      '<div class="row" >'+
      '<div class="col-2">'+
      '<span class="preview"><img src="' + dataUrl+'" data-dz-thumbnail style="width:80px"/></span>'+
      '</div>'+
      '<div class="col-2">'+
      '<p class="size" data-dz-size>' + (response.size / 1000).toFixed(1) + 'KB'+'</p>'+
      '</div>'+
      '<div class="col-2">'+
                '<button type="button" class="btn btn-primary imagedetail" data-url="'+dataUrl+'"'+
      'data-size="' + (response.size / 1000).toFixed(1) + 'KB'+'" data-toggle="modal" data-target="#exampleModal">'+
          'Show Code'+
                '</button>'+
      '</div>'+
      '<div class="col-2">'+
      '<p class="imagecode pointer" data-image="' + dataUrl +'">Copy Image</p>'+
      '</div>'+
      '<div class="col-2">'+
      '<p class="csscode pointer" data-image="url(' + dataUrl +')">Copy Css</p>'+
      '</div>'+
            '</div >'+
          '</div >';
  }

  function toDataURL(url, callback) {
    var xhr = createCORSRequest('GET', url) 
    xhr.onload = function () {
      var reader = new FileReader();
      reader.onloadend = function () {
        callback(reader.result, xhr.response);
      }
      console.log(xhr.response);
      reader.readAsDataURL(xhr.response);
    };
    xhr.responseType = 'blob';
    xhr.send();
  }

  function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
      xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
      xhr = new XDomainRequest();
      xhr.open(method, url);
    } else {
      xhr = null;
    }
    return xhr;
  }
});
