# This file provided by Facebook is for non-commercial testing and evaluation purposes only.
# Facebook reserves all rights not expressly granted.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
# FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
# ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
# WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import os
import json
import cgi
from BaseHTTPServer import HTTPServer
from SimpleHTTPServer import SimpleHTTPRequestHandler

PUBLIC_PATH = "public"

notes_file = open('_notes.json', 'r+')
notes = json.loads(notes_file.read())
notes_file.close()


def sendJSON(res):
    res.send_response(200)
    res.send_header('Content-type', 'application/json')
    res.end_headers()
    res.wfile.write(json.dumps(notes))


class MyHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        root = os.getcwd()
        path = PUBLIC_PATH + path
        return os.path.join(root, path)

    def do_GET(self):
        if self.path == "/notes.json":
            sendJSON(self)
        else:
            SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        form = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={
                'REQUEST_METHOD': 'POST',
                'CONTENT_TYPE': self.headers['Content-Type']
            }
        )

        f = open('_notes.json', 'w+')

        if self.path == "/create":
            # Save the data
            notes.append({u"text": form.getfirst("text")})

        elif self.path == "/delete":
            # get the index to delete and delete it
            index = int(form.getfirst('index'))
            del notes[index]

        elif self.path == "/update":
            # get the index to delete and delete it
            index = int(form.getfirst('index'))
            text = form.getfirst('text')
            notes[index] = dict(text=text)

        else:
            SimpleHTTPRequestHandler.do_POST(self)

        # Write to file
        f.write(json.dumps(notes))
        f.close()
        sendJSON(self)

if __name__ == '__main__':
    print "Server started: http://localhost:3000/"
    httpd = HTTPServer(('127.0.0.1', 3000), MyHandler)
    httpd.serve_forever()
