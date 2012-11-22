

/* ******************* Document Ready **************** */
var pz_mouse_x = 0;
var pz_mouse_y = 0;

$(document).ready(function()
{ 
  // Kalender - Tag
  // Scroll-Offset
  // pz_set_calendarday_offset();
  
  // Kalender - Woche
  // Termine richtig positionieren
  // pz_set_calendarweek_events();
  
  // Init der Tages Kalender Verschiebung
  // pz_set_calendarday_dragresize_init();

  // $('<div id="hovery"></div>').prependTo(document.body);
  
	pz_screen_select_event('ul.sl1 li.selected');

/*
  $(window).bind('resize', function() {
      $('#clipboard-list').height($(window).height()-124);    }
  );
*/

  $("body").mousemove(function(e){
    pz_mouse_x = e.pageX;
    pz_mouse_y = e.pageY;
    //   var clientCoords = "( " + e.clientX + ", " + e.clientY + " )";
  });

  $(window).scroll(function(){
    
  });

});

function pz_screen_select_event(where)
{
	where = $(where).find("span.selected");
	where.unbind('click');
	where.bind('click', { selected: where }, function(e) 
	{
      // alle links innerhalb die nicht ein "nolink" haben mit bind belegen.
	  main = $(this).parent(); // $(e.data.selected).parent();

    if($(main).hasClass('hover'))
    {
      $(main).removeClass('hover');
      $('#overlay').remove();
      $(main).find("a").not(".noclick").unbind("click");
    
    }else 
    {

      // overlay - when clicked close overlay and selected
	    if ($('#overlay').length == 0) { $("body").append('<div id="overlay">.</div>'); }
      $("#overlay").bind('click', { main: main }, function(e) { $(e.data.main).find("span.selected").trigger("click"); });
      pz_setZIndex('#overlay');
      
      $(main).addClass('hover');
      pz_setZIndex(main);
      
      // clickbind on links
      $(main).find("a").not(".noclick").bind('click', { main: main }, function(e) 
      {
        $(e.data.main).find("span.selected").trigger("click");
      });            
      
    }

  });
}


function pz_hoverSelect(where)
{
  return;
	where = $(where).find("span.selected");
	where.unbind('mouseover');
	where.bind('mouseover', { selected: where }, function(e) 
	{
      // alle links innerhalb die nicht ein "nolink" haben mit bind belegen.
	  main = $(this).parent(); // $(e.data.selected).parent();

    if($(main).hasClass('hover'))
    {
      $(main).removeClass('hover');
      $(main).find("a").not(".noclick").unbind("mouseover");
    
    }else 
    {
      $(main).addClass('hover');
      pz_setZIndex(main);
      
      $(main).find("a").not(".noclick").bind('mouseover', { main: main }, function(e) 
      {
        $(e.data.main).find("span.selected").trigger("mouseover");
      });            
      
    }

  });
}


/* ******************* Tracker **************** */
var pz_timer;
function pz_tracker()
{
	clearTimeout(pz_timer);
	link = '/screen/tools/tracker/';
	$.post(link, '', function(data) {
	  if ($('#pz_tracker').length == 0)
    {
      $("body").append('<div id="pz_tracker"></div>');
    }
		$("#pz_tracker").html(data);
		pz_timer = window.setTimeout(pz_tracker, 30000);
  });
}

var pz_counter_emails = 0;
var pz_counter_attandees = 0;

function pz_updateInfocounter(emails, attandees, title)
{
  pz_counter_emails = emails;
  pz_counter_attandees = attandees;

  if(emails == 0)
  {
    $("ul#navi-main li.emails span").remove();
  }else {
		$("ul#navi-main li.emails span").remove().prepend('<span class="info1"><span class="inner">'+emails+'</span></span>');
		$("ul#navi-main li.emails:not(:has(span))").prepend('<span class="info1"><span class="inner">'+emails+'</span></span>')
  }

  if(attandees == 0)
  {
	  $("ul#navi-main li.calendars span").remove();
	  $("#calendar_event_attendee_view .info-relative span").remove();
	  
  }else
  {
		$("ul#navi-main li.calendars span").remove().prepend('<span class="info1"><span class="inner">'+attandees+'</span></span>');
		$("ul#navi-main li.calendars:not(:has(span))").prepend('<span class="info1"><span class="inner">'+attandees+'</span></span>');

		$("#calendar_event_attendee_view .info-relative span").remove().prepend('<span class="info1"><span class="inner">'+attandees+'</span></span>');
		$("#calendar_event_attendee_view .info-relative:not(:has(span))").prepend('<span class="info1"><span class="inner">'+attandees+'</span></span>');
  
  }
  $(document).attr("title",title);

}


