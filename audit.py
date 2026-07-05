import os
import re

backend_endpoints = [line.strip() for line in open(r'd:\Projects\jalgaonWeb\jalgaonApi\endpoints.txt', encoding='utf-8') if line.strip()]

frontend_usages = set()
for root, _, files in os.walk(r'd:\Projects\jalgaonWeb\New-JalgaonUI\src'):
    for f in files:
        if not f.endswith(('.ts', '.tsx')): continue
        with open(os.path.join(root, f), 'r', encoding='utf-8') as file:
            content = file.read()
            # extract string literals and template literals containing /api/v1/
            matches = re.findall(r'/api/v1/[^\s\'\"`\?]+', content.replace(r'$', r''))
            for m in matches:
                # normalize JS template vars like {id} to {}
                norm = re.sub(r'\{[^}]+\}', '{}', m)
                frontend_usages.add(norm)

output_lines = []
output_lines.append('# API Audit Report')
output_lines.append('This artifact tracks the connection status of all Django backend APIs to the Next.js 15 frontend.\n')
output_lines.append('## 🟢 Implemented in Frontend:')

unmatched = []

for ep in backend_endpoints:
    # Convert backend swagger format {id} to {}
    ep_norm = re.sub(r'\{[^}]+\}', '{}', ep)
    if not ep_norm.endswith('/'): ep_norm += '/'
    
    matched = False
    for usage in frontend_usages:
        u = usage if usage.endswith('/') else usage + '/'
        if ep_norm == u or u.startswith(ep_norm):
            matched = True
            break
    if matched:
        output_lines.append(f'- [x] {ep}')
    else:
        unmatched.append(ep)

output_lines.append('\n## 🔴 Missing/Not Found in Frontend:')
for ep in unmatched:
    output_lines.append(f'- [ ] {ep}')
    
with open(r'd:\Projects\jalgaonWeb\api_audit_report.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output_lines))
