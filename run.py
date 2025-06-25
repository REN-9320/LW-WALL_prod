#!/usr/bin/env python
# banpaku2/run.py
import os
import sys

if getattr(sys, 'frozen', False):
    base_dir = sys._MEIPASS
else:
    base_dir = os.path.dirname(os.path.abspath(__file__))

sys.path.insert(0, base_dir)  # manage.py と同じ扱い

# Django の settings モジュール名（lastwords/settings.py）を指定
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lastwords.settings')

from django.core.management import execute_from_command_line

execute_from_command_line(sys.argv)