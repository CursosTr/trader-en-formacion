from flask_sqlalchemy import SQLAlchemy
import bcrypt
import secrets
import string

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    registration_code = db.Column(db.String(20), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<User {self.name}>'

    def set_password(self, password):
        """Hash and set the password"""
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        """Check if the provided password matches the hash"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'registration_code': self.registration_code,
            'is_admin': self.is_admin
        }

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    link = db.Column(db.String(500), nullable=False)
    image_url = db.Column(db.String(500), nullable=True)

    def __repr__(self):
        return f'<Course {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'link': self.link,
            'image_url': self.image_url
        }

class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    link = db.Column(db.String(500), nullable=False)
    image_url = db.Column(db.String(500), nullable=True)

    def __repr__(self):
        return f'<Book {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'link': self.link,
            'image_url': self.image_url
        }

class RegistrationCode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False)
    is_used = db.Column(db.Boolean, default=False)
    created_by_admin = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f'<RegistrationCode {self.code}>'

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'is_used': self.is_used,
            'created_by_admin': self.created_by_admin
        }

    @staticmethod
    def generate_code():
        """Generate a random registration code"""
        return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))

