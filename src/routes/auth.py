from flask import Blueprint, request, jsonify, session
from src.models.user import db, User, RegistrationCode

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Email y contraseña son requeridos'}), 400

        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password):
            session['user_id'] = user.id
            session['is_admin'] = user.is_admin
            return jsonify({
                'message': 'Inicio de sesión exitoso',
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Credenciales inválidas'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        registration_code = data.get('registration_code')

        if not all([name, email, password, registration_code]):
            return jsonify({'error': 'Todos los campos son requeridos'}), 400

        # Check if email already exists
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'El email ya está registrado'}), 400

        # Check if registration code is valid and not used
        code_obj = RegistrationCode.query.filter_by(code=registration_code, is_used=False).first()
        if not code_obj:
            return jsonify({'error': 'Código de registro inválido o ya utilizado'}), 400

        # Create new user
        new_user = User(
            name=name,
            email=email,
            registration_code=registration_code,
            is_admin=False
        )
        new_user.set_password(password)

        # Mark registration code as used
        code_obj.is_used = True

        db.session.add(new_user)
        db.session.commit()

        return jsonify({'message': 'Usuario registrado exitosamente'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Sesión cerrada exitosamente'}), 200

@auth_bp.route('/check-session', methods=['GET'])
def check_session():
    user_id = session.get('user_id')
    if user_id:
        user = User.query.get(user_id)
        if user:
            return jsonify({
                'logged_in': True,
                'user': user.to_dict()
            }), 200
    
    return jsonify({'logged_in': False}), 200

