"""Audit Git's candidate file list without printing credential values.

Run before staging / pushing. Text pattern detection is a bounded check, not a
guarantee that all secrets or personal data have been found.
"""
import json,re,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
PATTERNS=[('GitHub token',rb'\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b'),('Google API key',rb'\bAIza[A-Za-z0-9_-]{35}\b'),('Google client secret',rb'\bGOCSPX-[A-Za-z0-9_-]{20,}\b'),('private key',rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),('AWS access key',rb'\b(?:AKIA|ASIA)[A-Z0-9]{16}\b')]
def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT)
def candidates():return sorted(set(p.decode('utf-8') for p in git('ls-files','-c','--others','--exclude-standard','-z').split(b'\0') if p))
problems=[];checked=0;large=[]
for name in candidates():
 p=ROOT/name
 if not p.is_file():continue
 if (p.name.startswith('.env') and p.name!='.env.example') or p.suffix.lower() in ['.db','.sqlite','.sqlite3','.pem']:
  problems.append({'file':name,'reason':'runtime database or credential file'});continue
 if p.stat().st_size>2*1024*1024:large.append(name);continue
 data=p.read_bytes()
 if b'\0' in data:continue
 checked+=1
 for label,rx in PATTERNS:
  for match in re.finditer(rx,data):problems.append({'file':name,'line':data[:match.start()].count(b'\n')+1,'reason':label})
print(json.dumps({'text_files_checked':checked,'large_files_not_pattern_scanned':large,'findings':problems},indent=2))
sys.exit(bool(problems))
