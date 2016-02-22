import re
import requests
import sys
import threading
import io
import json

from multiprocessing import Pool, freeze_support
from bs4 import BeautifulSoup

lockObj = threading.Lock()
links = []
urlPattern = re.compile(
        "(\[([\d\/]+\s*[\d:]+\s*\w+)\]).*((http|https)://([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?)")


class ParseLink():
    def __init__(self, *data):
        (self.__date, self.__link) = data
        self.__title = ''
        self.__desc = ''
        self.__image = False

    def parse(self):
        try:
            r = requests.get(self.__link, timeout=5)
            r.encoding = 'UTF-8'

            if r.status_code == 200:
                if "text/html" in r.headers['Content-Type']:
                    self.__title, self.__desc = self.__extract_data(r.content)
                elif "image" in r.headers['Content-Type']:
                    self.__image = True
                self.__write_to_file()

        except:
            print "Error %s - %s\n" % (self.__link, sys.exc_info()[0])

    @staticmethod
    def __extract_data(body):
        html = BeautifulSoup(body, "html.parser")
        desc = html.find('meta', attrs={'name': 'description'})
        title = html.title.string.strip(' \t\n\r')
        desc = desc['content'].strip(' \t\n\r') if desc is not None else ''

        return title, desc

    def __write_to_file(self):
        lockObj.acquire()
        with open("../links.json", "a") as jf:
            jf.write(str(self) + ",")
        lockObj.release()

    def __str__(self):
        return json.dumps({"url": self.__link, "date": self.__date, "title": self.__title, "desc": self.__desc, "image": self.__image})


def parseLink(data):
    print "Parse: %s" % data[1]
    ParseLink(*data).parse()


if __name__ == '__main__':
    freeze_support()
    p = Pool()

    f = open("../raw/academia-de-ursarie-20141209.txt", "r")
    for line in f:
        url = urlPattern.search(line)
        if url is not None:
            links.append((url.group(2), url.group(3)))
    f.close()

    jsonFile = open("../links.json", "w+")
    jsonFile.write("[")
    jsonFile.close()

    p.map(parseLink, links)

    jsonFile = open("../links.json", "r+")
    jsonFile.seek(-1, io.SEEK_END)
    jsonFile.write("]")
    jsonFile.close()
