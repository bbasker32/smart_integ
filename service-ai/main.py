from flask import Flask
from flask_cors import CORS
from routes.description_routes import description_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(description_bp)

if __name__ == "__main__":
    app.run(port=5001, debug=True)