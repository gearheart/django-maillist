from datetime import datetime, timedelta
from django.test import TestCase
from django.core.urlresolvers import reverse
from django.core import mail
from django.contrib.webdesign.lorem_ipsum import paragraph

from maillist.models import Maillist, Mail, Subscriber, EmailLog
from maillist.command import send_mails


class MaillistTestCase(TestCase):
    def _create_maillist(self):
        return Maillist.objects.create(
            name='test-maillist-name',
            description=paragraph()
        )

    def _create_mail(self, maillist, days=0):
        return Mail.objects.create(
            maillist=maillist,
            subject='test-mail-subject-%s' % Mail.objects.count(),
            content=paragraph(),
            publish_date = datetime.now() + timedelta(days)
        )

    def test_list(self):
        maillists = [self._create_maillist() for i in range(5)]
        resp = self.client.get(reverse('maillist_list'))
        for maillist in maillists:
            self.assertContains(resp, maillist.name)
            self.assertContains(resp, maillist.description)
            self.assertContains(resp, maillist.get_absolute_url())

    def test_subscription(self):
        maillist = self._create_maillist()
        self.assertEquals(maillist.subscribers.count(), 0)
        resp = self.client.get(maillist.get_absolute_url())
        self.assertContains(resp, '<form')
        resp = self.client.post(maillist.get_absolute_url(), {'email': 'test@mail.com'})
        self.assertRedirects(resp, reverse('maillist_list'))
        self.assertEquals(maillist.subscribers.count(), 1)

        resp = self.client.post(maillist.get_absolute_url(), {'email': 'test@mail.com'})
        self.assertRedirects(resp, reverse('maillist_list'))
        self.assertEquals(maillist.subscribers.count(), 1)

    def test_send(self):
        maillist = self._create_maillist()
        mail_ = self._create_mail(maillist)

        subscriber, _ = Subscriber.objects.get_or_create(
            maillist=maillist,
            email='test@mail.com'
        )

        mail_.send(subscriber)
        self.assertEquals(len(mail.outbox), 1)
        sent = mail.outbox[0]
        self.assertTrue(mail_.subject in sent.subject)
        self.assertTrue(mail_.content in sent.body)
        self.assertTrue(maillist.unsubscibe_hash(subscriber) in sent.body)

    def test_unsubscirption(self):
        maillist = self._create_maillist()

        subscriber, _ = Subscriber.objects.get_or_create(
            maillist=maillist,
            email='test@mail.com'
        )

        self.assertEquals(maillist.subscribers.count(), 1)
        resp = self.client.post(reverse('maillist_unsubscribe', kwargs={
            'maillist_id': maillist.id,
            'subscriber_id': subscriber.id,
            'hash': maillist.unsubscibe_hash(subscriber)
        }))

        self.assertRedirects(resp, reverse('maillist_list'))

        self.assertEquals(maillist.subscribers.count(), 0)

    def test_send_mails(self):
        maillist = self._create_maillist()
        subscriber, _ = Subscriber.objects.get_or_create(
            maillist=maillist,
            email='test@mail.com'
        )
        subscriber.subscription_date -= timedelta(10)
        subscriber.save()

        other_subscriber, _ = Subscriber.objects.get_or_create(
            maillist=maillist,
            email='test1@mail.com'
        )
        other_subscriber.subscription_date -= timedelta(10)
        other_subscriber.save()

        third_subscriber, _ = Subscriber.objects.get_or_create(
            maillist=maillist,
            email='test11@mail.com'
        )
        third_subscriber.subscription_date -= timedelta(10)
        third_subscriber.save()

        old_mail = self._create_mail(maillist, days=-20) # 0
        not_old_mail = self._create_mail(maillist, days=-5) # 1
        new_mail = self._create_mail(maillist, days=5) # 2

        sent_mail = self._create_mail(maillist, days=-5) # 3
        EmailLog.objects.create(mail=sent_mail, subscriber=subscriber, success=True)
        EmailLog.objects.create(mail=sent_mail, subscriber=other_subscriber, success=True)
        EmailLog.objects.create(mail=sent_mail, subscriber=third_subscriber, success=True)

        not_sent_mail = self._create_mail(maillist, days=-4) # 4
        EmailLog.objects.create(mail=not_sent_mail, subscriber=subscriber, success=False)
        EmailLog.objects.create(mail=not_sent_mail, subscriber=other_subscriber, success=True)


        send_mails()

        for log in EmailLog.objects.all():
            print log.mail.subject, log.subscriber.email, log.success

        self.assertEquals(len(mail.outbox), 5)
        self.assertEquals(EmailLog.objects.count(), 9)

        for subscriber in (subscriber, other_subscriber, third_subscriber):
            self.assertEquals(EmailLog.objects.filter(subscriber=subscriber, mail=not_old_mail).count(), 1)
            self.assertEquals(EmailLog.objects.filter(subscriber=subscriber, mail=sent_mail).count(), 1)
            self.assertEquals(EmailLog.objects.filter(subscriber=subscriber, mail=not_sent_mail).count(), 1)
