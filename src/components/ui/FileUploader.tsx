import { useCallback, useState } from 'react';
import { Upload, File as FileIcon, X } from 'lucide-react';
import { useAlert } from '../../context/AlertContext';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
}

export default function FileUploader({
  onFileSelect,
  accept = '.pdf,.csv',
  maxSize = 10 * 1024 * 1024,
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { showAlert } = useAlert();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.size <= maxSize) {
          setSelectedFile(file);
          onFileSelect(file);
        } else {
          showAlert(`File size must be less than ${maxSize / 1024 / 1024}MB`, 'File Too Large', 'error');
        }
      }
    },
    [onFileSelect, maxSize]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.size <= maxSize) {
          setSelectedFile(file);
          onFileSelect(file);
        } else {
          showAlert(`File size must be less than ${maxSize / 1024 / 1024}MB`, 'File Too Large', 'error');
        }
      }
    },
    [onFileSelect, maxSize]
  );

  const clearFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-300 hover:border-gray-400'
        }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept={accept}
        onChange={handleChange}
      />

      {selectedFile ? (
        <div className="flex items-center justify-center gap-4">
          <FileIcon size={32} className="text-blue-600" />
          <div className="text-left">
            <p className="font-medium text-gray-800">{selectedFile.name}</p>
            <p className="text-sm text-gray-500">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
          <button
            onClick={clearFile}
            className="ml-4 p-2 text-gray-400 hover:text-red-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <>
          <Upload size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drop your file here or{' '}
            <label
              htmlFor="file-upload"
              className="text-blue-600 hover:text-blue-700 cursor-pointer underline"
            >
              browse
            </label>
          </p>
          <p className="text-sm text-gray-500">
            Supports: {accept} (Max {maxSize / 1024 / 1024}MB)
          </p>
        </>
      )}
    </div>
  );
}
