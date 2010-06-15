from django.test import TestCase
from django.core.urlresolvers import reverse
from django.core import mail
from django.contrib.webdesign.lorem_ipsum import paragraph

from maillist.models import Maillist, Mail, Subscriber


class MaillistTestCase(TestCase):
    def _create_maillist(self):
        return Maillist.objects.create(
            name='test-maillist-name',
            description=paragraph()
        )

    def _create_mail(self, maillist):
        return Mail.objects.create(
            maillist=maillist,
            subject='test-mail-subject-%s' % Mail.objects.count(),
            content=paragraph()
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

    def test_command(self):
        pass
