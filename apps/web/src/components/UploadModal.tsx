import { useState, useRef, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { toast } from 'react-toastify'
import { 
  Upload, 
  FileText, 
  Image, 
  FileArchive, 
  AlertCircle, 
  CheckCircle, 
  X, 
  File as FileIcon,
  Loader2
} from 'lucide-react'
import { uploadFile } from '@/lib/api'
import { fileUploadSchema, validateFileType, validateFileSize, type FileUploadFormData } from '@dataroom/models'
import { validateWithZod } from '@/lib/form-utils'
import type { FileUpload } from '@dataroom/types'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  currentFolderId?: string | null
  currentFolderName?: string
}

interface FileWithPreview extends File {
  id: string
  preview?: string
}

export function UploadModal({ isOpen, onClose, currentFolderId, currentFolderName }: UploadModalProps) {
  const queryClient = useQueryClient()
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([])
  const [failedUploads, setFailedUploads] = useState<{ [key: string]: string }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadMutation = useMutation({
    mutationFn: async ({ file, options }: { file: File; options: FileUploadFormData }) => {
      return uploadFile(file, {
        description: options.description,
        tags: options.tags,
        isPublic: options.isPublic,
      }, currentFolderId)
    },
    onSuccess: (data, variables) => {
      setUploadedFiles(prev => [...prev, data.file])
      setUploadProgress(prev => ({ ...prev, [variables.file.name]: 100 }))
      // Invalidate queries to refresh the file list
      queryClient.invalidateQueries({ queryKey: ['folderContents'] })
      queryClient.invalidateQueries({ queryKey: ['userFiles'] })
    },
    onError: (error: Error, variables) => {
      setFailedUploads(prev => ({ ...prev, [variables.file.name]: error.message }))
    },
  })

  const handleFileSelect = useCallback((event: { target: { files: FileList | null } }) => {
    const files = Array.from(event.target.files || [])
    const validFiles: FileWithPreview[] = []
    
    files.forEach((file) => {
      try {
        // Validate file type and size
        try {
          validateFileType(file)
        } catch (error) {
          toast.error(`Invalid file type: ${file.name}. Please select a supported file type.`)
          return
        }
        
        try {
          validateFileSize(file)
        } catch (error) {
          toast.error(`File too large: ${file.name}. Maximum size is 10MB.`)
          return
        }

        // Create file with preview
        const fileWithPreview: FileWithPreview = Object.assign(file, {
          id: `${file.name}-${Date.now()}`,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
        })
        
        validFiles.push(fileWithPreview)
      } catch (error) {
        console.error('File validation error:', error)
        toast.error(`Error processing file: ${file.name}`)
      }
    })
    
    setSelectedFiles(prev => [...prev, ...validFiles])
  }, [])

  const handleRemoveFile = (fileId: string) => {
    setSelectedFiles(prev => {
      const file = prev.find(f => f.id === fileId)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
    // Clear any progress or error states
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[fileId]
      return newProgress
    })
    setFailedUploads(prev => {
      const newFailed = { ...prev }
      delete newFailed[fileId]
      return newFailed
    })
  }

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    handleFileSelect({ target: { files: files as any } })
  }, [handleFileSelect])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
  }, [])

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5" />
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5" />
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <FileArchive className="w-5 h-5" />
    return <FileIcon className="w-5 h-5" />
  }

  const handleClose = () => {
    // Clean up object URLs
    selectedFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
    setSelectedFiles([])
    setUploadProgress({})
    setUploadedFiles([])
    setFailedUploads({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload Files</h2>
            {currentFolderName && (
              <p className="text-sm text-gray-600 mt-1">
                Uploading to: <span className="font-semibold">{currentFolderName}</span>
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* File Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports images, documents, and archives up to 10MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Files
            </button>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Selected Files ({selectedFiles.length})</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedFiles.map((file) => (
                  <div key={file.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center flex-1 min-w-0">
                      {file.preview ? (
                        <img 
                          src={file.preview} 
                          alt={file.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          {getFileIcon(file.type)}
                        </div>
                      )}
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    
                    {/* Upload Progress */}
                    {uploadProgress[file.name] !== undefined && (
                      <div className="flex items-center mr-3">
                        {uploadProgress[file.name] === 100 ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <div className="flex items-center">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            <span className="text-xs text-gray-600">
                              {uploadProgress[file.name]}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Error State */}
                    {failedUploads[file.name] && (
                      <div className="flex items-center mr-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      disabled={uploadMutation.isPending}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Form */}
          {selectedFiles.length > 0 && (
            <Formik
              initialValues={{
                description: '',
                tags: '',
                isPublic: false,
              }}
              validate={validateWithZod(fileUploadSchema)}
              onSubmit={async (values, { setSubmitting }) => {
                const uploadPromises = selectedFiles.map(async (file) => {
                  try {
                    setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
                    
                    // Simulate progress updates
                    const progressInterval = setInterval(() => {
                      setUploadProgress(prev => {
                        const current = prev[file.name] || 0
                        if (current < 90) {
                          return { ...prev, [file.name]: current + 10 }
                        }
                        clearInterval(progressInterval)
                        return prev
                      })
                    }, 200)

                    await uploadMutation.mutateAsync({ 
                      file, 
                      options: {
                        ...values,
                        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()).join(',') : ''
                      }
                    })
                  } catch (error) {
                    console.error(`Failed to upload ${file.name}:`, error)
                  }
                })

                await Promise.allSettled(uploadPromises)
                setSubmitting(false)
              }}
            >
              {({ isSubmitting }) => (
                <Form className="mt-6 space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3">Upload Options</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                          Description (optional)
                        </label>
                        <Field
                          as="textarea"
                          id="description"
                          name="description"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add a description for these files..."
                        />
                        <ErrorMessage name="description" component="div" className="text-red-600 text-xs mt-1" />
                      </div>

                      <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                          Tags (optional)
                        </label>
                        <Field
                          type="text"
                          id="tags"
                          name="tags"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter tags separated by commas"
                        />
                        <ErrorMessage name="tags" component="div" className="text-red-600 text-xs mt-1" />
                      </div>

                      <div className="flex items-center">
                        <Field
                          type="checkbox"
                          id="isPublic"
                          name="isPublic"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                          Make files public (anyone can view)
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || selectedFiles.length === 0}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Files
                        </>
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}

          {/* Upload Results */}
          {(uploadedFiles.length > 0 || Object.keys(failedUploads).length > 0) && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Upload Results</h4>
              
              {uploadedFiles.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-green-600 font-medium mb-2">
                    ✓ Successfully uploaded {uploadedFiles.length} files
                  </p>
                </div>
              )}

              {Object.keys(failedUploads).length > 0 && (
                <div>
                  <p className="text-sm text-red-600 font-medium mb-2">
                    ✗ Failed to upload {Object.keys(failedUploads).length} files:
                  </p>
                  {Object.entries(failedUploads).map(([fileName, error]) => (
                    <p key={fileName} className="text-xs text-red-500 ml-4">
                      {fileName}: {error}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}