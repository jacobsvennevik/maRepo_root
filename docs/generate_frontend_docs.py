import os
import json

# Set up your base directory for your frontend source.
# Adjust the path as needed.
BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "src")

# Output files for the auto‑generated docs and jsdoc config.
OUTPUT_RST = os.path.join(os.path.dirname(__file__), "jsdoc_autogen.rst")
OUTPUT_CONFIG = os.path.join(os.path.dirname(__file__), "jsdoc_config.json")

# Directories to exclude (optional)
EXCLUDE_DIRS = {"tests", "migrations", "templates", "SidebarContext"}

def generate_rst_entry(component_name):
    """
    Create an RST entry for a given component.
    """
    title = f"{component_name} Component"
    underline = "=" * len(title)
    entry = f"{title}\n{underline}\n\n"
    entry += (
        f".. js:autoclass:: {component_name}\n"
        "   :members:\n"
    )
    return entry

import os
import re

def walk_frontend(base_dir):
    """
    Walk the frontend directory and group JavaScript files that define a class.
    Returns a dictionary mapping the first-level directory (or 'Root')
    to a list of tuples (component_name, relative_path).
    """
    modules_by_group = {}
    for root, dirs, files in os.walk(base_dir):
        # Exclude certain directories and hidden ones
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith(".")]
        for file in files:
            if file.endswith(".js") or file.endswith(".jsx"):a
                full_path = os.path.join(root, file)
                # Read file content and check for a class definition
                try:
                    with open(full_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    # Only include files that contain a class declaration.
                    if "class " not in content:
                        continue
                    # Extract the first class name encountered
                    match = re.search(r'class\s+(\w+)', content)
                    if match:
                        component_name = match.group(1)
                    else:
                        # Fallback to using the file name (without extension)
                        component_name = os.path.splitext(file)[0]
                except Exception as e:
                    print(f"Could not read file {full_path}: {e}")
                    continue

                rel_path = os.path.relpath(full_path, base_dir)
                group = rel_path.split(os.sep)[0] if os.sep in rel_path else "Root"
                modules_by_group.setdefault(group, []).append((component_name, rel_path))
    return modules_by_group


def generate_jsdoc_config(base_dir):
    """
    Generate a JSON configuration for jsdoc.
    This auto‑discovers folders that contain .js or .jsx files.
    The generated paths are relative to where OUTPUT_CONFIG is written.
    """
    includes = set()
    for root, dirs, files in os.walk(base_dir):
        if any(file.endswith(".js") or file.endswith(".jsx") for file in files):
            # Determine a path relative to the directory where OUTPUT_CONFIG is located.
            rel_path = os.path.relpath(root, os.path.dirname(OUTPUT_CONFIG))
            includes.add(rel_path)
    config = {
        "source": {
            "includePattern": ".+\\.(js|jsx)$",
            "excludePattern": "(^|\\/|\\\\)(node_modules|theme)(\\/|\\\\)",
            "include": sorted(list(includes))
        },
        "opts": {
            "recurse": False
        }
    }
    return config

def main():
    # Generate the RST documentation.
    modules_by_group = walk_frontend(BASE_DIR)
    with open(OUTPUT_RST, "w", encoding="utf-8") as f:
        f.write("Frontend Documentation (Auto‑generated)\n")
        f.write("========================================\n\n")
        # Group entries by the first-level directory (or "Root")
        for group, components in sorted(modules_by_group.items()):
            f.write(f"{group}\n")
            f.write(f"{'-' * len(group)}\n\n")
            for component_name, _ in sorted(components):
                f.write(generate_rst_entry(component_name))
    print(f"Auto‑generated frontend documentation written to {OUTPUT_RST}")

    # Generate the jsdoc configuration.
    config = generate_jsdoc_config(BASE_DIR)
    with open(OUTPUT_CONFIG, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)
    print(f"Auto‑generated jsdoc configuration written to {OUTPUT_CONFIG}")

if __name__ == "__main__":
    main()
