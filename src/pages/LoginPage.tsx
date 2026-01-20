import { useState } from 'react';
import { Lock, User, LogIn } from 'lucide-react';
import Button from '../components/ui/Button';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const userData = await api.login(username, password);
            login(userData);
        } catch (err: any) {
            setError(err.message || 'Invalid username or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-blue-600 p-8 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-2xl font-bold">Accounting System</h1>
                    <p className="text-blue-100 mt-1">Please sign in to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" variant="primary" className="w-full py-3" disabled={isLoading}>
                        <LogIn size={18} className="mr-2" />
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>

                    <div className="text-center">
                        <p className="text-xs text-gray-400">
                            Authorized access only. Audit logs are being recorded.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