/* ******************* check Login **************** */

var pz_login_refresh = true;

function pz_isLoggedIn(data)
{
	// data und "login" vergleichen
	if(data == "relogin") 
	{
		clearTimeout(pz_timer);
		pz_login_refresh = false;
		pz_getLoginForm()
		return false;
	}
	return true;
}

function pz_logIn()
{
	pz_loading_start("#loginbox");

	$.post("/screen/login/form/", $("#login_form").serialize(), function(data) 
	{
		if(data == 1) 
		{
			// refresh nur auf der startseite
			if(pz_login_refresh)
				location.href = "/";
			else
			 	$("#loginbox").remove();
			
		}else
		{
			$("#loginbox").replaceWith(data);
		}
  });
	return;
}

function pz_getLogin()
{

  if ($('#overlay').length > 0) { $('#overlay').trigger("click");  }
  $("body").append('<div id="overlay"></div>');
  pz_setZIndex('#overlay');
  $("#overlay").bind('click', '', function(e) { $("#loginbox").remove(); $("#overlay").remove(); });

  if ($('#loginbox').length == 0)
  {
    $("body").append('<div id="loginbox" class="popbox"></div>');
  }
  pz_loadPage("#loginbox", "/screen/login/form/");

}


/* ******************* LAYER LOADING, LOGIN **************** */

pz_zIndex = 10000;
function pz_setZIndex(layer) 
{
	pz_zIndex++;	
	$(layer).css('zIndex',pz_zIndex);
}

function pz_hide(node) {
	$(node).hide();
}

function pz_toggleClass(layer, toggleClass)
{
  if($(layer).hasClass(toggleClass))
  {
    $(layer).removeClass(toggleClass);
  }else 
  {
    $(layer).addClass(toggleClass);
  }
}

function pz_load_main(layer_id) {
	// layer laden
	// nach vor bringen / sichtbar machen
	// andere sachen nach hinten legen	
	alert("loadmain"+layer_id);
}

function pz_exec_javascript(link) {
	$.post(link, '', function(data) {
		$('body').append(data);
     });	
}

function pz_loading_start(layer_id)
{
	$('<div class="loader"></div>').appendTo(layer_id);
	// $(layer_id+" .loader").animate({ opacity: 0 }, 1000 );
}

function pz_loading_end(layer_id)
{
  $(layer_id+" .loader").remove();
  // $('<div class="loader"></div>').appendTo(layer_id);
}

function pz_loadFormPage(layer_id,form_id,link)
{
	if(layer_id.substring(0,1)!="." && layer_id.substring(0,1)!="#")
		layer_id = "#"+layer_id;

	pz_loading_start(layer_id);
	
	if(link.indexOf("?")) link += "&pz_login_refresh=1";
	else link += "?pz_login_refresh=1";
	
	$.post(link, $("#"+form_id).serialize(), function(data) {
		if(pz_isLoggedIn(data))
		{
			$(layer_id).replaceWith(data);
			$(layer_id).hide();
			$(layer_id).fadeIn("fast");
		}
		pz_loading_end(layer_id);
  });
}

function pz_loadPage(layer_id, link, funccall_ok, funccall_ok_params)
{
  if(layer_id.substring(0,1)!="." && layer_id.substring(0,1)!="#")
  	layer_id = "#"+layer_id;

	pz_loading_start(layer_id);
	
	if(link.indexOf("?")) link += "&pz_login_refresh=1";
	else link += "?pz_login_refresh=1";
	$.post(link, '', function(data) {
	
		if(pz_isLoggedIn(data))
		{
			$(layer_id).replaceWith(data);
		}
		pz_loading_end(layer_id);
  });
}

function pz_paginatePage(layer_id, link, loading_layer_id, remove_layer_id)
{
  pz_loading_start(loading_layer_id);
  
  if(link.indexOf("?")) link += "&pz_login_refresh=1";
  else link += "?pz_login_refresh=1";
  
  $.post(link, { remove_layer_id: remove_layer_id }, function(data) 
  {
  		if(pz_isLoggedIn(data))
  		{
  		  $(layer_id).append(data);
  		}
  		
  		if(typeof remove_layer_id == "string" && remove_layer_id != "")
  		  $(remove_layer_id).remove();

 		  $(loading_layer_id+" .loader").remove();
  });

}

