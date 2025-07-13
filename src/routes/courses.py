from flask import Blueprint, request, jsonify, session
from src.models.user import db, Course

courses_bp = Blueprint('courses', __name__)

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

@courses_bp.route('/', methods=['GET'])
def get_courses():
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    try:
        courses = Course.query.all()
        return jsonify([course.to_dict() for course in courses]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/', methods=['POST'])
def add_course():
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

        new_course = Course(
            name=name,
            link=link,
            image_url=image_url
        )

        db.session.add(new_course)
        db.session.commit()

        return jsonify({
            'message': 'Curso añadido exitosamente',
            'course': new_course.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<int:course_id>', methods=['DELETE'])
def delete_course(course_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        course = Course.query.get(course_id)
        if not course:
            return jsonify({'error': 'Curso no encontrado'}), 404

        db.session.delete(course)
        db.session.commit()

        return jsonify({'message': 'Curso eliminado exitosamente'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

