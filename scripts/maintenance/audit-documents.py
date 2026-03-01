#!/usr/bin/env python3
"""
Document audit tool for the reading library.

Tracks which documents have been manually reviewed and their quality status.

Usage:
    python3 scripts/maintenance/audit-documents.py sample [N]          # Get N random unaudited docs
    python3 scripts/maintenance/audit-documents.py queue [N]           # Get next N unaudited docs (sorted)
    python3 scripts/maintenance/audit-documents.py status              # Show audit progress
    python3 scripts/maintenance/audit-documents.py check <file>        # Check a specific file for issues
    python3 scripts/maintenance/audit-documents.py mark <file> <status>  # Mark file as audited
    python3 scripts/maintenance/audit-documents.py finalize-round <N>  # Mark docs from last commit as audited
    python3 scripts/maintenance/audit-documents.py issues              # Find docs with potential issues
"""

import os
import re
import sys
import json
import random
import subprocess
from pathlib import Path
from datetime import datetime

DOCS_DIR = Path("docs")
AUDIT_LOG = Path("scripts/maintenance/audit-log.json")

# Quality issue patterns
ISSUE_PATTERNS = {
    'pdf_artifacts': re.compile(r'!\[\]\(_?page_\d+_(Picture|Figure)_\d+'),
    'broken_anchors': re.compile(r'\[.*?\]\(#page-\d+-\d+\)'),
    'empty_title': re.compile(r'^title:\s*["\']?\s*["\']?\s*$', re.MULTILINE),
    'title_with_url': re.compile(r'^title:.*https?://', re.MULTILINE),
    'title_with_pipe': re.compile(r'^title:.*\|.*\|', re.MULTILINE),
    'very_short': lambda c: len(c.split('---', 2)[-1].strip()) < 200,
    'very_long': lambda c: len(c) > 100000,
    'no_frontmatter': lambda c: not c.startswith('---'),
    'multiple_frontmatter': lambda c: len(re.findall(r'^---\s*\n(?:[a-z_]+:.*\n)+---', c, re.MULTILINE)) > 1,
    'table_heavy': lambda c: c.count('|---|') > 10,
    'code_heavy': lambda c: c.count('```') > 20,
    'broken_markdown': re.compile(r'\[([^\]]{0,3})\]\(\s*\)'),  # Empty links
    'wikipedia_scrape': re.compile(r'\[\d+\]|\{\{|\[\['),  # Wikipedia artifacts
}

def load_audit_log():
    if AUDIT_LOG.exists():
        with open(AUDIT_LOG) as f:
            return json.load(f)
    return {"audited_documents": [], "flagged_for_review": [], "quality_scores": {}}

def save_audit_log(data):
    data['metadata']['last_updated'] = datetime.now().strftime('%Y-%m-%d')
    with open(AUDIT_LOG, 'w') as f:
        json.dump(data, f, indent=2)

def get_all_docs():
    return list(DOCS_DIR.rglob("*.md"))

