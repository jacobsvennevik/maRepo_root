# docs/conf.py

import os
import sys
from decouple import Config, RepositoryEnv

# 1) Insert the parent directory so that Sphinx can locate 'backend'.
sys.path.insert(0, os.path.abspath('..'))

# Load .env file from the backend directory
env_path = os.path.abspath('../backend/.env')
if os.path.exists(env_path):
    config = Config(RepositoryEnv(env_path))
    # Load environment variables into os.environ
    for key, value in config.repository.data.items():
        os.environ[key] = value

# 2) Point to your Django settings and initialize Django.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()

# -- Project information
project = 'YesYes'
author = 'SvenMedSpenn'
release = '0.0.1'

# -- General configuration
extensions = [
    'sphinx.ext.autodoc',   # Pull docstrings automatically
    'sphinx.ext.napoleon',  # Parse Google/NumPy style docstrings
]

# Conditionally add sphinx_js for full builds
if not os.environ.get('BUILD_BACKEND_ONLY'):
    extensions.append('sphinx_js')

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


# Configuration for sphinx-js
if not os.environ.get('BUILD_BACKEND_ONLY'):
    jsdoc_config_path = "jsdoc_config.json"

