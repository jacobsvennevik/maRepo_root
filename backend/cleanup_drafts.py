#!/usr/bin/env python
"""
Standalone script to clean up abandoned draft projects.
This can be run manually or scheduled with cron.

Usage:
    python cleanup_drafts.py [--hours 24] [--dry-run]

Example cron job (runs every 6 hours):
    0 */6 * * * cd /path/to/backend && python cleanup_drafts.py
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

if __name__ == '__main__':
    # Parse command line arguments
    hours = 24
    dry_run = False
    
    if '--hours' in sys.argv:
        try:
            hours_index = sys.argv.index('--hours')
            hours = int(sys.argv[hours_index + 1])
        except (ValueError, IndexError):
            print("Error: --hours requires a valid integer")
            sys.exit(1)
    
    if '--dry-run' in sys.argv:
        dry_run = True
    
    # Build the management command arguments
    cmd_args = ['manage.py', 'cleanup_drafts', '--hours', str(hours)]
    if dry_run:
        cmd_args.append('--dry-run')
    
    # Execute the cleanup command
    execute_from_command_line(cmd_args) 