function pz_toggleSection(section)
{
  if(section === undefined)
  {
    section = 2;
    if($(".section1").hasClass("hidden"))
    {
      section = 1;
    }
  }

  if( section == 1 )
  {
    $(".section1").removeClass("hidden"); // css("display","block");
    $(".section2 .design3col").each(function(i) {
      $(this).removeClass("design3col").addClass("design2col");
    });
  
  }else if (section == 2)
  {
  
    $(".section1").addClass("hidden");
    $(".section2 .design2col").each(function(i) {
      $(this).removeClass("design2col").addClass("design3col");
    });

  }

}

function pz_tooltipbox(t, url)
{

  layer_id = '.tooltipbox[data-tooltipbox-url="'+url+'"]';

  // load tooltip
  if ($(layer_id).length == 0)
  {
    $('.tooltipbox').remove();
    
    ttop  = parseInt($(t).offset().top);
    theight = parseInt($(t).height);
    tleft = pz_mouse_x;
  
    $("body").append('<div class="tooltipbox" style="display:none;position:absolute;left:'+tleft+'px;top:'+ttop+'px;" data-tooltipbox-url="'+url+'"><div class="content"><div></div></div></div>');

    /* $(t).addClass("bt-loading"); */

    // overlay - when clicked close overlay and selected
    if ($('#overlay').length == 0) { $("body").append('<div id="overlay">.</div>'); }
    $("#overlay").bind('click', { t: t }, function(e) { pz_tooltipbox_close(); });

    pz_setZIndex('#overlay');
    pz_setZIndex('.tooltipbox');
    

    $.ajax({
          url: url,
          t: t,
          layer_id: layer_id,
          success: function(data) 
          {
            
            /* $(t).removeClass("bt-loading"); */
            
            $(this.layer_id).children().children().replaceWith(data);
            // $(layer_id).append('<div class="footer"></div>');
            $(this.layer_id).children().append('<p class="close"><a class="close bt5" href="javascript:void(0);" onclick="pz_tooltipbox_close()"><span class="icon"></span></a></p>');
            $(this.layer_id).addClass("tooltipbox-bottom");
      
      			ttop = parseInt($(this.layer_id).css("top")) - parseInt($(this.layer_id).css("height")) - 10;
      			tleft = parseInt($(this.layer_id).css("left")) - parseInt((parseInt($(this.layer_id).css("width"))/2));
      
            if(ttop < 0)
            {
              // top outranged
              $(this.layer_id).removeClass("tooltipbox-bottom");
              $(this.layer_id).addClass("tooltipbox-left");

              ttop = pz_mouse_y - parseInt(parseInt($(this.layer_id).css("height")) / 2);
              tleft = parseInt($(this.t).offset().left) - parseInt($(this.layer_id).css("width")) - 10;
            }

            if(tleft < 0)
            {
              $(this.layer_id).removeClass("tooltipbox-bottom");
              $(this.layer_id).removeClass("tooltipbox-left");
              $(this.layer_id).addClass("tooltipbox-top");

              ttop = parseInt($(layer_id).css("top")) + 20;
              tleft = parseInt($(layer_id).css("left")) - parseInt((parseInt($(this.layer_id).css("width"))/2));

            }
      
            $(this.layer_id).css("top",ttop).css("left",tleft).css("display","block");
      
            pz_setZIndex('.tooltipbox');
                    
          }
    });

  }else 
  {
    $(layer_id).remove();
    
  }

}

function pz_tooltipbox_close()
{
  $(".tooltipbox").remove();
  $("#overlay").remove();
}

/* ******************* Emails **************** */

function pz_open_email(id,link) {

	email = $("#email-"+id);
	email_preview = $("#email-content-preview-"+id);
	email_detail = $("#email-content-detail-"+id);
	
	if(email.hasClass('open'))
	{
		email.addClass('close');
		email.removeClass('open');
		email_preview.show();
		email_detail.hide();

	}else
	{
		email.removeClass('close');
		email.addClass('open');
		email_preview.hide();
		email_detail.show();
		
		// if(email_detail.html() == "")
		pz_loadPage("email-content-detail-"+id,link);
		
	}
	
}

