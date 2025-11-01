#!/usr/bin/env python3
"""
Pre-deployment verification script
Run this before deploying to catch common issues
"""

import os
import sys
from pathlib import Path

def check_file_exists(file_path, description):
    """Check if a file exists"""
    if os.path.exists(file_path):
        print(f"✅ {description}: Found")
        return True
    else:
        print(f"❌ {description}: Missing!")
        return False

def check_file_contains(file_path, text, description):
    """Check if file contains specific text"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if text in content:
                print(f"✅ {description}: OK")
                return True
            else:
                print(f"❌ {description}: Not found!")
                return False
    except:
        print(f"❌ {description}: Could not read file!")
        return False

def main():
    print("=" * 60)
    print("🔍 TaskMaster - Pre-Deployment Verification")
    print("=" * 60)
    print()
    
    project_root = Path(__file__).parent
    backend_path = project_root / "backend"
    frontend_path = project_root / "frontend"
    
    all_checks = []
    
    # Backend checks
    print("📦 Backend Checks:")
    print("-" * 60)
    all_checks.append(check_file_exists(backend_path / "requirements.txt", "requirements.txt"))
    all_checks.append(check_file_exists(backend_path / "build.sh", "build.sh"))
    all_checks.append(check_file_exists(backend_path / "render.yaml", "render.yaml"))
    all_checks.append(check_file_exists(backend_path / ".env.example", ".env.example"))
    all_checks.append(check_file_exists(backend_path / ".gitignore", "Backend .gitignore"))
    all_checks.append(check_file_contains(
        backend_path / "requirements.txt", 
        "gunicorn", 
        "Gunicorn in requirements"
    ))
    all_checks.append(check_file_contains(
        backend_path / "requirements.txt", 
        "psycopg2", 
        "PostgreSQL driver in requirements"
    ))
    print()
    
    # Frontend checks
    print("⚛️  Frontend Checks:")
    print("-" * 60)
    all_checks.append(check_file_exists(frontend_path / "netlify.toml", "netlify.toml"))
    all_checks.append(check_file_exists(frontend_path / "public" / "_redirects", "_redirects"))
    all_checks.append(check_file_exists(frontend_path / "package.json", "package.json"))
    all_checks.append(check_file_exists(frontend_path / ".env.example", "Frontend .env.example"))
    print()
    
    # Git checks
    print("🔧 Git Checks:")
    print("-" * 60)
    all_checks.append(check_file_exists(project_root / ".gitignore", "Root .gitignore"))
    
    # Check if .env files are NOT in git
    if os.path.exists(backend_path / ".env"):
        if ".env" in open(project_root / ".gitignore").read():
            print("✅ .env files excluded from git: OK")
            all_checks.append(True)
        else:
            print("❌ .env files NOT excluded from git!")
            all_checks.append(False)
    
    print()
    
    # Documentation checks
    print("📝 Documentation Checks:")
    print("-" * 60)
    all_checks.append(check_file_exists(project_root / "DEPLOYMENT_GUIDE.md", "Deployment Guide"))
    all_checks.append(check_file_exists(project_root / "QUICK_DEPLOY.md", "Quick Deploy Guide"))
    all_checks.append(check_file_exists(project_root / "PROJECT_README.md", "Project README"))
    print()
    
    # Summary
    print("=" * 60)
    passed = sum(all_checks)
    total = len(all_checks)
    
    if all(all_checks):
        print(f"🎉 All checks passed! ({passed}/{total})")
        print()
        print("✨ You're ready to deploy!")
        print()
        print("Next steps:")
        print("1. Initialize git: git init")
        print("2. Add files: git add .")
        print("3. Commit: git commit -m 'Initial commit'")
        print("4. Create GitHub repo and push")
        print("5. Follow DEPLOYMENT_GUIDE.md")
        return 0
    else:
        print(f"⚠️  Some checks failed ({passed}/{total} passed)")
        print()
        print("Please fix the issues above before deploying.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
