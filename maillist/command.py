import datetime
from itertools import chain

from django.db.models import Avg, Max, Min, Count, Q
from maillist.models import Mail, Subscriber

def send_mails():
    old = Mail.objects.filter(publish_date__lte=datetime.datetime.now())
    unsent = old.annotate(sends=Count('logs')).filter(sends=0)
    failed = old.filter(logs__success=False).distinct()

    for mail in chain(unsent, failed):
        subscribers = Subscriber.objects.filter(subscription_date__lte=mail.publish_date)
        to_send = subscribers.exclude(logs__mail=mail)
        to_send_again = subscribers.filter(Q(logs__success=False) & Q(logs__mail=mail)).distinct()

        for subscriber in chain(to_send, to_send_again):
            mail.send(subscriber)