function pz_setEmailAutocomplete(layer) 
{
	$(layer)
		// don t navigate away from the field on tab when selecting an item
		.bind( "keydown", function( event ) {
			if ( event.keyCode === $.ui.keyCode.TAB &&
					$( this ).data( "autocomplete" ).menu.active ) {
				event.preventDefault();
			}
		})
		.autocomplete({
			source: function( request, response ) {
				$.getJSON( "/screen/addresses/addresses/", {
					mode: "get_emails",
					search_name: extractLast( request.term )
				}, response );
			},
			search: function() {
				// custom minLength
				var term = extractLast( this.value );
				if ( term.length < 3 ) {
					return false;
				}
			},
			focus: function() {
				// prevent value inserted on focus
				return false;
			},
			select: function( event, ui ) {
				var terms = split( this.value );
				// remove the current input
				terms.pop();
				// add the selected item
				terms.push( ui.item.value );
				// add placeholder to get the comma-and-space at the end
				terms.push( "" );
				this.value = terms.join( ", " );
				return false;
			}
		});
	
}

function split( val ) {
	return val.split( /,\s*/ );
}

function extractLast( term ) {
	return split( term ).pop();
}
		
function pz_setText(layer_id, text)
{

  jQuery.fn.extend({
      insertAtCaret: function(valueToInsertAtCaret)
      {
          return this.each( function(i) 
          {
              if ( document.selection ) 
              {
                  this.focus();
                  selection = document.selection.createRange();
                  selection.text = valueToInsertAtCaret;
                  this.focus();
              } else if ( this.selectionStart || this.selectionStart == "0" ) 
              {
                  var startPosition = this.selectionStart;
                  var endPosition = this.selectionEnd;
                  var scrollTop = this.scrollTop;
                  this.value = this.value.substring(0, startPosition) + valueToInsertAtCaret + this.value.substring(endPosition, this.value.length);
                  this.focus();
                  this.selectionStart = startPosition + valueToInsertAtCaret.length;
                  this.selectionEnd = startPosition + valueToInsertAtCaret.length;
                  this.scrollTop = scrollTop;
              } else 
              {
                  this.value += valueToInsertAtCaret;
                  this.focus();
              }
          })
      }
  });


  // find possible elements
  // - email textarea
  // - calendar add / edit

  $(layer_id).insertAtCaret(text);

}



/* ******************* Popbox **************** */

function pz_centerPopbox(popbox_width, popbox_height)
{
  var min_distance = 100;
  var window_height = $(window).height();
  var window_width  = $(window).width();
  
  if(typeof popbox_height == "undefined")
    var popbox_height = window_height - ( 2 * min_distance );
  if(typeof popbox_width == "undefined" || popbox_width == "")
    var popbox_width  = $('.popbox').outerWidth();
  
  $('.popbox').height(popbox_height).css('top', min_distance).css('left', ((window_width - popbox_width) / 2) );
  $('.popbox-frame').height($('.popbox').height()-$('.popbox h1').outerHeight());
  
  pz_setZIndex('.popbox');
}


/* ******************* Clipboard **************** */


// - current position
var pz_clipboard_field_layer = "";
var pz_clipboard_uploaded_list_layer = "";
var pz_clipboard_button_layer = "";

function pz_clipboard_select(button_layer, uploaded_list_layer, field_layer) 
{
	if(pz_clipboard_button_layer != "")
		$(pz_clipboard_button_layer).removeClass("current");
	
	pz_clipboard_field_layer = field_layer;
	pz_clipboard_uploaded_list_layer = uploaded_list_layer;
	pz_clipboard_button_layer = button_layer;

	$(button_layer).addClass("current");
	pz_loadClipboard();

}

function pz_closeClipboard()
{
  $('#overlay').remove();
  $('#clipboard').addClass("hidden");
  
  pz_clipboard_field_layer = "";
  pz_clipboard_uploaded_list_layer = "";
  pz_clipboard_button_layer = "";

}

function pz_loadClipboard() 
{

  if ($('#clipboard').length > 0)
  {
    $("#clipboard").remove();
  }  
  
  $("body").append('<div id="clipboard" class="popbox"></div>');

  if ($('#overlay').length > 0) { $('#overlay').trigger("click");  }
  $("body").append('<div id="overlay">.</div>');
  pz_setZIndex('#overlay');
  $("#overlay").bind('click', '', function(e) { pz_closeClipboard(); });

	if($("#clipboard").hasClass("hidden"))
	{
    $("#clipboard").removeClass("hidden");

	}else
	{
		pz_loadPage('clipboard','/screen/clipboard/my/');

	}
	pz_setZIndex('#clipboard');
	
}

