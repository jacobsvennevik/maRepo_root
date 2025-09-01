"""
Simple logging module for the core platform.
"""
import logging

def get_logger(name):
    """Get a logger instance for the given name."""
    return logging.getLogger(name)
