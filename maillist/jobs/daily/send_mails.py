from django_extensions.management.jobs import DailyJob

from maillist.command import send_mails

class Job(DailyJob):
    def execute(self):
        send_mails()


