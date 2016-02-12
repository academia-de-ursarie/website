import re
import requests
import sys
import json

from multiprocessing import Pool, freeze_support
from BeautifulSoup import BeautifulSoup

links = []
urlPattern = re.compile("(http://|https://)(\S+)")

def parseLink(link):
    try:
        r = requests.get(link)
        r.encoding = 'UTF-8'
        title = ''
        desc = ''

        if r.status_code == 200:
            if r.headers['Content-Type'] is 'text/html':
                html = BeautifulSoup(r.content)
                desc = html.find('meta', attrs={'name': 'description'})
                title = html.title.string
                desc = ["" if desc is None else desc['content']]

        return {
                'url': link,
                'title': title,
                'desc': desc
            }
    except:
        print "Error %s - %s\n" % (link, sys.exc_info()[0])
        return None


if __name__ == '__main__':
    freeze_support()
    p = Pool()

    f = open("../Version-1/academia-de-ursarie-version-1.txt", "r")
    for line in f:
        url = urlPattern.search(line)
        if url is not None:
            links.append(url.group(0))
    f.close()

    jsonData = p.map(parseLink, links)

    f = open("../links.json", "w+")
    f.write(json.dumps(jsonData))
    f.close()
