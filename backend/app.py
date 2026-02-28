from flask import Flask, request, jsonify, send_file
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os
import csv
from io import StringIO
from datetime import timedelta

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///rainfall.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Change this in production!
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'admin' or 'user'

class RainfallData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.Integer, nullable=False)
    amount = db.Column(db.Float, nullable=False)

with app.app_context():
    db.create_all()

# Register
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'user').lower()

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400

    hashed_pw = generate_password_hash(password)
    new_user = User(username=username, password=hashed_pw, role=role)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

# Login
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = create_access_token(identity={'id': user.id, 'role': user.role})
    return jsonify({'token': token, 'role': user.role}), 200

# Get Analytics
@app.route('/analytics', methods=['GET'])
@jwt_required()
def analytics():
    data = RainfallData.query.all()
    if not data:
        return jsonify({'total': 0, 'average': 0, 'highest': 0, 'lowest': 0})

    amounts = [d.amount for d in data]
    total = sum(amounts)
    average = total / len(amounts)
    highest = max(amounts)
    lowest = min(amounts)
    return jsonify({'total': total, 'average': average, 'highest': highest, 'lowest': lowest})

# Get Data (for table and charts)
@app.route('/data', methods=['GET'])
@jwt_required()
def get_data():
    data = RainfallData.query.all()
    return jsonify([{'id': d.id, 'year': d.year, 'amount': d.amount} for d in data])

# Add Data
@app.route('/data', methods=['POST'])
@jwt_required()
def add_data():
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    data = request.json
    year = data.get('year')
    amount = data.get('amount')

    if RainfallData.query.filter_by(year=year).first():
        return jsonify({'error': 'Year already exists'}), 400

    new_data = RainfallData(year=year, amount=amount)
    db.session.add(new_data)
    db.session.commit()
    return jsonify({'message': 'Data added'}), 201

# Edit Data
@app.route('/data/<int:id>', methods=['PUT'])
@jwt_required()
def edit_data(id):
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    data = request.json
    entry = RainfallData.query.get(id)
    if not entry:
        return jsonify({'error': 'Data not found'}), 404

    entry.year = data.get('year', entry.year)
    entry.amount = data.get('amount', entry.amount)
    db.session.commit()
    return jsonify({'message': 'Data updated'})

# Delete Data
@app.route('/data/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_data(id):
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    entry = RainfallData.query.get(id)
    if not entry:
        return jsonify({'error': 'Data not found'}), 404

    db.session.delete(entry)
    db.session.commit()
    return jsonify({'message': 'Data deleted'})

# Export CSV
@app.route('/export', methods=['GET'])
@jwt_required()
def export_csv():
    data = RainfallData.query.all()
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['Year', 'Amount'])
    for d in data:
        writer.writerow([d.year, d.amount])
    output.seek(0)
    return send_file(output, mimetype='text/csv', as_attachment=True, download_name='rainfall_data.csv')

if __name__ == '__main__':
    app.run(debug=True)
