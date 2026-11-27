#!/usr/bin/env python3
"""يولّد sw.js من جديد: قائمة كل ملفات صفحات المذاكرة + رقم نسخة من محتواها.
شغّليه من جذر المستودع بعد أي تعديل:  python3 tools/build-offline.py
(لو نسيتيه، الصفحات برضه بتتحدث وهي على النت — بس الصفحات اللي ماتفتحتش مش هتاخد آخر نسخة غير لما تتفتح)."""
import hashlib, json, os, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIRS = ['study-kingdom', 'arabic', 'english', 'religion', 'math', 'science', 'social', 'ict', 'shared']
files = subprocess.run(['git', 'ls-files', 'index.html', 'manifest.webmanifest', 'icons', *DIRS], cwd=ROOT, capture_output=True, text=True).stdout.split()
files = sorted(f for f in files if not f.endswith('.md') and os.path.exists(os.path.join(ROOT, f)))
h = hashlib.sha256(open(os.path.join(ROOT, 'tools', 'sw.template.js'), 'rb').read())
for f in files:
    h.update(f.encode()); h.update(open(os.path.join(ROOT, f), 'rb').read())
ver = h.hexdigest()[:10]
tpl = open(os.path.join(ROOT, 'tools', 'sw.template.js'), encoding='utf-8').read()
out = tpl.replace('__VERSION__', ver).replace('__FILES__', json.dumps(['./'] + files, ensure_ascii=False, indent=0))
open(os.path.join(ROOT, 'sw.js'), 'w', encoding='utf-8').write(out)
print(f'sw.js: {len(files)} files, version {ver}')
