from django.forms import widgets
from django.utils.safestring import mark_safe
from django.core.urlresolvers import reverse

class JQueryEditor(widgets.Textarea):
    class Media:
        js = ('maillist/redactor/redactor.js', )
        css = {
            'all': ('maillist/redactor/css/redactor.css', ),
        }

    def render(self, name, value, attrs=None):
        input_ = super(JQueryEditor, self).render(name, value, attrs)
        final_attrs = self.build_attrs(attrs)
        id_ = final_attrs.get('id')
        upload = reverse('maillist_upload')

        return mark_safe(input_ + (
            '<script type="text/javascript">' +
            'window.jQuery = window.$ = jQuery || django.jQuery;' +
            'jQuery(document).ready(function(){' +
            'new Redactor("%s", { focus: true, upload: "%s"});' % (id_, upload) +
            '});</script>'
        ))
