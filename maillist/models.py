import datetime

from django.db import models
from django.utils.translation import ugettext as _
from django.utils.hashcompat import sha_constructor
from django.conf import settings
from django.contrib.sites.models import Site
from django.core.mail import EmailMessage
from django.template.loader import render_to_string


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

    def unsubscibe_hash(self, subscriber):
        return sha_constructor(
            str(self.id) + subscriber.email + settings.SECRET_KEY
        ).hexdigest()


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

    def send(self, subscriber):
        context = {
            'mail': self,
            'maillist': self.maillist,
            'unsubscribe_hash': self.maillist.unsubscibe_hash(subscriber),
            'subscriber': subscriber,
            'site': Site.objects.get_current(),
        }
        subject = render_to_string('maillist/maillist_subject.txt', context)
        # Email subject *must not* contain newlines
        subject = ''.join(subject.splitlines())

        message = render_to_string('maillist/maillist_mail.html', context)

        msg = EmailMessage(subject, message, settings.DEFAULT_FROM_EMAIL,
                                                        [subscriber.email])
        msg.content_subtype = "html"
        try:
            msg.send()
        except:
            success = False
        else:
            success = True

        EmailLog.objects.get_or_create(subscriber=subscriber, mail=self,
                                                           success=success)


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
