import datetime

from django.db import models
from django.utils.translation import ugettext as _


class Maillist(models.Model):
    name = models.CharField(_('name'), max_length=100)
    description = models.TextField(_('description'))

    class Meta:
        verbose_name = _('Mail list')
        verbose_name_plural = _('Mail lists')

    def __unicode__(self):
        return self.name

    @models.permalink
    def get_absolute_url(self):
        return ('maillist_subscribe', (), {
            'maillist_id': self.id,
        })

class Mail(models.Model):
    maillist = models.ForeignKey(Maillist, verbose_name=_('maillist'),
                                                        related_name='mails')
    subject = models.CharField(_('subject'), max_length=100)
    content = models.TextField(_('content'))

    create_date = models.DateTimeField(editable=False)
    publish_date = models.DateTimeField(blank=True, default=datetime.datetime.now)

    class Meta:
        verbose_name = _('Mail')
        verbose_name_plural = _('Mails')
        ordering = ('-publish_date', )


    def __unicode__(self):
        return self.subject

    def save(self, *args, **kwargs):
        if not self.id:
            self.create_date = datetime.datetime.now()
        if not self.publish_date:
            self.publish_date = self.create_date
        super(Mail, self).save(*args, **kwargs)


class Subscriber(models.Model):
    maillist = models.ForeignKey(Maillist, verbose_name=_('maillist'),
                                                    related_name='subscribers')
    email = models.EmailField()
    subscription_date = models.DateTimeField(editable=False)

    class Meta:
        verbose_name = _('Subscriber')
        verbose_name_plural = ('Subscribers')
        unique_together = (
            ('email', 'maillist'),
        )

    def __unicode__(self):
        return self.email

    def save(self, *args, **kwargs):
        if not self.id:
            self.subscription_date = datetime.datetime.now()
        super(Subscriber, self).save(*args, **kwargs)


class EmailLog(models.Model):
    mail = models.ForeignKey(Mail, related_name='logs')
    subscriber = models.ForeignKey(Subscriber, related_name='logs')

    success = models.BooleanField()
