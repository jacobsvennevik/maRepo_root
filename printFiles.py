import os

def print_directory_structure(root_dir, indent="", exclude=("__pycache__", ".git", ".DS_Store")):
    """Recursively prints the directory structure while excluding specified folders/files"""
    items = sorted(os.listdir(root_dir))
    for item in items:
        if item in exclude:
            continue  # Skip excluded files/folders
        path = os.path.join(root_dir, item)
        if os.path.isdir(path):
            print(f"{indent}📁 {item}/")
            print_directory_structure(path, indent + "   ", exclude)
        else:
            print(f"{indent}📄 {item}")

# Set the directory you want to print
project_dir = "/Users/jacobhornsvennevik/Documents/GitHub/MAPROJECT"
print_directory_structure(project_dir)
