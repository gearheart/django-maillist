from django.core.management.base import NoArgsCommand
from maillist.command import send_mails

class Command(NoArgsCommand):
    def handle_noargs(self, **options):
        send_mails()
