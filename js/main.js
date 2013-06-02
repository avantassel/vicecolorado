/**
 * team vice
 */
//$.noConflict();
$( document ).ready(function() {

  

    
  $.getJSON('http://access.alchemyapi.com/calls/url/URLGetText?apikey=a5a1d2e955f4341a09eb371bac9847bf9b737202&outputMode=json&jsonp=?&url=http://data.opencolorado.org/storage/f/2013-06-02T135644/Amendment64UseRegulationofMarijuana.html',  function(json) {
    $('#cannabisLegalText').html(json.text);
  });

  $.getJSON('http://access.alchemyapi.com/calls/url/URLGetText?apikey=a5a1d2e955f4341a09eb371bac9847bf9b737202&outputMode=json&jsonp=?&url=http://data.opencolorado.org/storage/f/2013-06-02T160426/Colorado-Drunk-Driving-Laws.html',  function(json) {
    $('#duiLegalText').html(json.text);
  });

  getCrime();
    
    function plotRacks(data){
  
      $.each(data,function(){
        
        //console.log(this.coordinates);
        // create a graphic


        // add graphic to layer


      });
      // add layer to map

    }
    function getCrime(){
      $.getJSON('https://api.mongolab.com/api/1/databases/vice/collections/crimes?apiKey=4e948b48e4b015bfc597e6d4',{},
        function(data){
          if(data)
            plotRacks(data);
        ;},'jsonp')
    }

        $('.filter').on('click', function() {
        var layerName = $(this).data('layer')?eval('layer_'+$(this).data('layer')):false;
        if (!layerName)
          return;
        if ( $(this).hasClass("visible") ) {
            layerName.hide();
            $(this).removeClass("visible");

        } else {
            layerName.show();
            $(this).addClass("visible");
        }
        
    });

    


});


function maploaded(event) {

        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(loadUserLocationSuccess.bind(this), loadUserLocationFailed);
        }
    }

    function loadUserLocationFailed(event) {
            console.log(event.toString());
        } 

    function loadUserLocationSuccess(position) {

        if (position.coords.latitude && position.coords.longitude) {
            map.centerAndZoom( new esri.geometry.Point([position.coords.longitude,position.coords.latitude]),14 );

            var locator = new esri.tasks.Locator("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Locators/ESRI_Geocode_USA/GeocodeServer");
            locator.locationToAddress(new esri.geometry.Point([position.coords.longitude,position.coords.latitude]), 100);

            dojo.connect(locator, "onLocationToAddressComplete", function(candidate) {
              
              console.log(candidate);

              var graphic = new esri.geometry.Point([position.coords.longitude,position.coords.latitude]);
              var symbol = new esri.symbol.PictureMarkerSymbol( {
                  "url":'images/pins/here_icon.png',
                  "height":20,
                  "width":20,
                  "type":"esriPMS"
              });

              symbol.setColor(new dojo.Color([0,0,0]));

              var infoTemplate = new esri.InfoTemplate("Your Location", "<span>Welcome to Galvanize!</span><br />Street: ${Address}<br />City: ${City}<br />State: ${State}<br />Zip: ${Zip}");

              //map.graphics.add(graphic, symbol);
              //layer_crimes.add(new esri.Graphic(graphic, symbol));

              if (candidate.address) {
                var graphic = new esri.Graphic(graphic, symbol, candidate.address, infoTemplate);
                map.graphics.add(graphic);
                map.infoWindow.setTitle(graphic.getTitle());
                map.infoWindow.setContent(graphic.getContent());
                var screenPnt = map.toScreen(candidate.location);
                map.infoWindow.show(screenPnt,map.getInfoWindowAnchor(screenPnt));
              }
          });
          
          //sendGridEMail(candidate.address);

        };
      }