def check_document(filepath):
    """Check a document for quality issues."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
    except Exception as e:
        return {'error': str(e)}

    issues = []

    # Check regex patterns
    for name, pattern in ISSUE_PATTERNS.items():
        if callable(pattern):
            if pattern(content):
                issues.append(name)
        elif pattern.search(content):
            issues.append(name)

    # Extract metadata
    title = "Unknown"
    title_match = re.search(r'^title:\s*["\']?([^"\'\n]+)', content, re.MULTILINE)
    if title_match:
        title = title_match.group(1).strip()

    word_count = len(content.split())
    line_count = len(content.split('\n'))

    return {
        'title': title,
        'word_count': word_count,
        'line_count': line_count,
        'issues': issues,
        'issue_count': len(issues),
    }

def sample_unaudited(n=10):
    """Get N random unaudited documents."""
    log = load_audit_log()
    audited = set(log.get('audited_documents', []))

    all_docs = get_all_docs()
    unaudited = [d for d in all_docs if str(d.relative_to(DOCS_DIR)) not in audited]

    if len(unaudited) < n:
        n = len(unaudited)

    sample = random.sample(unaudited, n)

    print(f"=== SAMPLE OF {n} UNAUDITED DOCUMENTS ===\n")

    results = []
    for filepath in sample:
        rel_path = filepath.relative_to(DOCS_DIR)
        info = check_document(filepath)

        status = "OK" if not info.get('issues') else f"ISSUES: {', '.join(info['issues'])}"

        print(f"📄 {rel_path}")
        print(f"   Title: {info.get('title', 'Unknown')[:60]}")
        print(f"   Words: {info.get('word_count', 0):,} | Lines: {info.get('line_count', 0)}")
        print(f"   Status: {status}")
        print()

        results.append({
            'path': str(rel_path),
            'info': info
        })

    return results

def find_issues():
    """Find all documents with potential issues."""
    print("=== SCANNING FOR ISSUES ===\n")

    all_docs = get_all_docs()
    issues_found = {}

    for filepath in all_docs:
        info = check_document(filepath)
        if info.get('issues'):
            rel_path = str(filepath.relative_to(DOCS_DIR))
            issues_found[rel_path] = info['issues']

    # Group by issue type
    by_issue = {}
    for path, issues in issues_found.items():
        for issue in issues:
            if issue not in by_issue:
                by_issue[issue] = []
            by_issue[issue].append(path)

    print("Issues found:\n")
    for issue, paths in sorted(by_issue.items(), key=lambda x: -len(x[1])):
        print(f"  {issue}: {len(paths)} documents")

    print(f"\nTotal documents with issues: {len(issues_found)}")

    return by_issue

def show_status():
    """Show audit progress with category breakdown."""
    log = load_audit_log()
    all_docs = get_all_docs()
    audited_set = set(log.get('audited_documents', []))

    audited_count = len(audited_set)
    total = len(all_docs)
    flagged = len(log.get('flagged_for_review', []))
    current_round = log.get('metadata', {}).get('current_round', 214)

    print("=== AUDIT STATUS ===\n")
    print(f"Total documents:    {total:,}")
    print(f"Audited:            {audited_count:,} ({100*audited_count/total:.1f}%)")
    print(f"Remaining:          {total - audited_count:,}")
    print(f"Current round:      {current_round}")
    print(f"Flagged for review: {flagged}")

    # Category breakdown with progress
    print("\nProgress by category:")
    by_category = {}
    for doc in all_docs:
        cat = doc.parent.name
        rel_path = str(doc.relative_to(DOCS_DIR))

        if cat not in by_category:
            by_category[cat] = {'total': 0, 'audited': 0}

        by_category[cat]['total'] += 1
        if rel_path in audited_set:
            by_category[cat]['audited'] += 1

    for cat in sorted(by_category.keys()):
        total_cat = by_category[cat]['total']
        audited_cat = by_category[cat]['audited']
        pct = 100 * audited_cat / total_cat if total_cat > 0 else 0

        # Progress bar (20 chars)
        filled = int(pct / 5)
        bar = '█' * filled + '░' * (20 - filled)

        print(f"  {cat:30} {audited_cat:3}/{total_cat:3} ({pct:4.1f}%)  {bar}")

    # Completion estimate
    if audited_count > 0 and audited_count < total:
        remaining = total - audited_count
        print(f"\nEstimated completion:")
        print(f"  At 10 docs/round:  ~{(remaining + 9) // 10} rounds remaining")
        print(f"  At 15 docs/round:  ~{(remaining + 14) // 15} rounds remaining")
        print(f"  At 20 docs/round:  ~{(remaining + 19) // 20} rounds remaining")

def mark_audited(filepath, status='ok'):
    """Mark a document as audited."""
    log = load_audit_log()

    rel_path = str(Path(filepath).relative_to(DOCS_DIR) if DOCS_DIR in Path(filepath).parents else filepath)

    if rel_path not in log['audited_documents']:
        log['audited_documents'].append(rel_path)

    log['quality_scores'][rel_path] = status

    if status == 'flagged':
        if rel_path not in log['flagged_for_review']:
            log['flagged_for_review'].append(rel_path)

    log['metadata']['audited_count'] = len(log['audited_documents'])
    save_audit_log(log)

    print(f"Marked as {status}: {rel_path}")

def queue_next(n=10):
    """Get next N unaudited documents in alphabetical (sorted) order."""
    log = load_audit_log()
    audited = set(log.get('audited_documents', []))
    current_round = log.get('metadata', {}).get('current_round', 214)

    # Get all documents sorted alphabetically by relative path
    all_docs = sorted(get_all_docs(), key=lambda p: str(p.relative_to(DOCS_DIR)))
    unaudited = [d for d in all_docs if str(d.relative_to(DOCS_DIR)) not in audited]

    if len(unaudited) < n:
        n = len(unaudited)

    queue = unaudited[:n]
    total = len(all_docs)
    audited_count = len(audited)
    remaining = total - audited_count

    print(f"=== ROUND {current_round}: NEXT {n} DOCUMENTS IN QUEUE ===\n")
    print(f"Progress: {audited_count:,}/{total:,} ({100*audited_count/total:.1f}%) | Remaining: {remaining:,}\n")

    results = []
    for filepath in queue:
        rel_path = filepath.relative_to(DOCS_DIR)
        info = check_document(filepath)

        status = "OK" if not info.get('issues') else f"ISSUES: {', '.join(info['issues'])}"

        print(f"📄 {rel_path}")
        print(f"   Title: {info.get('title', 'Unknown')[:60]}")
        print(f"   Words: {info.get('word_count', 0):,} | Lines: {info.get('line_count', 0)}")
        print(f"   Status: {status}")
        print()

        results.append({
            'path': str(rel_path),
            'info': info
        })

    return results

def finalize_round(round_num):
    """Mark all documents from last git commit as audited."""
    try:
        # Get files changed in last commit
        result = subprocess.run(
            ['git', 'diff', '--name-only', 'HEAD~1', 'HEAD'],
            capture_output=True,
            text=True,
            check=True
        )

        changed_files = result.stdout.strip().split('\n')
        changed_docs = [
            f.replace('docs/', '')
            for f in changed_files
            if f.startswith('docs/') and f.endswith('.md')
        ]

        if not changed_docs:
            print("No documents found in last commit.")
            return

        log = load_audit_log()

        # Mark each document as audited
        newly_audited = []
        for doc in changed_docs:
            if doc not in log['audited_documents']:
                log['audited_documents'].append(doc)
                log['quality_scores'][doc] = 'ok'
                newly_audited.append(doc)

        # Update metadata
        log['metadata']['current_round'] = round_num + 1
        log['metadata']['audited_count'] = len(log['audited_documents'])

        save_audit_log(log)

        print(f"✓ Marked {len(newly_audited)} documents from Round {round_num} as audited:")
        for doc in newly_audited:
            print(f"  - {doc}")
        print(f"\n✓ Advanced to Round {round_num + 1}")

    except subprocess.CalledProcessError as e:
        print(f"Error running git command: {e}")
        sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    command = sys.argv[1].lower()

    if command == 'sample':
        n = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        sample_unaudited(n)
    elif command == 'queue':
        n = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        queue_next(n)
    elif command == 'status':
        show_status()
    elif command == 'check':
        if len(sys.argv) < 3:
            print("Usage: audit-documents.py check <filepath>")
            sys.exit(1)
        info = check_document(sys.argv[2])
        print(json.dumps(info, indent=2))
    elif command == 'mark':
        if len(sys.argv) < 4:
            print("Usage: audit-documents.py mark <filepath> <status>")
            print("Status: ok, flagged, needs_work, off_topic")
            sys.exit(1)
        mark_audited(sys.argv[2], sys.argv[3])
    elif command == 'finalize-round':
        if len(sys.argv) < 3:
            print("Usage: audit-documents.py finalize-round <round_number>")
            sys.exit(1)
        round_num = int(sys.argv[2])
        finalize_round(round_num)
    elif command == 'issues':
        find_issues()
    else:
        print(f"Unknown command: {command}")
        print(__doc__)
        sys.exit(1)

if __name__ == "__main__":
    main()
