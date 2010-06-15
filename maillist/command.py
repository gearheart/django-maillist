import datetime

from django.db.models import Avg, Max, Min, Count, Q
from maillist.models import Mail, Subscriber

def send_mails():
    unsent_mails = (Mail.objects
        .annotate(sends=Count('logs'))
        .filter(Q(sends=0) | Q(logs__success=False)))

    for mail in unsent_mails:
        unsent_subscribers = (Subscriber.objects
            .filter(subscription_date__lte=mail.publish_date)
            .exclude(logs__success=True, logs__mail=mail))

        for subscriber in unsent_subscribers:
            mail.send(subscriber)
