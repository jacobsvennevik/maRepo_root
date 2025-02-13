import os

def print_directory_structure_walk(root_dir, exclude_files=None, exclude_dirs=None):
    """
    Recursively prints the directory structure using os.walk, 
    while excluding specified files and directories.
    
    :param root_dir: The root directory to start printing from.
    :param exclude_files: A set of file names to exclude.
    :param exclude_dirs: A set of directory names to exclude.
    """
    if exclude_files is None:
        exclude_files = {
            "__pycache__", ".git", ".DS_Store",
            "perldoc.py", "rainbow_dash.py", "rrt.py", "sas.py", "solarized.py",
            "staroffice.py", "stata_dark.py", "stata_light.py", "tango.py", "trac.py",
            "vim.py", "vs.py", "xcode.py", "zenburn.py",
            "token.py", "unistring.py", "util.py"
        }
    if exclude_dirs is None:
        exclude_dirs = {
            "myenv",  # Exclude virtual environment directory
        }

    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Filter out unwanted directories from traversal
        dirnames[:] = [d for d in dirnames if d not in exclude_dirs]
        level = dirpath.replace(root_dir, "").count(os.sep)
        indent = "   " * level
        print(f"{indent}📁 {os.path.basename(dirpath)}/")
        for filename in filenames:
            if filename in exclude_files:
                continue
            print(f"{indent}   📄 {filename}")

if __name__ == "__main__":
    project_dir = "/Users/jacobhornsvennevik/Documents/GitHub/MAPROJECT"
    print_directory_structure_walk(project_dir)