function pz_clipboard_init()
{
  if(pz_clipboard_uploaded_list_layer == "")
  {
    $(".function-clip-select a").hide();
  
  }else 
  {
    $(".function-clip-select a").show();
    $(".clips .clip").removeClass("checked");
    $(pz_clipboard_uploaded_list_layer+" li").each(function()
    {
      clip_id = $(this).attr("data-clip_id");
      $(".clip-"+clip_id).addClass("checked");
    });
  
  }
}

function pz_clipboard_msg(text)
{
  // <div id="clipboard-info-message"></div>
  alert(text);
}

function pz_clip_deselect(clip_id, hidden_field) 
{
  hf = $(hidden_field);
  hf.val( hf.val().replace(clip_id+",","") );
  $("li.qq-upload-success.clip-"+clip_id).remove();
  pz_clipboard_init();
}


function pz_clip_select(clip_id, clip_name, clip_size) 
{
  if($(".qq-upload-success.clip-"+clip_id).length > 0)
  {
    pz_clip_deselect(clip_id, pz_clipboard_field_layer);
    return;
  }

	var remove_text = "remove"; // rex_i18n::msg("dragdrop_files_remove_from_list")

	// TODO:
	// Filesize noch übergeben
	// Filenamne noch übergeben
	// clip_name = qq.FileUploaderBasic._formatFileName(clip_name);
	// clip_size = qq.FileUploaderBasic._formatSize(clip_size);
	
	li = ('<li class="qq-upload-success clip-'+clip_id+'" data-clip_id="'+clip_id+'">'+
			'<span class="qq-upload-file"><a href="/screen/clipboard/get/?mode=download_clip&clip_id='+clip_id+'" target="_blank">'+clip_name+'</span>'+
			'<span class="qq-upload-size">'+clip_size+
				'<span class="clear_link">'+
					'<a href="javascript:void(0);" onclick="pz_clip_deselect($(this).parents(\'li\').attr(\'data-clip_id\'),\''+pz_clipboard_field_layer+'\');">'+remove_text+'</a></span>'+
			'</span></li>');

	$(pz_clipboard_field_layer).val($(pz_clipboard_field_layer).val()+clip_id+",");
	$(pz_clipboard_uploaded_list_layer).append(li);
	
	pz_clipboard_init();
	
}





/* ******************* Calendar **************** */



// ----- day

function pz_set_calendarday_init() 
{
  pz_set_calendarday_offset();
  pz_set_calendarday_dragresize_init();
  pz_calendarday_rearrange_events();
  
}

