from flask import Blueprint, request, jsonify, session
from src.models.user import db, User, RegistrationCode

admin_bp = Blueprint('admin', __name__)

def require_admin():
    """Decorator to require admin privileges"""
    user_id = session.get('user_id')
    is_admin = session.get('is_admin')
    
    if not user_id or not is_admin:
        return jsonify({'error': 'Acceso denegado. Se requieren privilegios de administrador'}), 403
    
    return None

@admin_bp.route('/users', methods=['GET'])
def get_users():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        users = User.query.all()
        return jsonify([user.to_dict() for user in users]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        if user.is_admin:
            return jsonify({'error': 'No se puede eliminar un usuario administrador'}), 400
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'Usuario eliminado exitosamente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/generate-code', methods=['POST'])
def generate_registration_code():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        admin_id = session.get('user_id')
        code = RegistrationCode.generate_code()
        
        # Ensure code is unique
        while RegistrationCode.query.filter_by(code=code).first():
            code = RegistrationCode.generate_code()
        
        new_code = RegistrationCode(
            code=code,
            created_by_admin=admin_id
        )
        
        db.session.add(new_code)
        db.session.commit()
        
        return jsonify({
            'message': 'Código generado exitosamente',
            'code': code
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/codes', methods=['GET'])
def get_registration_codes():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        codes = RegistrationCode.query.all()
        return jsonify([code.to_dict() for code in codes]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

