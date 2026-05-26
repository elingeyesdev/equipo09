import React, { useState, useRef } from 'react';
import { submitKycDocuments } from '../api/entrepreneur.api';
import type { EntrepreneurProfile } from '../types/entrepreneur.types';

interface KYCUploadModalProps {
  onClose: () => void;
  onSuccess: (profile: EntrepreneurProfile) => void;
}

export function KYCUploadModal({ onClose, onSuccess }: KYCUploadModalProps) {
  const [step, setStep] = useState(1);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [faceVideo, setFaceVideo] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const idInputRef = useRef<HTMLInputElement>(null);
  const faceInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!idDocument || !faceVideo) {
      setError('Por favor adjunta ambos documentos requeridos.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const updatedProfile = await submitKycDocuments(idDocument, faceVideo);
      onSuccess(updatedProfile);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al enviar documentos KYC.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Verificación de Identidad (KYC)</h3>
            <p className="text-sm text-gray-500 mt-1">Paso {step} de 2: {step === 1 ? 'Documento de Identidad' : 'Validación Facial'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* ProgressBar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(step / 2) * 100}%` }}
              ></div>
            </div>

            {step === 1 && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <label className="block text-sm font-bold text-gray-700 mb-2">Sube tu Documento Oficial (ID, Pasaporte, Licencia)</label>
                <div 
                  onClick={() => idInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${idDocument ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
                >
                  {idDocument ? (
                    <div className="text-green-600 flex flex-col items-center">
                      <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="font-semibold text-lg">{idDocument.name}</span>
                      <span className="text-sm mt-1 opacity-80">Documento adjuntado correctamente</span>
                    </div>
                  ) : (
                    <div className="text-gray-500 flex flex-col items-center">
                      <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      <span className="text-base font-medium">Haz clic aquí o arrastra tu archivo</span>
                      <span className="text-xs text-gray-400 mt-2">Formatos aceptados: JPG, PNG, PDF (Máx. 10MB)</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={idInputRef} 
                    className="hidden" 
                    accept="image/*,.pdf" 
                    onChange={(e) => {
                      if (e.target.files?.[0]) setIdDocument(e.target.files[0]);
                    }}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <label className="block text-sm font-bold text-gray-700 mb-2">Validación Facial (Selfie sosteniendo el documento)</label>
                <div 
                  onClick={() => faceInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${faceVideo ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
                >
                  {faceVideo ? (
                    <div className="text-green-600 flex flex-col items-center">
                      <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="font-semibold text-lg">{faceVideo.name}</span>
                      <span className="text-sm mt-1 opacity-80">Validación adjuntada correctamente</span>
                    </div>
                  ) : (
                    <div className="text-gray-500 flex flex-col items-center">
                      <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span className="text-base font-medium">Haz clic aquí o arrastra tu archivo</span>
                      <span className="text-xs text-gray-400 mt-2">Asegúrate de que tu rostro y el documento sean legibles</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={faceInputRef} 
                    className="hidden" 
                    accept="image/*,video/*" 
                    onChange={(e) => {
                      if (e.target.files?.[0]) setFaceVideo(e.target.files[0]);
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-gray-100 mt-6">
              <button
                type="button"
                onClick={() => {
                  if (step > 1) {
                    setStep(step - 1);
                  } else {
                    onClose();
                  }
                }}
                className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                disabled={isSubmitting}
              >
                {step > 1 ? 'Atrás' : 'Cancelar'}
              </button>
              
              {step < 2 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  disabled={!idDocument}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all disabled:opacity-50 flex items-center"
                >
                  Siguiente
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!idDocument || !faceVideo || isSubmitting}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </>
                  ) : 'Enviar a Revisión'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
