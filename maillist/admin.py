from django.contrib import admin
from django.db.models import TextField
from django.utils.translation import ugettext as _

from maillist import models
from maillist.widgets import JQueryEditor

class MaillistAdmin(admin.ModelAdmin):
    list_display = ('name', 'subscrubers_count', 'last_email')

    formfield_overrides = {
        TextField: {'widget': JQueryEditor},
    }

    def last_email(self, obj):
        last_email = obj.mails.all()[:1]
        if len(last_email):
            return '%s (%s)' % (last_email[0].publish_date, last_email[0].name)

        return _('Mail list is empty')

    def subscrubers_count(self, obj):
        return obj.subscribers.count()
    subscrubers_count.short_description = _('subscrubers count')


class MailAdmin(admin.ModelAdmin):
    list_display = ('subject', 'create_date', 'publish_date', 'maillist')
    list_filter = ('maillist', )

    formfield_overrides = {
        TextField: {'widget': JQueryEditor},
    }

admin.site.register(models.Maillist, MaillistAdmin)
admin.site.register(models.Mail, MailAdmin)
