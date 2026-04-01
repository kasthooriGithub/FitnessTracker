import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Activity,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        toast({
          title: "Welcome to FitTrack!",
          description: "Your account has been created successfully.",
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0 min-vh-100 d-flex flex-column flex-lg-row">
      {/* Left side - Branding */}
      <div
        className={`flex-lg-grow-1 p-4 p-lg-5 d-flex flex-column justify-content-center position-relative overflow-hidden text-white ${
          !showLanding ? "d-none d-lg-flex" : "d-flex"
        }`}
        style={{
          background:
            "linear-gradient(135deg, rgb(19, 76, 156) 0%, rgb(8, 40, 95) 100%)",
          flexShrink: 0,
          minHeight: "100vh",
        }}
      >
        <div
          className="position-absolute top-0 start-0 end-0 bottom-0 opacity-25"
          style={{
            background:
              "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2), transparent 50%)",
          }}
        />
        <div className="position-relative z-1 max-w-lg mx-auto mx-lg-0 ms-lg-5 text-center text-lg-start">
          <div className="d-flex align-items-center justify-content-center justify-content-lg-start gap-3 mb-3 mb-lg-4">
            <div className="d-flex h-12 w-12 align-items-center justify-content-center rounded-4 bg-white bg-opacity-20 blur-sm">
              <Activity className="h-6 w-6 text-dark" />
            </div>

            <span className="fs-2 fw-bold mb-0">FitTrack</span>
          </div>
          <h1 className="fs-1 fw-bold mb-3 mb-lg-4">
            Your Personal
            <br className="d-none d-lg-block" /> Fitness Journey
            <br className="d-none d-lg-block" /> Starts Here
          </h1>
          <p className="lead opacity-75 max-w-md mx-auto mx-lg-0 fs-6">
            Track workouts, monitor progress, and achieve your health goals with
            our intuitive fitness companion.
          </p>

          <div className="d-lg-none mt-5">
            <button
              onClick={() => setShowLanding(false)}
              className="btn btn-light btn-lg rounded-pill px-4 py-3 fw-bold d-flex align-items-center gap-2 mx-auto shadow-sm"
              style={{ color: "rgb(8, 40, 95)" }}
            >
              Continue <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div
        className={`flex-lg-grow-1 d-flex flex-column align-items-center justify-content-center p-4 p-lg-5 bg-white ${
          showLanding ? "d-none d-lg-flex" : "d-flex"
        }`}
      >
        <div className="d-lg-none w-100 max-w-md mb-4">
          <button
            onClick={() => setShowLanding(true)}
            className="btn btn-link text-decoration-none text-muted d-flex align-items-center gap-2 p-0 mb-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
        <div
          className="card border-0 shadow-lg p-3 rounded-4 w-100"
          style={{ maxWidth: "450px" }}
        >
          <div className="card-body">
            <h2 className="h3 fw-bold mb-1">
              {isLogin ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-muted mb-4 small">
              {isLogin
                ? "Enter your credentials to access your dashboard"
                : "Start your fitness journey today"}
            </p>

            <form
              onSubmit={handleSubmit}
              className="d-flex flex-column gap-3"
              key={isLogin}
            >
              {!isLogin && (
                <div className="form-group">
                  <label className="form-label small fw-bold">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 rounded-start-3 p-3">
                      <User className="h-5 w-5 text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light border-start-0 py-3 rounded-end-3"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label small fw-bold">Email</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 rounded-start-3 p-3">
                    <Mail className="h-5 w-5 text-muted" />
                  </span>
                  <input
                    type="email"
                    className="form-control bg-light border-start-0 py-3 rounded-end-3"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label small fw-bold">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 rounded-start-3 p-3">
                    <Lock className="h-5 w-5 text-muted" />
                  </span>

                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control bg-light border-start-0 border-end-0 py-3"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />

                  <button
                    type="button"
                    className="input-group-text bg-light border-start-0 rounded-end-3 p-3"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-muted" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted" />
                    )}
                  </button>
                </div>
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-link btn-sm text-decoration-none text-muted p-0"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg mt-3 py-3 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? "Sign In" : "Create Account"}</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setShowPassword(false);
                }}
                className="btn btn-link btn-sm text-decoration-none text-muted"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}