function pz_calendarday_rearrange_events()
{

  $(".calendar.view-day").find('article[data-event-job="1"]').each(function(i,e)
  {
    start_position = parseInt( ($(this).attr("data-event-hour-start") * 60) ) + parseInt($(this).attr("data-event-minute-start"));
    height = parseInt($(this).attr("data-event-minute-duration"));
    $(this).css("top",start_position);
    $(this).css("height",height);
    $(this).css("left",465);
    $(this).css("width",193);
  });

  articles = $(".calendar.view-day").find('article[data-event-job="0"]');

  articles.sort(function(a,b) {
    start_a = parseInt( ($(a).attr("data-event-hour-start") * 60) ) + parseInt($(a).attr("data-event-minute-start"));
    start_b = parseInt( ($(b).attr("data-event-hour-start") * 60) ) + parseInt($(b).attr("data-event-minute-start"));
    if (start_a < start_b) return -1;
    if (start_a > start_b) return 1;
    height_a = parseInt($(a).attr("data-event-minute-duration"));;
    height_b = parseInt($(b).attr("data-event-minute-duration"));;
    if (height_a > height_b) return -1;
    if (height_a < height_b) return 1;
    
    return 0;
  });

  // cleanup
  articles.each(function(i,e)
  {
    $(this)
      .removeAttr("data-calc-block")
      .removeAttr("data-calc-column")
      .removeAttr("data-calc-columns");

    start_position = parseInt( ($(this).attr("data-event-hour-start") * 60) ) + parseInt($(this).attr("data-event-minute-start"));
    height = parseInt($(this).attr("data-event-minute-duration"));
    end_position = start_position + height -1;

    $(this).css("top",start_position);
    $(this).css("height",height);
    $(this).attr("data-calc-end",end_position);
    
  });

  var current_block = 0;
  var current_column = 1;
  var columns = 0;
   
  articles.each(function(i,e)
  {
    calendar_event_id = $(this).attr("id").replace("event-","");
    start_position = parseInt( $(this).css("top") );
    end_position = parseInt( $(this).attr("data-calc-end") );

    if (current_block == 0) {
      
      // the very first element
      current_block = 1;
      current_column = 1;
      columns = 1;
      
    }else {

      block_max_end_position = 0;
      new_column = true;
      for(i=1;i<=columns;i++)
      {
        // columns max end postion
        column_max_end_position = 0;
        block_articles = $(".calendar.view-day").find('article[data-event-job="0"][data-calc-block="'+current_block+'"][data-calc-column="'+i+'"]');
        block_articles.each(function(){
          i_end = parseInt($(this).attr("data-calc-end"));
          if(column_max_end_position < i_end) {
            column_max_end_position = i_end;
          }
        });

        // block max end position
        if(column_max_end_position > block_max_end_position) {
            block_max_end_position = column_max_end_position;
        };

        // fits under column
        if (start_position > column_max_end_position && new_column) {
          current_column = i;
          new_column = false;
        }
      }

      if(start_position > block_max_end_position) {
      
        current_block++;
        current_column = 1;
        columns = 1;

      } else if(new_column) {

        columns++;
        current_column = columns;
      }
      
    }

    $(this).attr("data-calc-block", current_block);
    $(this).attr("data-calc-column", current_column);
    $(this).attr("data-calc-columns", columns);
    
    $(".calendar.view-day").find('article[data-event-job="0"][data-calc-block="'+current_block+'"]').each(function(){
      $(this).attr("data-calc-columns", columns);
    });

  });

  articles.each(function(i,e)
  {
    calendar_event_id = $(this).attr("id").replace("event-","");

    block = parseInt($(this).attr("data-calc-block"));
    column = parseInt($(this).attr("data-calc-column"));
    columns = parseInt($(this).attr("data-calc-columns"));
    
    max = 465;

    width = parseInt(max / columns);
    left = parseInt(column * width) - width;

    $(this).css("width", width);
    $(this).css("left", left);

  });

  return;
  
}


var pz_event_day_url = "/screen/calendars/event/";

// Calendar Einträge verschieben
function pz_set_calendarday_dragresize_init() {

	$("#calendar_events_day_list .dragable").draggable({
		containment: "#calendar_events_day_list .calendargrid",
		cursor: "move",
		axis: "y",
		delay: "200",
		grid: [0, 15],
		opacity: 0.75,
		scroll: true,
   	start: function(event, ui) {
   		$(".draggable").css("z-index","auto");
   		$(this).css("z-index","10000");
   	},

   	stop: function(event, ui) {
      var start_position = parseInt( ($(this).attr("data-event-hour-start") * 60) ) + parseInt($(this).attr("data-event-minute-start"));
   		var offsetY = $("#calendar_events_day_list .calendargrid").offset();
   		var y = $(this).offset();
   		var calendar_event_move_minutes = (y.top - offsetY.top) - start_position;
   		var calendar_event_id = $(this).attr("id").replace("event-","");

		  pz_loading_start("#"+$(this).attr("id"));
   		$.get(pz_event_day_url, {
   		  mode: "move_event_by_minutes", 
   		  calendar_event_id: calendar_event_id, 
   		  calendar_event_move_minutes: calendar_event_move_minutes,
   		},
   		  function(data){
   		    if(data.status == 1) {
   		   	  $("#event-" + calendar_event_id).replaceWith(data.calendar_event_dayview);
   		   	  pz_calendarday_rearrange_events();
   		   	  pz_set_calendarday_dragresize_init();
   		    } else {
   		      pz_calendarday_rearrange_events();
   		      pz_loading_end("#event-" + calendar_event_id);
   		    }
   		}, "json");
	  }
	});
	
	$( "#calendar_events_day_list .resizeable").resizable({
		handles: "s",
		minHeight: "15",
		grid: [0, 15],
		stop: function(e, ui) {
   		var calendar_event_id = $(this).attr("id").replace("event-","");
   		var calendar_event_extend_minutes = parseInt($(this).outerHeight()) - parseInt($(this).attr("data-event-minute-duration"));

		  pz_loading_start("#"+$(this).attr("id"));
   		$.get(pz_event_day_url, {
	   	  mode: "extend_event_by_minutes", 
	   		calendar_event_id: calendar_event_id, 
	   		calendar_event_extend_minutes: calendar_event_extend_minutes,
	   	},
	   	  function(data){
	   		  if(data.status == 1) {
   		   	  $("#event-" + calendar_event_id).replaceWith(data.calendar_event_dayview);
   		   	  pz_calendarday_rearrange_events();
   		   	  pz_set_calendarday_dragresize_init();
   		    } else {
   		      pz_calendarday_rearrange_events();
   		      pz_loading_end("#event-" + calendar_event_id);
   		    }
	   	}, "json");
		}
   });

}

