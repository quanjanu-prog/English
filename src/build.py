import re, os
B = os.path.dirname(os.path.abspath(__file__))
rd = lambda p: open(os.path.join(B, p), encoding='utf8').read()
head = rd('head.html')
i = head.index('<header')
head_part, body_part = head[:i], head[i:]
app = rd('app.js'); app = app[:app.index('/* ===== Khởi động ===== */')]
js = '\n'.join([rd('data.js'), rd('vocab1.js'), rd('vocab2.js'), rd('vocab3.js'), rd('core.js'), rd('views1.js'), rd('views2.js'), rd('views3.js'), rd('sb/sb-admin.js'), rd('sb/sb-auth.js'), app, rd('sb/sb-boot.js')])
reset = '<style>*,*::before,*::after{box-sizing:border-box}html{-webkit-text-size-adjust:100%}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);color-scheme:light}body{margin:0;font:14px/1.5 system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>\n'
doc = ('<!doctype html>\n<html lang="vi">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
       '<meta name="description" content="English OS: hệ thống học tiếng Anh 12 tuần cho công việc thương mại điện tử và cuộc sống.">\n'
       '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%232f5bd3%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpath d=%22M2 9l10-5 10 5-10 5z%22/%3E%3Cpath d=%22M6 11v5c3 2 9 2 12 0v-5%22/%3E%3C/svg%3E">\n'
       + reset + head_part + '</head>\n<body>\n' + body_part +
       '\n<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/dist/umd/supabase.js"></script>\n<script>\n' + js + '\n</script>\n</body>\n</html>\n')

open(os.path.join(B, '..', 'index.html'), 'w', encoding='utf8').write(doc)
print(len(doc))
