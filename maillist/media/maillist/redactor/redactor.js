/*
	Redactor v5.0.2

	Made in Imperavi. All rights reserved.

	http://www.imperavi.com

	Dual licensed under the MIT or GPL Version 2 licenses.
*/

(function(){
var destructMethodReference = new Object;
Function.prototype.bind = function (object) {
    var method = this;
    var oldArguments = toArray(arguments).slice(1);
    return function (argument) {
        if (argument == destructMethodReference) {
            method = null;
            oldArguments = null;
        } else if (method == null) {
            throw "Attempt to invoke destructed method reference.";
        } else {
            var newArguments = toArray(arguments);
            return method.apply(object, oldArguments.concat(newArguments));
        }
    };
}
function toArray(pseudoArray) {
 var result = [];
 for (var i = 0; i < pseudoArray.length; i++)
     result.push(pseudoArray[i]);
 return result;
}
Object.extend = function(destination, source) {
  for (var property in source) {
    if (typeof source[property] === "object" &&
     source[property] !== null ) {
      destination[property] = destination[property] || {};
      arguments.callee(destination[property], source[property]);
    } else {
      destination[property] = source[property];
    }
  }
  return destination;
};
Function.prototype.bindEventListener = function (object) {
     var method = this;
     var oldArguments = toArray(arguments).slice(1);
     return function (event) {
         return method.apply(object, [event || window.event].concat(oldArguments));
     };
 }
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  this.Class = function(){};
  Class.extend = function(prop) {
    var _super = this.prototype;
    initializing = true;
    var prototype = new this();
    initializing = false;
    for (var name in prop) {
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            this._super = _super[name];
            var ret = fn.apply(this, arguments);       
            this._super = tmp;
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    function Class() {
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    Class.prototype = prototype;
    Class.constructor = Class;
    Class.extend = arguments.callee;
   
    return Class;
  };
})();



var RedactorModalActive = false;
var RedactorColorMode = false;
var RedactorActive = false;
var Redactor = Class.extend({
	// 'name': ['title', 'function', "'arg0', 'arg1' ... "]
	buttons: {
		original:
		{
			html: 	{name: 'html', title: 'Код', func: 'toggle'},
			styles: {name: 'styles', title: 'Стили', func: 'show', 
				dropdown: 
				{
					p: 			{exec: 'formatblock', name: 'p', title: 'Обычный текст'},
					blockquote: {exec: 'formatblock', name: 'blockquote', title: 'Цитата'},
					code: 		{exec: 'formatblock', name: 'code', title: 'Код'},
					h2: 		{exec: 'formatblock', name: 'h2', title: 'Большой', style: 'font-size: 18px;'},
					h3: 		{exec: 'formatblock', name: 'h3', title: 'Средний', style: 'font-size: 14px; font-weight: bold;'},
					h4: 		{exec: 'formatblock', name: 'h4', title: 'Малый'}																		
				}
			},
			format: {name: 'format', title: 'Формат', func: 'show',
				dropdown: 
				{
					bold: 		  {exec: 'bold', name: 'bold', title: 'Полужирный', style: 'font-weight: bold;'},
					italic: 	  {exec: 'italic', name: 'italic', title: 'Наклонный', style: 'font-style: italic;'},
					superscript:  {exec: 'superscript', name: 'superscript', title: 'Надстрочный'},
					fgcolor: 	  {name: 'fgcolor', title: 'Цвет текста', func: 'showFgcolor'},
					hilite: 	  {name: 'hilite', title: 'Заливка текста', func: 'showHilite'},
					removeformat: {exec: 'removeformat', name: 'removeformat', title: 'Удалить формат'}																		
				}						
			},
			lists: 	{name: 'lists', title: 'Списки', func: 'show',
				dropdown: 
				{
					ul: 	 {exec: 'insertunorderedlist', name: 'insertunorderedlist', title: '&bull; Обычный список'},
					ol: 	 {exec: 'insertorderedlist', name: 'insertorderedlist', title: '1. Нумерованный список'},
					outdent: {exec: 'outdent', name: 'outdent', title: '< Уменьшить отступ'},
					indent:  {exec: 'indent', name: 'indent', title: '> Увеличить отступ'}
				}			
			},
			image: 	{name: 'image', title: 'Картинка', func: 'showImage'},
			table: 	{name: 'table', title: 'Таблица', func: 'showTable'},
			link: 	{name: 'link', title: 'Ссылка', func: 'show',
				dropdown: 
				{
					link: 	{name: 'link', title: 'Вставить ссылку ...', func: 'showLink'},
					unlink: {exec: 'unlink', name: 'unlink', title: 'Удалить ссылку'}
				}			
			}
		},
		mini:
		{
			html: 	{name: 'html', title: 'Код', func: 'toggle'},
			styles: {name: 'styles', title: 'Стили', func: 'show', 
				dropdown: 
				{
					p: 			{exec: 'formatblock', name: 'p', title: 'Обычный текст'},
					blockquote: {exec: 'formatblock', name: 'blockquote', title: 'Цитата'},
					code: 		{exec: 'formatblock', name: 'code', title: 'Код'}
				}
			},
			format: {name: 'format', title: 'Формат', func: 'show',
				dropdown: 
				{
					bold: 		  {exec: 'bold', name: 'bold', title: 'Полужирный', style: 'font-weight: bold;'},
					italic: 	  {exec: 'italic', name: 'italic', title: 'Наклонный', style: 'font-style: italic;'},
					superscript:  {exec: 'superscript', name: 'superscript', title: 'Надстрочный'},
					fgcolor: 	  {name: 'fgcolor', title: 'Цвет текста', func: 'showFgcolor'},
					hilite: 	  {name: 'hilite', title: 'Заливка текста', func: 'showHilite'},
					removeformat: {exec: 'removeformat', name: 'removeformat', title: 'Удалить формат'}																		
				}						
			},
			lists: 	{name: 'lists', title: 'Списки', func: 'show',
				dropdown: 
				{
					ul: 	 {exec: 'insertunorderedlist', name: 'insertunorderedlist', title: '&bull; Обычный список'},
					ol: 	 {exec: 'insertorderedlist', name: 'insertorderedlist', title: '1. Нумерованный список'},
					outdent: {exec: 'outdent', name: 'outdent', title: '< Уменьшить отступ'},
					indent:  {exec: 'indent', name: 'indent', title: '> Увеличить отступ'}
				}			
			},
			//image: 	{name: 'image', title: 'Картинка', func: 'showImage'},
			table: 	{name: 'table', title: 'Таблица', func: 'showTable'},
			link: 	{name: 'link', title: 'Ссылка', func: 'show',
				dropdown: 
				{
					link: 	{name: 'link', title: 'Вставить ссылку ...', func: 'showLink'},
					unlink: {exec: 'unlink', name: 'unlink', title: 'Удалить ссылку'}
				}			
			}
		}		
	},
	init: function(element, options)
	{
		/*
			Options
		*/
		this.options = {
			path: '/',
			fullscreen: 'off',
			resize: true,
			visual: true,
			focus: false,
			toolbar: 'original',
			upload: 'upload.php',
			uploadParams: '',
			uploadFunction: false
		}
		
		jQuery.extend(this.options, options);	
	
		var link = {};
		link.href = '';
        $("link").each(function(i,s)
		{
			
			if (s.href && s.href.match(/redactor\.css/)) link.href = s.href;
		});
	
		this.options.path = link.href.replace(/css\/redactor\.css/, '');
   		this.cssUrl = this.options.path + 'css/blank.css';
   		
   		this.textarea = $('#' + element);
   		this.width = this.textarea.get(0).style.width;
   		this.height = this.textarea.get(0).style.height;    		
   		this.rte_id = element;
   	

   		
   		// create container
		this.container = $('<div id="redactor_box_' + this.rte_id + '" style="width: ' + this.width + ';" class="redactor_box"></div>');

 		 // create iframe
		this.frame = $('<iframe frameborder="0" marginheight="0" marginwidth="0" scrolling="auto" vspace="0" hspace="0" id="redactor_frame_' + this.rte_id + '" style="height: ' + this.height + ';" class="redactor_frame"></iframe>');
   	
		// append
		$(this.container).insertAfter(this.textarea);

		this.textarea.hide();
		this.textarea_clone = this.textarea;   	
   	
	
		$(this.container).append(this.frame);
		$(this.container).append(this.textarea_clone);   	
   	
   		// toolbar
   		this.toolbar = $('<ul id="redactor_toolbar_' + this.rte_id + '" class="redactor_toolbar"></ul>');
   		
   		jQuery.each($(this.buttons[this.options.toolbar]), 
   			function (i, s)
   			{
   				jQuery.each(s,
   					function (z, f)
   					{
   						var a = $('<a href="javascript:void(null);" class="redactor_ico redactor_ico_' + f.name + '" title="' + f.title + '">&nbsp;</a>');
   						
   						if (f.func != 'show')
   						{
	   						a.click(function()
   							{
   								this[f.func]();
   							}.bind(this));
   						}   						
						
						var li = $('<li></li>')
   						$(li).append(a);   						   						

 						if (typeof(f.dropdown) != 'undefined')
 						{
 							var ul = $('<ul class="redactor_dropdown_' + this.rte_id + '" id="redactor_dropdown_' + this.rte_id + '_' + f.name + '" style="display: none;"></ul>');
	   						jQuery.each(f.dropdown,
			   					function (x, d)
   								{
   									if (typeof(d.style) == 'undefined') d.style = '';
   									var ul_li = $('<li></li>');
   									var ul_li_a = $('<a href="javascript:void(null);" style="' + d.style + '">' + d.title + '</a>');
   									$(ul_li).append(ul_li_a);
   									$(ul).append(ul_li); 
   									
   									if (typeof(d.func) == 'undefined') 
   									{
   										$(ul_li_a).click(function() { this.execCommand(d.exec, d.name); }.bind(this));
   									}
   									else
   									{
	   									$(ul_li_a).click(function(e) { this[d.func](e); }.bind(this));
   									}
   									  									
   								}.bind(this)
   							);
   							$(li).append(ul);
   				

   							this.hdlHideDropDown = function(e) { this.hideDropDown(e, ul, f.name) }.bind(this);
   							this.hdlShowDropDown = function(e) { this.showDropDown(e, ul, f.name) }.bind(this);
   							this.hdlShowerDropDown = function(e) { this.showerDropDown(e, ul, f.name) }.bind(this);   							
   						
							a.click(this.hdlShowDropDown);  
							a.mouseover(this.hdlShowerDropDown);  							
	
							$(document).click(this.hdlHideDropDown);
							$(this.frame.get(0).contentWindow).click(this.hdlHideDropDown);
   				
   						}
   						else
   						{
							a.mouseover(function(e) { this.hideAllDropDown() }.bind(this));			
						}
   						
   		
   						$(this.toolbar).append(li);
   						
   					}.bind(this)
   				);
   			}.bind(this)
   		);
		
		$(this.container).prepend(this.toolbar);

		// resizer
		if (this.options.resize)
		{
			this.resizer = $('<div id="redactor_resize' + this.rte_id + '" class="redactor_bottom"><div></div></div>')
			$(this.container).append(this.resizer);

           $(this.resizer).mousedown(function(e) { this.initResize(e) }.bind(this));
		}



		// enable	
   		this.doc = this.contentDocumentFrame(this.frame);
   		
		this.doc.open();
		this.doc.write(this.getEditorDoc(this.textarea.val()));
		this.doc.close();
				
		this.designMode();
		
		this.formSets();
		
		// observe keyup
		$(this.doc).keyup(function ()
		{
			this.syncCode();
		}.bind(this));
				
				
		if (this.options.focus) this.frame.get(0).contentWindow.focus();	
	},
	focus: function()
	{
		this.frame.get(0).contentWindow.focus();	
	},	
	getEditorDoc: function(html)
	{
    	var frameHtml = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n';
		frameHtml += '<html>\n'
		frameHtml += '<head>\n';
		frameHtml += '<link media="all" type="text/css" href="' + this.cssUrl + '" rel="stylesheet">\n';
		frameHtml += '</head>';
		frameHtml += '<body>';
		frameHtml += html;
		frameHtml += '</body>';
		frameHtml += '</html>';
		return frameHtml;
	},	
	contentDocumentFrame: function(frame)
	{	
		frame = frame.get(0);

		if (frame.contentDocument) return frame.contentDocument;
		else if (frame.contentWindow && frame.contentWindow.document) return frame.contentWindow.document;
		else if (frame.document)	return frame.document;
		else return null;
	},
	designMode: function()
	{
		if (this.doc)
		{
			this.doc.designMode = 'on';
			this.frame.load(function()
			{
				this.doc.designMode = 'on';
			}.bind(this));
		}
	},
	execCommand: function(cmd, param)
	{		
		if (this.options.visual)
		{
			if (this.doc)
			{
    			try
	    		{
    				this.frame.get(0).contentWindow.focus();
	    		
	    			if (cmd == 'inserthtml' && jQuery.browser.msie) this.doc.selection.createRange().pasteHTML(param);
	    			else   			
					{
						this.doc.execCommand(cmd, false, param);
						if (param == "blockquote")
						{
    			    		this.doc.body.appendChild(this.doc.createElement("BR"));
					    }					
					}
				}
				catch (e) { }
				
				this.syncCode();		
			}
		}

	},
	setHtml: function(html)
	{
		this.doc.open();
		this.doc.write(this.getEditorDoc(html));
		this.doc.close();
	},
	getHtml: function()
	{
		return this.doc.body.innerHTML;
	},
	getCode: function()
	{
		if (this.options.visual)
		{
			var html = this.getHtml();
			html = this.tidyUp(html);
			html = this.formatHtml(html);
			
			return html;
		}
		else
		{
			return this.textarea.val();
		}
	},
	syncCode: function()
	{
		var html = this.getHtml();
		html = this.tidyUp(html);

		html = html.replace(/\%7B/gi, '{');
		html = html.replace(/\%7D/gi, '}');

		html = html.replace(/<hr class="redactor_cut">/gi, '<!--more-->');
		html = html.replace(/<hr class=redactor_cut>/gi, '<!--more-->');

		this.textarea.val(html);
	},

	formSets: function()
	{
		var oldOnsubmit = null;		

		var theForm = $(this.container).parents('form');
		if (theForm.length == 0) return false;

		oldOnsubmit = theForm.get(0).onsubmit;

		if (typeof theForm.get(0).onsubmit != "function")
		{
			theForm.get(0).onsubmit = function()
			{
          		if (this.options.visual)
				{
					this.paragraphise();
					return self.syncCode();
				}
			}.bind(this)
		}
		else
		{
			theForm.get(0).onsubmit = function()
			{
            	if (this.options.visual)
				{
					this.paragraphise();
					this.syncCode();

					return oldOnsubmit();
				}
			}.bind(this)
		}

		return true;
	},	
	
	/*
		DropDown
	*/
	showedDropDown: false,
	showDropDown: function(e, ul, name)
	{
	
		if (this.showedDropDown) this.hideAllDropDown();
		else
		{
			this.showedDropDown = true;
			this.showingDropDown(e, ul, name);
		}		
			
	},
	showingDropDown: function(e, ul, name)
	{
		this.hideAllDropDown();
		 		
   		this.addSelButton(name);
   		$(ul).show();	

	},
	showerDropDown: function(e, ul, name)
	{
		if (this.showedDropDown) this.showingDropDown(e, ul, name);
	},
	hideAllDropDown: function()
	{
		$('#redactor_toolbar_' + this.rte_id + ' a.redactor_ico').removeClass('redactor_ico_select');
   		$('ul.redactor_dropdown_' + this.rte_id).hide();
	},
	hideDropDown: function(e, ul, name)
	{
		if (!$(e.target).hasClass('redactor_ico_select'))
		{
			this.showedDropDown = false;
			this.hideAllDropDown();
		
		}	
	
		$(document).unbind('click', this.hdlHideDropDown);
		$(this.doc).unbind('click', this.hdlHideDropDown);
		
	},
	addSelButton: function(name)
	{
		var element = $('#redactor_toolbar_' + this.rte_id + ' a.redactor_ico_' + name);
		element.addClass('redactor_ico_select');
	},
	removeSelButton: function(name)
	{
		var element = $('#redactor_toolbar_' + this.rte_id + ' a.redactor_ico_' + name);
		element.removeClass('redactor_ico_select');
	},	
	toggleSelButton: function(name)
	{
		$('#redactor_toolbar_' + this.rte_id + ' a.redactor_ico_' + name).toggleClass('redactor_ico_select');
	},
	toggle: function()
	{
		this.toggleSelButton('html');

		if (this.options.visual)
		{
			this.frame.hide();
			this.textarea.show();

			this.paragraphise();

			var html = this.getHtml();
			
			html = this.formatHtml(html);
			html = this.tidyUp(html);

			html = html.replace(/\%7B/gi, '{');
			html = html.replace(/\%7D/gi, '}');

			// flash replace
			html = html.replace(/\<div class="redactor_video_box"\>([\w\W]*?)\<\/div\>/gi, "$1");

			html = html.replace(/<hr class="redactor_cut">/gi, '<!--more-->');
			html = html.replace(/<hr class=redactor_cut>/gi, '<!--more-->');

			this.textarea.val(html).focus();

			this.options.visual = false;
		}
		else
		{
			this.textarea.hide();

			var html = this.textarea.val();
			html = html.replace(/<!--more-->/gi, '<hr class="redactor_cut">');

			html = html.replace(/\<object([\w\W]*?)\<\/object\>/gi, '<div class="redactor_video_box"><object$1</object></div>');

			this.doc.body.innerHTML = html;
			
			this.frame.show();
			this.focus();
			
			this.options.visual = true;
		}
	},
	showFgcolor: function(e)
	{
		if (this.options.visual)
		{
			RedactorColorMode = 'ForeColor';
			RedactorActive = this;
			new RedactorColorPicker(e);
		}
	},
	showHilite: function(e)
	{
		if (this.options.visual)
		{
			if (jQuery.browser.msie) var mode = 'BackColor';
			else var mode = 'hilitecolor';
			
			RedactorColorMode = mode;
			RedactorActive = this;
			new RedactorColorPicker(e);
		}
	},
	showTable: function()
	{
		RedactorActive = this;
		RedactorModalActive = new RedactorModal({ title: 'Таблица', width: 400, height: 240, url: this.options.path + 'plugins/insert_table.html', triggerClose: 'redactorCloseModal'});
	},	
	insertTable: function()
	{
		var units = $('#redactor_insert_table_units').val();
		var width = $('#redactor_insert_table_width').val();
		var rows = $('#redactor_insert_table_rows').val();
		var cell = $('#redactor_insert_table_cell').val();

		if (units == '%' && width == 100) width = 99;
		var table = '<table style="width: '+ width + units + ';">';

		for(x=0;x<rows;x++)
		{
			table += '<tr>';
			for(y=0;y<cell;y++)
			{
			   table += '<td></td>';
			}
			table += '</tr>';
		}
		table += '</table><br /> ';

		RedactorActive.frame.get(0).contentWindow.focus();
		RedactorActive.execCommand('inserthtml', table);
		RedactorModalActive.hide();		
		
	},	
	showLink: function()
	{
		RedactorActive = this;
		RedactorModalActive = new RedactorModal({ title: 'Ссылка', height: 290, url: this.options.path + 'plugins/insert_link.html', triggerClose: 'redactorCloseModal', end: function()
		{
				var sel = this.get_selection();
				if (jQuery.browser.msie)
				{
						var temp = sel.htmlText.match(/href="(.*?)"/gi);
						if (temp != null)
						{
							temp = new String(temp);
							temp = temp.replace(/href="(.*?)"/gi, '$1');
						}

  					 	var text = sel.text;
						if (temp != null) var url = temp;
						else  var url = '';
						var title = '';
				}
				else
				{
					if (sel.anchorNode.parentNode.tagName == 'A')
					{
						var url = sel.anchorNode.parentNode.href;
						var text = sel.anchorNode.parentNode.text;
						var title = sel.anchorNode.parentNode.title;
						if (sel.toString() == '') this.insert_link_node = sel.anchorNode.parentNode

					}
					else
					{
					 	var text = sel.toString();
						var url = '';
						var title = '';
					}
				}

				$('#redactor_link_url').val(url);
				$('#redactor_link_text').val(text);
				$('#redactor_link_title').val(title);		
				
		}.bind(this)
		});
	},	
	insertLink: function()
	{
		var value = $('#redactor_link_text').val();
		if (value == '') return true;
		
		if ($('#redactor_link_id_url').get(0).checked) 
		{
			var a = '<a href="' + $('#redactor_link_url').val() + '" title="' + $('#redactor_link_title').val() + '">' + value + '</a> ';
		}
		else
		{
			var a = '<a href="mailto:' + $('#redactor_link_url').val() + '" title="' + $('#redactor_link_title').val() + '">' + value + '</a> '
		}

		if (a)
		{
			if (this.insert_link_node)
			{
				$(this.insert_link_node).text(value);
				$(this.insert_link_node).attr('href', $('#redactor_link_url').val());
				$(this.insert_link_node).attr('title', $('#redactor_link_title').val());

				return true;
			}
			else
			{
				RedactorActive.frame.get(0).contentWindow.focus();
				RedactorActive.execCommand('inserthtml', a);
			}
		}
		RedactorModalActive.hide();
	},
	showImage: function()
	{
		this.spanid = Math.floor(Math.random() * 99999);
		if (jQuery.browser.msie)
		{
			this.execCommand('inserthtml', '<span id="span' + this.spanid + '"></span>');
		}
		
	
		RedactorActive = this;
		RedactorModalActive = new RedactorModal({ title: 'Изображение', height: 290, url: this.options.path + 'plugins/insert_image.html', triggerClose: 'redactorCloseModal', end: function()
		{
			var params = '';
			if (this.options.uploadFunction) var params = this.options.uploadFunction();
			new RedactorUpload('redactorInsertImageForm', { url: this.options.upload + params, trigger: 'redactorUploadBtn', success: this.imageUploadCallback  });
		}.bind(this) });
	},
	imageUploadCallback: function(data)
	{
		if ($('#redactor_file_link').val() != '') data = $('#redactor_file_link').val();

		
		var style = '';
		if ($('#redactor_form_image_align') != 0)
		{
			var float = $('#redactor_form_image_align').val();
			
			if (float == 'left') style = 'style="float: right; margin-right: 10px; margin-bottom: 10px;"';
			else if (float == 'right') style = 'style="float: right; margin-left: 10px; margin-bottom: 10px;"';
			
			var html = '<img src="' + data + '" ' + style + ' />';
		}
		else
		{
			var html = '<p><img src="' + data + '" /></p>'; 
		}
	
		RedactorActive.frame.get(0).contentWindow.focus();
		
		if (jQuery.browser.msie)
		{		
			$(RedactorActive.doc.getElementById('span' + RedactorActive.spanid)).after(html);
			$(RedactorActive.doc.getElementById('span' + RedactorActive.spanid)).remove();
		}	
		else
		{
			RedactorActive.execCommand('inserthtml', html);
		}

		RedactorModalActive.hide();	

	},
	get_selection: function ()
	{
		if (this.frame.get(0).contentWindow.getSelection) return this.frame.get(0).contentWindow.getSelection();
		else if (this.frame.get(0).contentWindow.document.selection) return this.frame.contentWindow.get(0).document.selection.createRange();
	},

	/*
		Paragraphise
	*/
	paragraphise: function()
	{
		if (this.options.visual)
		{

			var theBody = this.doc.body;

			/* Remove all text nodes containing just whitespace */
			for (var i = 0; i < theBody.childNodes.length; i++)
			{
				if (theBody.childNodes[i].nodeName.toLowerCase() == "#text" &&
					theBody.childNodes[i].data.search(/^\s*$/) != -1)
				{
					theBody.removeChild(theBody.childNodes[i]);

					i--;
				}
			}

			var removedElements = new Array();

			for (var i = 0; i < theBody.childNodes.length; i++)
			{
				if (theBody.childNodes[i].nodeName.isInlineName())
				{
					removedElements.push(theBody.childNodes[i].cloneNode(true));

					theBody.removeChild(theBody.childNodes[i]);

					i--;
				}
				else if (theBody.childNodes[i].nodeName.toLowerCase() == "br")
				{
					if (i + 1 < theBody.childNodes.length)
					{
						/* If the current break tag is followed by another break tag */
						if (theBody.childNodes[i + 1].nodeName.toLowerCase() == "br")
						{
							/* Remove consecutive break tags */
							while (i < theBody.childNodes.length && theBody.childNodes[i].nodeName.toLowerCase() == "br")
							{
								theBody.removeChild(theBody.childNodes[i]);
							}

							if (removedElements.length > 0)
							{
								this.insertNewParagraph(removedElements, theBody.childNodes[i]);

								removedElements = new Array();
							}
						}
						/* If the break tag appears before a block element */
						else if (!theBody.childNodes[i + 1].nodeName.isInlineName())
						{
							theBody.removeChild(theBody.childNodes[i]);
						}
						else if (removedElements.length > 0)
						{
							removedElements.push(theBody.childNodes[i].cloneNode(true));

							theBody.removeChild(theBody.childNodes[i]);
						}
						else
						{
							theBody.removeChild(theBody.childNodes[i]);
						}

						i--;
					}
					else
					{
						theBody.removeChild(theBody.childNodes[i]);
					}
				}
				else if (removedElements.length > 0)
				{
					this.insertNewParagraph(removedElements, theBody.childNodes[i]);

					removedElements = new Array();
				}
			}

			if (removedElements.length > 0)
			{
				this.insertNewParagraph(removedElements);
			}
		}

		return true;
	},
	insertNewParagraph: function(elementArray, succeedingElement)
	{
		var theBody = this.doc.getElementsByTagName("body")[0];
		var theParagraph = this.doc.createElement("p");

		for (var i = 0; i < elementArray.length; i++)
		{
			theParagraph.appendChild(elementArray[i]);
		}

		if (typeof(succeedingElement) != "undefined")
		{
			theBody.insertBefore(theParagraph, succeedingElement);
		}
		else
		{
			theBody.appendChild(theParagraph);
		}

		return true;
	},
	tidyUp: function(html)
	{
		//html = html.replace(/\<br\s\/\>/gi,"<br />");
		html = html.replace(/\<br\>/gi,"<br />");

		if (jQuery.browser.msie)
		{
	      	var match = html.match(/<(.*?)>/gi);
	      	
			jQuery.each(match, function(i,s)
			{
				html = html.replace(s, s.toLowerCase());
			}) 
			
			
		}

		if (jQuery.browser.mozilla) html = this.convertSpan(html);
		
		return html;
	},
	convertSpan: function(html)
	{
		html = html.replace(/\<span(.*?)style="font-weight: bold;"\>([\w\W]*?)\<\/span\>/gi, "<b>$2</b>");
		html = html.replace(/\<span(.*?)style="font-style: italic;"\>([\w\W]*?)\<\/span\>/gi, "<i>$2</i>");
		html = html.replace(/\<span(.*?)style="font-weight: bold; font-style: italic;"\>([\w\W]*?)\<\/span\>/gi, "<i><b>$2</b></i>");
		html = html.replace(/\<span(.*?)style="font-style: italic; font-weight: bold;"\>([\w\W]*?)\<\/span\>/gi, "<b><i>$2</i></b>");

		return html;
  	},	
	formatHtml: function(html)
	{
		html = html.replace(/\<h(\d)\>/gi, '\r\n<h$1>');
		html = html.replace(/\<\/h(\d)\>/gi, '</h$1>\r\n');
		html = html.replace(/\<\/p\>/gi, '</p>\r\n');
		html = html.replace(/\<\/blockquote\>/gi, '</blockquote>\r\n');
		html = html.replace(/\<table/gi, '\r\n<table');
		html = html.replace(/\<\/table\>/gi, '\r\n</table>');
		html = html.replace(/\<\/p\>/gi, '</p>\r\n');
		html = html.replace(/\<\/pre\>/gi, '</pre>\r\n');
		html = html.replace(/\<\/code\>/gi, '</code>\r\n');
		html = html.replace(/\<\/div\>/gi, '</div>\r\n');
		html = html.replace(/\<\/ol\>/gi, '</ol>\r\n');
		html = html.replace(/\<\/ul\>/gi, '</ul>\r\n');
		html = html.replace(/\<td\>\<br\>\<\/td\>/gi, '<td></td>');
		html = html.replace(/\<td\>\<br \/\>\<\/td\>/gi, '<td></td>');

		return html;
	},
	
	/*
		Resizer
	*/
	initResize: function(e)
	{
		this.splitter = e.target;

		if (this.options.visual)
		{
			this.element_resize = this.frame;
			this.element_resize.get(0).style.visibility = 'hidden';
			this.element_resize_parent = this.textarea;
		}
		else
		{
			this.element_resize = this.textarea;
			this.element_resize_parent = this.frame;
		}

		this.stopResizeHdl = function (e) { this.stopResize(e) }.bind(this);
		this.startResizeHdl = function (e) { this.startResize(e) }.bind(this);
		this.resizeHdl =  function (e) { this.resize(e) }.bind(this);

		$(document).mousedown(this.startResizeHdl);
		$(document).mouseup(this.stopResizeHdl);
		$(this.splitter).mouseup(this.stopResizeHdl);

		this.null_point = false;
		this.h_new = false;
		this.h = this.element_resize.height();
	},
	startResize: function()
	{
		$(document).mousemove(this.resizeHdl);
	},
	resize: function(e)
	{
		var y = e.pageY;
		if (this.null_point == false) this.null_point = y;
		if (this.h_new == false) this.h_new = this.element_resize.height();

		var s_new = (this.h_new + y - this.null_point) - 10;

		if (s_new <= 30) return true;

		if (s_new >= 0)
		{
			this.element_resize.get(0).style.height = s_new + 'px';
			this.element_resize_parent.get(0).style.height = s_new + 'px';
		}

	},
	stopResize: function(e)
	{
		$(document).unbind('mousemove', this.resizeHdl);
		$(document).unbind('mousedown', this.startResizeHdl);
		$(document).unbind('mouseup', this.stopResizeHdl);
		$(this.splitter).unbind('mouseup', this.stopResizeHdl);
		
		this.element_resize.get(0).style.visibility = 'visible';
	}				
});



String.prototype.isInlineName = function()
{
	var inlineList = new Array("#text", "a", "em", "font", "span", "strong", "u");
	var theName = this.toLowerCase();
	
	for (var i = 0; i < inlineList.length; i++)
	{
		if (theName == inlineList[i])
		{
			return true;
		}
	}
	
	return false;
}



/*
	Modal v2.2 2010-03-27

	Made in Imperavi. All rights reserved.

	http://www.imperavi.com

	Code is released under a GNU General Public Licens http://www.opensource.org/licenses/gpl-license.php
*/
var RedactorModal = Class.extend({
	init: function(options)
	{
		/*
			Options
		*/
		this.options = {
			url: false,
			callback: false,
			start: false,
			end: false,
			loader: true,
			triggerClose: false,
			title: 'Modal Window',
			drag: false,
			width: 450,
			height: 450,
			overlay: true,
			overlayClose: true,
			fixed: true
		}
		
		$.extend(this.options, options);
		
		/*
			Handlers
		*/
		this.closeHandler = function() { this.hide(); }.bind(this);
		this.keypressHandler = function( e ) { if( e.keyCode == 27) this.hide(); }.bind(this)

  
  		/*
  			Build
  		*/  		
		if (this.options.start) this.options.start();  		

  		this.build();

		if (jQuery.browser.msie) this.fixIE("100%", "hidden");
		
	},
	modalCreate: function()
	{
		this.modal = $('<div id="redactor_cmts_modal" style="display: none;"><div id="redactor_cmts_modal_header"><div id="redactor_cmts_modal_title"></div><span id="redactor_cmts_modal_close"></span></div><div id="redactor_cmts_modal_content"></div></div>');
		$(this.modal).appendTo('body');
		
		if (this.options.fixed) $('#redactor_cmts_modal').css('position', 'fixed');
		else $('#redactor_cmts_modal').css('position', 'absolute');		

		$('#redactor_cmts_modal').css({'margin-top': '-' + (this.options.height/2) + 'px', 'margin-left': '-' + (this.options.width/2) + 'px'});		
		$('#redactor_cmts_modal_close').click(this.closeHandler);	
		
		if (this.options.drag)
		{	
			$('#redactor_cmts_modal_title').css('cursor', 'move');
			$('#redactor_cmts_modal').draggable({ handle: '#modal_title' });
		}
	},
	overlayCreate: function()
	{
		this.overlay = $('<div id="redactor_cmts_modal_overlay" style="display: none;"></div>')
		$(this.overlay).appendTo('body');	
	},	
	load: function()
	{
		this.modal.show();
		
		$('#redactor_cmts_modal_title').text(this.options.title);
		
		$('#redactor_cmts_modal').css({'height': this.options.height + 'px', 'width': this.options.width + 'px'});

		var pbottom = this.normalize($('#redactor_cmts_modal_content').css('padding-bottom'))
		var ptop = this.normalize($('#redactor_cmts_modal_content').css('padding-top'))

		var content_height = this.options.height - ptop - pbottom - $('#redactor_cmts_modal_header').get(0).offsetHeight;

		if (this.options.loader) $('#redactor_cmts_modal_content').css('height', content_height + 'px').html('<div id="credactor_mts_modal_loader"></div>');
		        
		$.ajax({ url: this.options.url, cache: false, success: function(data)
		{
			$('#redactor_cmts_modal_content').html(data);
        	if (this.options.triggerClose) $('#' + this.options.triggerClose).mousedown(this.closeHandler);
        	
        	if (this.options.end) this.options.end();
        	
		}.bind(this)});	
	    
		      	
		$(document).keypress(this.keypressHandler);
	},
	build: function()
	{
		if ($('#redactor_cmts_modal').get(0))
		{
			this.modal = $('#redactor_cmts_modal');
			if (this.options.overlay) this.overlay = $('#redactor_cmts_modal_overlay');
			this.show();
		}
		else
		{
			this.modalCreate();
			if (this.options.overlay) this.overlayCreate();
			this.show();
		}
	},
	show: function()
	{
		if (this.options.overlay && this.options.overlayClose) $(this.overlay).click(this.closeHandler);					  	
	  	
	  	if (this.options.overlay) 
	  	{
			this.overlay.show();
			this.load();
		}
		else this.load();
	},
	hide: function()
	{
		if (this.options.overlay) 
		{
			this.modal.hide();
			this.overlay.hide();
		}
		else this.modal.hide();
		
		if (jQuery.browser.msie) this.fixIE("", "");	
		if (this.options.overlayClose) $(this.overlay).unbind('click', this.closeHandler);

		$(document).unbind('keypress', this.keypressHandler);

		if (this.options.callback) this.options.callback();
		
	},
	fixIE: function(height, overflow)
	{
		$('html, body').css({'width': height, 'height': height, 'overflow': overflow});
		$("select").css('visibility', overflow);
	},	
	normalize: function(str)
	{
	  return new Number((str.replace('px','')));
	}
});


/*
	Upload v2.2 2010-03-27

	Made in Imperavi. All rights reserved.

	http://www.imperavi.com

	Code is released under a GNU General Public Licens http://www.opensource.org/licenses/gpl-license.php
*/
var RedactorUpload = Class.extend({
	init: function(element, options)
	{
		/*
			Options
		*/
		this.options = {
			url: false,
			success: false,
			start: false,
			trigger: false,
			auto: false,
			input: false
		}
  
		$.extend(this.options, options);


		/*
			Test input or form
		*/		
		if ($('#' + element).get(0).tagName == 'INPUT')
		{
			this.options.input = $('#' + element);
			this.element = $($('#' + element).get(0).form);
		}
		else
		{
			this.element = $('#' + element);
		}
		

		this.element_action = this.element.attr('action');

		/*
			Auto or trigger
		*/
		if (this.options.auto)
		{
			this.element.submit(function(e) { return false; });
			this.submit();
		}
		else if (this.options.trigger)
		{
			$('#' + this.options.trigger).click(function() { this.submit(); }.bind(this)); 
		}
	},
	submit : function()
	{
		this.form(this.element, this.frame());
	},	
	frame : function()
	{
		this.id = 'f' + Math.floor(Math.random() * 99999);
	
		var d = document.createElement('div');
		var iframe = '<iframe style="display:none" src="about:blank" id="'+this.id+'" name="'+this.id+'"></iframe>';
		d.innerHTML = iframe;
		document.body.appendChild(d);

		/*
			Start
		*/
		if (this.options.start) this.options.start();

		$('#' + this.id).load(function () { this.loaded() }.bind(this));

		return this.id;
	},
	form : function(f, name)
	{
		if (this.options.input)
		{
			var formId = 'redactorUploadForm' + this.id;
			var fileId = 'redactorUploadFile' + this.id;
			this.form = $('<form  action="' + this.options.url + '" method="POST" target="' + name + '" name="' + formId + '" id="' + formId + '" enctype="multipart/form-data"></form>');	

			var oldElement = this.options.input;
			var newElement = $(oldElement).clone();
			$(oldElement).attr('id', fileId);
			$(oldElement).before(newElement);
			$(oldElement).appendTo(this.form);
			$(this.form).css('position', 'absolute');
			$(this.form).css('top', '-1200px');
			$(this.form).css('left', '-1200px');
			$(this.form).appendTo('body');	
			
			this.form.submit();
		}
		else
		{
			f.attr('target', name);
			f.attr('method', 'POST');
			f.attr('enctype', 'multipart/form-data');		
			f.attr('action', this.options.url);

			this.element.submit();
		}

	},
	loaded : function()
	{
		var i = $('#' + this.id);
		
		
		
		if (i.contentDocument) var d = i.contentDocument;
		else if (i.contentWindow) var d = i.contentWindow.document;
		else var d = window.frames[this.id].document;
		
		if (d.location.href == "about:blank") return true;


		/*
			Success
		*/
		this.options.success(d.body.innerHTML);

		this.element.attr('action', this.element_action);
		this.element.attr('target', '');
		this.element.unbind('submit');
		
		if (this.options.input) $(this.form).remove();
	}

})


/*
	ColorPicker v1.0 2010-03-28

	Made in Imperavi. All rights reserved.

	http://www.imperavi.com

	Code is released under a GNU General Public Licens http://www.opensource.org/licenses/gpl-license.php
*/
var RedactorColorPicker = Class.extend({
	init: function(e, options)
	{
		/*
			Options
		*/
		this.options = {
			mode: false,
			colors: Array(
				'#ffffff', '#000000', '#eeece1', '#1f497d', '#4f81bd', '#c0504d', '#9bbb59', '#8064a2', '#4bacc6', '#f79646',
				'#f2f2f2', '#7f7f7f', '#ddd9c3', '#c6d9f0', '#dbe5f1', '#f2dcdb', '#ebf1dd', '#e5e0ec', '#dbeef3', '#fdeada',
				'#d8d8d8', '#595959', '#c4bd97', '#8db3e2', '#b8cce4', '#e5b9b7', '#d7e3bc', '#ccc1d9', '#b7dde8', '#fbd5b5',
				'#bfbfbf', '#3f3f3f', '#938953', '#548dd4', '#95b3d7', '#d99694', '#c3d69b', '#b2a2c7', '#b7dde8', '#fac08f',
				'#a5a5a5', '#262626', '#494429', '#17365d', '#366092', '#953734', '#76923c', '#5f497a', '#92cddc', '#e36c09',
				'#7f7f7f', '#0c0c0c', '#1d1b10', '#0f243e', '#244061', '#632423', '#4f6128', '#3f3151', '#31859b', '#974806')
		}
		
		jQuery.extend(this.options, options);
		
		this.dialogOpen = false;
		
		if (jQuery('#cmts_colorpicker_redactor').length) this.toggle(e);
		else this.build(e);
		
	},
	build: function(e)
	{
		this.dialog = document.createElement('div');
		this.dialog.style.display = 'none';
		this.dialog.style.position = 'absolute';		
		this.dialog.style.background = '#fff';				
		this.dialog.id = 'cmts_colorpicker_redactor';
		this.dialog.style.zIndex = '10000';
	
		var swatchTable = document.createElement('div');
		jQuery(swatchTable).css({'overflow': 'hidden', 'border': '1px solid #ddd', 'padding': '3px', 'width': '190px'});

		var len = this.options.colors.length;
		for (var i = 0; i < len; ++i)
		{

				var color = this.options.colors[i];
				
			
				var swatch = jQuery('<div title="' + color + '"></div>')
				jQuery(swatch).css({'width': '15px', 'float': 'left', cursor: 'pointer', 'height': '15px', 'fontSize': '1px', 'border': '2px solid #fff', 'backgroundColor': color, 'padding': '0'});
	
				jQuery(swatch).appendTo(swatchTable);

		
				jQuery(swatch).mousedown(function(e)
				{	
					
					this.set(e);
				}.bind(this));
		}

		jQuery(swatchTable).appendTo(this.dialog);	
		$(document.body).prepend(this.dialog);

		this.toggle(e);
		
	},
	set: function(e)
	{	
		var color = jQuery(e.target).attr('title');		

		RedactorActive.execCommand(RedactorColorMode, color);


		this.hide(e);
	},
	toggle: function(e)
	{		
		if (!this.dialogOpen) this.show(e);
		else this.hide(e);
	},
	show: function(e)
	{	
			
		var element = $('#redactor_toolbar_' + RedactorActive.rte_id + ' a.redactor_ico_format');
		
		var pos = element.offset();
		var height = element.height();
	
		$('#cmts_colorpicker_redactor').css('top', (pos.top + height) + 'px').css('left', pos.left + 'px').fadeIn();
		$('#cmts_colorpicker_redactor').get(0).style.display = '';	

		this.dialogOpen = true;
	},
	hide: function(e)
	{		
		jQuery('#cmts_colorpicker_redactor').fadeOut();
		this.dialogOpen = false;
		
	}
});
