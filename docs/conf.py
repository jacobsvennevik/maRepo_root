# docs/conf.py

import os
import sys

# 1) Insert the parent directory so that Sphinx can locate 'maProject'.
sys.path.insert(0, os.path.abspath('..'))

# 2) Point to your Django settings and initialize Django.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maProject.settings')
import django
django.setup()

# -- Project information
project = 'maProject'
author = 'SvenMedSpenn'
release = '0.0.1'

# -- General configuration
extensions = [
    'sphinx.ext.autodoc',   # Pull docstrings automatically
    'sphinx.ext.napoleon',  # Parse Google/NumPy style docstrings
    'sphinx.ext.intersphinx'
]

templates_path = ['_templates']
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']

# If you want intersphinx to link to external docs:
intersphinx_mapping = {
    'python': ('https://docs.python.org/3', None),
}

# Autodoc settings
autodoc_member_order = 'bysource'
autoclass_content = 'both'

# -- Options for HTML output
html_theme = 'alabaster'  # or 'sphinx_rtd_theme'
html_static_path = ['_static']
