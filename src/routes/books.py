from flask import Blueprint, request, jsonify, session
from src.models.user import db, Book

books_bp = Blueprint('books', __name__)

def require_auth():
    """Check if user is authenticated"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Acceso denegado. Debe iniciar sesión'}), 401
    return None

def require_admin():
    """Check if user is admin"""
    user_id = session.get('user_id')
    is_admin = session.get('is_admin')
    
    if not user_id or not is_admin:
        return jsonify({'error': 'Acceso denegado. Se requieren privilegios de administrador'}), 403
    return None

@books_bp.route('/', methods=['GET'])
def get_books():
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    try:
        books = Book.query.all()
        return jsonify([book.to_dict() for book in books]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@books_bp.route('/', methods=['POST'])
def add_book():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        data = request.get_json()
        name = data.get('name')
        link = data.get('link')
        image_url = data.get('image_url', '')

        if not name or not link:
            return jsonify({'error': 'Nombre y enlace son requeridos'}), 400

        new_book = Book(
            name=name,
            link=link,
            image_url=image_url
        )

        db.session.add(new_book)
        db.session.commit()

        return jsonify({
            'message': 'Libro añadido exitosamente',
            'book': new_book.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@books_bp.route('/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        book = Book.query.get(book_id)
        if not book:
            return jsonify({'error': 'Libro no encontrado'}), 404

        db.session.delete(book)
        db.session.commit()

        return jsonify({'message': 'Libro eliminado exitosamente'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