// Calednar day offset start
function pz_set_calendarday_offset()
{
  var time = 8;
  var scroll = time * 60;
  $('.calendar.view-day .wrapper').scrollTop(scroll);
}


// ----- week

// Kalender - Woche
// Termine richtig positionieren
function pz_set_calendarweek_events()
{
  $('ul.weekdays li.weekday').each(function()
  {
    // das <li> hat ein rel mit entsprechenden Wochentag
    // das event <article> hat ebenfalls den Wochentag im rel 
    
    var $rel = $(this).attr('rel');           // Wochentag holen -> "weekday-mon", "weekday-tue"
    var $hours = $(this).find('.hours');      // Tagesstunden des Wochentages
    var $hours_position = $hours.position();  // Position der Tagesstunden-Spalte
    var $hours_width = $hours.width();
    
    var $first_column_width = $('ul.weekdays li.weekday ul.hours').width(); // Breite der Tagesstunden-Spalte
    
    // Alle Event <article> mit Wochentag holen und platzieren
    $('.events article[rel="' + $rel + '"]').each(function()
    {
      var $event = $(this);
      var $top = parseInt($event.css('top').replace('px', ''));
      var $left = parseInt($event.css('left').replace('px', ''));
      
      $top = $top + $hours_position.top;
      $left = $left + $hours_position.left - $first_column_width;
      $event.css('top', $top + 'px')
      $event.css('left', $left + 'px')
      $event.css('width', $hours_width + 'px')
    });
  });
}
// ENDE - Kalender - Woche



// ----- customerplan




function pz_set_customerplan_init() 
{

  $("#calendar_customerplan_list .draggable").draggable({
      opacity: 0.7, 
      helper: "original",
      containment: "parent",
  		cursor: "move",
  		grid: [30, 30], // wird beim ersten drag überschrieben
  		scroll: true,
  		axis: "x",
  		start: function(event, ui) 
	   	{
	   	  c = $( this ).closest(".customerplan").find(".customerplan-days li:nth-child(2)");
	   	  width = parseInt(c.css("width"))+1;
	   	  height = parseInt(c.css("height"));
	   	  $("#calendar_customerplan_list .draggable" ).draggable( "option", "grid", [width, height] );
	   	  pz_setZIndex("#"+$(this).attr("id"));
	   	  
	   	},
	   	drag: function(event, ui) 
	   	{
				// during 
			},
			stop: function(event, ui) 
	   	{
	   	  // dropped

        old_position = $(this).attr("data-event-position-left");
        c = $( this ).closest(".customerplan").find(".customerplan-days li:nth-child(2)");
	   	  width = parseInt(c.css("width"))+1;
	   	  new_position = parseInt($(this).css("left")) / width;
	   	  change_position = new_position - old_position;

        max_days = $( this ).closest(".customerplan").attr("data-customerplan-view-days");
        
        // alert(max_days + " - " + old_position + " . " + new_position);
        
        if(max_days <= new_position)
        {
          new_position = old_position;
          $(this).css("left","");
          $(this).attr("data-event-position-left",new_position);

        }else if( new_position != old_position)
        {
          $(this).css("left","");
          $(this).attr("data-event-position-left",new_position);

          $(this).removeClass("draggable");
          $(this).addClass("not-draggable");
          
          calendar_event_id = $(this).attr("data-event-id");
          calendar_event_move_days = parseInt(new_position) - parseInt(old_position);
          $(this).draggable({disabled: true});
          
          // update
          $.ajax({
            url: "/screen/calendars/event/", 
            t: this,
            old_position: old_position,
            data: {
      	   		      mode: "move_event_by_day", 
      	   		      calendar_event_id: calendar_event_id, 
      	   		      calendar_event_move_days: calendar_event_move_days 
      	   		    },
      	   	dataType: "json",
	   		    success: function(data)
	   		    {
	   		      
              if(data.function_status == 1) 
              {
                $(this.t).addClass("draggable");
                $(this.t).removeClass("not-draggable");
                $(this.t).draggable({disabled: false});

              }else 
              {
                // $(this.t).addClass("not-draggable");
                $(this.t).css("left","");
                $(this.t).attr("data-event-position-left",this.old_position);
                pz_customerplan_rearrange_events();

              }

            }
	   		  });
          
          pz_customerplan_rearrange_events();
          
        }
	   	  
	   	}
    });

  pz_customerplan_rearrange_events()
  pz_customerplan_rearrange_projects()
  pz_customerplan_reaarange_background();
  pz_toggleSection(2);

}

