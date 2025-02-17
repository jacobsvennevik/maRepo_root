# setup.py (in your project root, next to the backend folder)

from setuptools import setup, find_packages

setup(
    name='backend',
    version='0.1.0',
    packages=find_packages(),  # Automatically finds Python packages in subfolders
    include_package_data=True, # If you want to include static files, templates, etc.
    install_requires=[
        # List your dependencies here, for example:
        # 'Django>=4.2,<5.0',
        # 'pytest>=7.4',
    ],
    # Optional: Additional metadata
    author='Your Name',
    author_email='your.email@example.com',
    description='A Django project for ...',
    url='https://github.com/yourname/backend',
    python_requires='>=3.8',
)
