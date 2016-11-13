"""
update a neocities site
"""

import os
import sys
import requests
import dateutil.parser

IGNORE = ['node_modules', '.git', '.sass-cache']
ALLOWED_FILETYPES = [
    '.html', '.htm',
    '.jpg', '.png', '.gif', '.svg', '.ico',
    '.md', '.markdown',
    '.js', '.json', '.geojson',
    '.css',
    '.txt', '.text', '.csv', '.tsv',
    '.xml',
    '.eot', '.ttf', '.woff', '.woff2', '.svg'
]

if __name__ == '__main__':
    # collect local files
    lpaths = []
    for path, dirs, files in os.walk('.', topdown=True):
        dirs[:] = [d for d in dirs if d not in IGNORE]
        for f in files:
            if f == '.':
                continue
            fpath = os.path.join(path, f)
            mtime = os.path.getmtime(fpath)
            lpaths.append((fpath[2:], mtime))

    # collect remote files
    username = sys.argv[1]
    password = sys.argv[2]
    base_url = 'https://{}:{}@neocities.org/api'.format(username, password)
    resp = requests.get('{}/list'.format(base_url))
    rpaths = [(d['path'], dateutil.parser.parse(d['updated_at']).timestamp())
              for d in resp.json()['files']]

    # what to delete
    lexists = [path for path, _ in lpaths]
    todelete = [path for path, _ in rpaths if path not in lexists]

    # what to create/update
    toupdate = []
    for lpath, lmtime in lpaths:
        remote = next(((path, mtime) for (path, mtime) in rpaths if path == lpath), None)
        if remote is None:
            # doesn't exist, create
            toupdate.append(lpath)
        elif remote[1] < lmtime:
            toupdate.append(lpath)

    if todelete:
        for path in todelete:
            print(' X {}'.format(path))
        resp = requests.post('{}/delete'.format(base_url), params={'filenames[]':todelete})
        resp.raise_for_status()

    for path in toupdate:
        _, ext = os.path.splitext(path)
        if ext not in ALLOWED_FILETYPES:
            continue
        print('-> {}'.format(path))
        files = {path: open(path, 'rb')}
        resp = requests.post('{}/upload'.format(base_url), files=files)
        resp.raise_for_status()