function pz_customerplan_reaarange_background()
{
  width = parseInt($(".customerplan .customerplan-months .customerplan-days li:nth-child(2)").css("width")) + 1;
  d = $(".customerplan.calendar").attr("data-customerplan-day-start")-1;
  d = -(d*width);
  $(".customerplan-subproject-events dd,.customerplan-project-events").css("background-position",d+"px 0px");
}

var pz_customerplan_project_subs_open = [];
function pz_customerplan_rearrange_projects()
{

  if(pz_customerplan_project_subs_open.length > 0)
  {
    $(pz_customerplan_project_subs_open).each(function(i,e)
    {
      $(".customerplan-project[data-project-id="+e+"]").find(".customerplan-subproject-events").removeClass("hidden");
    });
  }
  
  $(".customerplan-project.has-subprojects .customerplan-project-name")
    .unbind("click")
    .bind("mouseenter",function(e) {
      $(this).addClass("active");

    })
    .bind('mouseleave',function(e) {
      $(this).removeClass("active");
  
    })
    .bind('click', function(e) {
      t = $(this).closest(".customerplan-project");
      s = t.find(".customerplan-subproject-events");
      project_id = t.attr("data-project-id");
      
      if(s.hasClass("hidden")) {
        s.removeClass("hidden");
        pz_customerplan_project_subs_open.push(project_id);
      }else {
        s.addClass("hidden");
        pz_customerplan_project_subs_open.splice( $.inArray(project_id, pz_customerplan_project_subs_open), 1 );
      }
  });
}

var pz_customerplan_top_position = [];
function pz_get_customerplan_top_position(event, level)
{
  left = parseInt($(event).attr("data-event-position-left"));
  width = parseInt($(event).attr("data-event-position-width"));
  for(i=left;i<(left+width);i++) {
    k = level+","+i;
    if($.inArray(k, pz_customerplan_top_position) != -1) {
      level = level + 1;
      return pz_get_customerplan_top_position(event, level);
    }
  }
  for(i=left;i<(left+width);i++) {
    k = level+","+i;
    pz_customerplan_top_position.push(k);
  }
  return level;
}

function pz_customerplan_rearrange_events()
{
  $(".customerplan-project-events .customerplan-project-events-wrapper,.customerplan-subproject-events .customerplan-project-events-wrapper").each(function() 
  {
    c = $( this ).closest(".customerplan").find(".customerplan-days li:nth-child(2)");
 	  width = parseInt(c.css("width"))+1;
 	  height = parseInt(c.css("height"));
    // events
    pz_customerplan_top_position = [];
    top_position = 0;
    max_position = 0;
    $(this).find(".event-info").each(function(i,e)
    {
      level = 0;
      top_position = pz_get_customerplan_top_position(this, level);
      if(top_position > max_position)
        max_position = top_position;
      $(this).attr("data-event-position-top",top_position);
    });
    max_position = max_position+1;
    // (sub)project area
    $(this).parent().css("height",(max_position*height));
  });
}

// ------ 

function pz_refresh_calendar_lists()
{
  $("[data-list-type=calendar]").each(function(i,e)
  {
    id = "#"+$(e).attr("id");
    url = $(e).attr("data-url");
    pz_loadPage(id,url);
  });
}

function pz_remove_calendar_events_by_id(id)
{
  $(".event-"+id).remove();
}




/* *******************  **************** */


