import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
    isLoading: boolean;
    message?: string;
}

export default function LoadingOverlay({
    isLoading,
    message = 'Processing...',
}: LoadingOverlayProps) {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-auto">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />

            <div className="relative bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center animate-in fade-in zoom-in duration-200">
                <Loader2 className="text-blue-600 animate-spin mb-4" size={48} />
                <p className="text-lg font-semibold text-gray-900">{message}</p>
                <p className="text-sm text-gray-500 mt-1">Please wait a moment</p>
            </div>
        </div>
    );
}
