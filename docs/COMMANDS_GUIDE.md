# Project Commands Guide

This document maintains a command reference for every command used during development, explained with full breakdowns for beginners.

---

## 1. Git Commands

### Command:
```bash
git init
```
* **Purpose**: Initializes a new, empty Git repository in the current working directory.
* **Breakdown**:
  * `git`: The Git version control command-line program.
  * `init`: Subcommand telling Git to create the `.git/` tracking metadata directory.
* **Expected Result**: `Initialized empty Git repository in .../.git/`
* **Common Error**: Running it inside an existing repo creates a nested repository. Fix: Verify with `git status` first.

---

### Command:
```bash
git status
```
* **Purpose**: Displays the state of the working directory and the staging area.
* **Breakdown**:
  * `git`: The Git CLI tool.
  * `status`: Subcommand showing tracked, modified, and untracked files.
* **Expected Result**: Shows current branch and list of files staged or untracked.
* **Common Error**: `fatal: not a git repository`. Fix: Run `git init` or check your current working directory.

---

### Command:
```bash
git add .gitignore backend/requirements.txt backend/.env.example backend/Dockerfile docker-compose.yml
```
* **Purpose**: Stages specific files so they are included in the next commit.
* **Breakdown**:
  * `git add`: Moves files from the working tree to the Git staging index.
  * List of paths: Specifies exactly which files to include, leaving unmentioned files unstaged.
* **Expected Result**: Silent success (no output means success in Unix/Git).
* **Common Error**: Mistyping file paths. Fix: Use tab-completion or check with `git status`.

---

### Command:
```bash
git commit -m "feat: complete Stage 1 - project foundation, environment config, and Docker setup"
```
* **Purpose**: Records staged snapshots permanently to the project history.
* **Breakdown**:
  * `git commit`: Takes staged files and creates a new commit object.
  * `-m`: Flag indicating that the commit message follows in quotes.
  * `"..."`: Descriptive message explaining what changed in this commit.
* **Expected Result**: `[master (root-commit) 2d2db37] feat: complete Stage 1...`
* **Common Error**: `nothing to commit, working tree clean`. Fix: Stage files with `git add` first.

---

## 2. Python & Virtual Environment Commands

### Command:
```bash
python -m venv venv
```
* **Purpose**: Creates an isolated virtual environment named `venv` inside the current directory.
* **Breakdown**:
  * `python`: The system Python interpreter.
  * `-m`: Runs a library module as a script.
  * `venv`: The built-in virtual environment creation module.
  * `venv` (second one): The target folder name where the virtual environment will be created.
* **Expected Result**: A new directory named `venv/` containing `Scripts/` (or `bin/`), `Lib/`, and `pyvenv.cfg`.
* **Common Error**: `'python' is not recognized`. Fix: Ensure Python is added to your Windows PATH environment variable.

---

### Command:
```powershell
.\venv\Scripts\pip install -r requirements.txt
```
* **Purpose**: Installs all required packages listed in `requirements.txt` into the virtual environment.
* **Breakdown**:
  * `.\venv\Scripts\pip`: Ensures we run the pip package manager *inside* the virtual environment, NOT the global one.
  * `install`: Subcommand to download and install packages.
  * `-r`: Flag meaning "read from requirements file".
  * `requirements.txt`: The text file containing package names and versions.
* **Expected Result**: Downloads wheel files and prints `Successfully installed ...`.
* **Common Error**: Network timeout or missing C++ build tools for specific wheels. Fix: Pin pre-compiled binary wheel packages.

---

### Command:
```powershell
.\venv\Scripts\pip list
```
* **Purpose**: Shows all Python packages currently installed in this virtual environment with their exact versions.
* **Breakdown**:
  * `.\venv\Scripts\pip`: Pip tool from virtual environment.
  * `list`: Subcommand that outputs an ASCII table of installed packages and versions.
* **Expected Result**: List displaying package names like `fastapi`, `pydantic`, `SQLAlchemy`, etc.

---

## 3. Database & Service Verification Commands

### Command:
```powershell
Get-Service MySQL80
```
* **Purpose**: Checks whether the Windows MySQL service is currently running.
* **Breakdown**:
  * `Get-Service`: PowerShell cmdlet to query system background services.
  * `MySQL80`: The standard service name for MySQL 8.0 on Windows.
* **Expected Result**: Table showing `Status: Running`, `Name: MySQL80`.
* **Common Error**: Service is stopped. Fix: Run `Start-Service MySQL80` from an elevated prompt or launch MySQL from Services app.
