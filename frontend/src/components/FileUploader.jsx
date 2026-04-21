import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { statementService } from '../services/api';

export function FileUploader({ onUpload }) {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const removeFile = () => setFile(null);

    const [isLoading, setIsLoading] = useState(false);

    const handleProcess = async () => {
        if (file) {
            setIsLoading(true);
            try {
                const response = await statementService.upload(file);
                if (response.success) {
                    // Extracting the correct URL and transactions from nested response
                    onUpload(file, response.file.fileUrl, response.transactions, response.openingBalance, response.closingBalance);
                }
                else {
                    alert('Upload failed: ' + response.message);
                }
            } catch (error) {
                console.error('Upload error:', error);
                alert('Connection to backend failed. Using mock URL for now.');
                onUpload(file, URL.createObjectURL(file));
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto py-12 px-4">
            <AnimatePresence mode="wait">
                {!file ? (
                    <motion.div
                        key="uploader"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <Card
                            className={`relative border-2 border-dashed transition-all cursor-pointer ${dragActive ? "border-brand-secondary bg-blue-50/50" : "border-slate-300 hover:border-brand-secondary/50"
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-upload').click()}
                        >
                            <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
                                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                                    <Upload className="w-8 h-8 text-brand-secondary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Upload Financial Statement</h3>
                                <p className="text-slate-500 mb-6 max-w-sm">
                                    Drag and drop your PDF statement here, or click to browse files from your computer.
                                </p>
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    accept=".pdf"
                                    onChange={handleChange}
                                />
                                <Button variant="primary">Select PDF File</Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card className="border-brand-secondary bg-white">
                            <CardContent className="p-4 md:p-8">
                                <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                                        <FileText className="w-8 h-8 text-brand-secondary" />
                                    </div>
                                    <div className="flex-1 text-center md:text-left min-w-0 w-full">
                                        <h4 className="font-semibold text-lg truncate w-full">{file.name}</h4>
                                        <p className="text-slate-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                                        <Button variant="ghost" size="sm" onClick={removeFile} className="w-full sm:w-auto" disabled={isLoading}>
                                            <X className="w-4 h-4 mr-2" /> Cancel
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={handleProcess}
                                            className="w-full sm:w-auto"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
                                                </>
                                            ) : (
                                                "Process Statement"
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-slate-100 flex items-start gap-4 text-emerald-600 bg-emerald-50/50 p-4 rounded-xl">
                                    <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                                    <p className="text-sm">
                                        File ready for processing. Our AI engine will extract structured transaction data, allowing you to edit values and recalculate balances in the next step.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
