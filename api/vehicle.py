from http.server import BaseHTTPRequestHandler
import json
import urllib.request
import urllib.parse

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Parse query parameters
        from urllib.parse import urlparse, parse_qs
        query = parse_qs(urlparse(self.path).query)
        vehicle = query.get('vehicle', [None])[0]

        if not vehicle:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Missing vehicle parameter'}).encode())
            return

        original_url = f"https://vercel-vehicle.vercel.app/api?vehicle={urllib.parse.quote(vehicle)}"

        try:
            with urllib.request.urlopen(original_url) as response:
                data = json.loads(response.read().decode())

            # Modify credit field
            if 'credit' in data:
                data['credit'] = "@Akashishare"
            if 'developer' in data:
                data['developer'] = "@Akashishare"

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(data).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
        return
