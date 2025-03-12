import os

# Define the base directory for your backend (relative to this script)
BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "backend")
# Output file for the auto‑generated documentation
OUTPUT_RST = os.path.join(os.path.dirname(__file__), "backend_autogen.rst")

# Directories to exclude from documentation generation
EXCLUDE_DIRS = {"migrations", "tests", "templates"}

def generate_rst_entry(module_name):
    """
    Generate an RST autodoc entry for the given module.
    """
    entry = f".. automodule:: {module_name}\n"
    entry += "   :members:\n"
    entry += "   :undoc-members:\n"
    entry += "   :show-inheritance:\n\n"
    return entry

def walk_backend(base_dir):
    """
    Walk through the backend directory and collect Python module names.
    Excludes directories listed in EXCLUDE_DIRS.
    """
    modules_by_group = {}
    for root, dirs, files in os.walk(base_dir):
        # Remove directories that should be excluded
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        for file in files:
            if file.endswith(".py"):
                full_path = os.path.join(root, file)
                # Get the relative path from the base_dir
                rel_path = os.path.relpath(full_path, base_dir)

                # For __init__.py, use the directory as the module package.
                if file == "__init__.py":
                    module_path = os.path.dirname(rel_path)
                    if module_path == "":
                        module_name = "backend"
                    else:
                        module_name = "backend." + module_path.replace(os.sep, ".")
                else:
                    module_path = rel_path[:-3].replace(os.sep, ".")
                    # Ensure the module name starts with 'backend'
                    module_name = f"backend.{module_path}" if not module_path.startswith("backend") else module_path

                # Group modules by their first-level directory or "Root" if in the base directory
                group = os.path.dirname(rel_path).split(os.sep)[0] or "Root"
                modules_by_group.setdefault(group, []).append(module_name)
    return modules_by_group

def main():
    modules_by_group = walk_backend(BASE_DIR)
    with open(OUTPUT_RST, "w", encoding="utf-8") as f:
        f.write("Backend Documentation (Auto‑generated)\n")
        f.write("========================================\n\n")
        # Write sections grouped by the first-level directory (or "Root")
        for group, modules in sorted(modules_by_group.items()):
            f.write(f"{group}\n")
            f.write(f"{'-' * len(group)}\n\n")
            for module_name in sorted(modules):
                f.write(generate_rst_entry(module_name))
    print(f"Auto‑generated backend documentation written to {OUTPUT_RST}")

if __name__ == "__main__":
    main()
