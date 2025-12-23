import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'success' | 'info' | 'error';
}

export default function AlertModal({
    isOpen,
    onClose,
    title,
    message,
    type = 'info',
}: AlertModalProps) {
    if (!isOpen) return null;

    const typeConfig = {
        success: {
            icon: <CheckCircle className="text-green-500" size={48} />,
            buttonClass: 'bg-green-600 hover:bg-green-700',
        },
        info: {
            icon: <Info className="text-blue-500" size={48} />,
            buttonClass: 'bg-blue-600 hover:bg-blue-700',
        },
        error: {
            icon: <AlertCircle className="text-red-500" size={48} />,
            buttonClass: 'bg-red-600 hover:bg-red-700',
        },
    };

    const { icon, buttonClass } = typeConfig[type];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8 flex flex-col items-center text-center">
                    <div className="mb-4 bg-gray-50 p-4 rounded-full">
                        {icon}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 mb-8">{message}</p>

                    <button
                        onClick={onClose}
                        className={`w-full py-3 px-4 text-white font-semibold rounded-xl transition-all active:scale-95 shadow-lg shadow-gray-200 ${buttonClass}`}
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
}
