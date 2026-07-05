import os
d = 'd:/jalgaonWeb/New-JalgaonUI/src'
for r, ds, fs in os.walk(d):
    for f in fs:
        if f.endswith(('.ts', '.tsx')):
            p = os.path.join(r, f)
            with open(p, 'r', encoding='utf-8') as file:
                c = file.read()
            if 'process.env.NEXT_PUBLIC_API_URL || ""' in c:
                c = c.replace('process.env.NEXT_PUBLIC_API_URL || ""', 'process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"')
                with open(p, 'w', encoding='utf-8') as file:
                    file.write(c)
