import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase-config';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      onLogin(user);
    } catch (err) {
      setError('Email o contraseña incorrectos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <div className="card-header bg-white border-0 text-center pt-4 pb-0">
                <div className="mb-3">
                  <div className="bg-primary bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center" 
                       style={{ width: '70px', height: '70px' }}>
                    <i className="fas fa-building text-white" style={{ fontSize: '32px' }}></i>
                  </div>
                </div>
                <h3 className="fw-bold text-primary mb-1">CRM Constructora</h3>
                <p className="text-muted">Sistema de Gestión</p>
              </div>

              <div className="card-body p-4 p-lg-5 pt-0">
                <h5 className="text-center mb-4 fw-semibold">Iniciar Sesión</h5>
                
                {error && (
                  <div className="alert alert-danger border-0 rounded-3 py-2" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>{error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-secondary">
                      <i className="fas fa-envelope me-2"></i>Email
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg rounded-3 border-0 bg-light"
                      style={{ padding: '12px' }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="agente@crm.com"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-secondary">
                      <i className="fas fa-lock me-2"></i>Contraseña
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg rounded-3 border-0 bg-light"
                      style={{ padding: '12px' }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg w-100 rounded-3 fw-semibold"
                    style={{ padding: '12px', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', border: 'none' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Ingresando...
                      </>
                    ) : (
                      'Ingresar'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;