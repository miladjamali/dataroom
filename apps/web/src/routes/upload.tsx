import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useCallback, useState, useRef } from 'react'
import { toast } from 'react-toastify'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { Upload, FileText, Image, FileArchive, AlertCircle, CheckCircle, X } from 'lucide-react'
import { uploadFile } from '@/lib/api'
import { fileUploadSchema, validateFileType, validateFileSize, type FileUploadFormData } from '@dataroom/models'
import { validateWithZod } from '@/lib/form-utils'
import { useAuth } from '@/lib/auth-context'

export const Route = createFileRoute('/upload')({
  component: UploadComponent,
})

function UploadComponent() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate({ to: '/login' })
    return null
  }

  const uploadMutation = useMutation({
    mutationFn: async ({ file, options }: { file: File; options: FileUploadFormData }) => {
      return uploadFile(file, {
        description: options.description,
        tags: options.tags,
        isPublic: options.isPublic,
      })
    },
    onSuccess: () => {
      // Success handled per file
    },
    onError: (error: Error) => {
      console.error('Upload error:', error.message)
    },
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((event: { target: { files: FileList | null } }) => {
    const files = Array.from(event.target.files || [])
    const validFiles: File[] = []
    
    files.forEach((file) => {
      try {
        validateFileType(file)
        validateFileSize(file)
        validFiles.push(file)
      } catch (error) {
        toast.error(`Error with file "${file.name}": ${(error as Error).message}`)
      }
    })
    
    setSelectedFiles((prev) => [...prev, ...validFiles])
  }, [])

  const removeFile = (index: number) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index))
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-6 h-6 text-blue-500" />
    } else if (file.type === 'application/pdf') {
      return <FileText className="w-6 h-6 text-red-500" />
    } else if (file.type.includes('zip') || file.type.includes('archive')) {
      return <FileArchive className="w-6 h-6 text-yellow-500" />
    }
    return <FileText className="w-6 h-6 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleUpload = async (values: FileUploadFormData) => {
    if (selectedFiles.length === 0) {
      toast.warning('Please select at least one file to upload')
      return
    }

    let successCount = 0
    let errorCount = 0

    for (const file of selectedFiles) {
      try {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }))
        
        await uploadMutation.mutateAsync({ file, options: values })
        
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }))
        successCount++
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
        setUploadProgress((prev) => ({ ...prev, [file.name]: -1 }))
        errorCount++
      }
    }

    // Show results
    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} file(s)`)
    }
    if (errorCount > 0) {
      toast.error(`Failed to upload ${errorCount} file(s)`)
    }

    // Clear files after upload
    if (successCount > 0) {
      setSelectedFiles([])
      setUploadProgress({})
    }
  }

  const initialValues: FileUploadFormData = {
    description: '',
    tags: '',
    isPublic: false,
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Upload Files</h1>
            <p className="mt-2 text-sm text-gray-600">
              Upload files to Vercel Blob storage. Supported formats: Images, PDFs, Documents, and Archives (max 10MB each)
            </p>
          </div>

          <div className="p-6">
            {/* File Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
              />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div>
                <p className="text-lg text-gray-600 mb-2">
                  Click to select files
                </p>
                <p className="text-sm text-gray-500">
                  Maximum file size: 10MB per file
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supported: Images, PDFs, Documents, Archives
                </p>
              </div>
            </div>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Selected Files ({selectedFiles.length})
                </h3>
                <div className="space-y-3">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {uploadProgress[file.name] === 100 && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {uploadProgress[file.name] === -1 && (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                          disabled={uploadMutation.isPending}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Form */}
            <Formik
              initialValues={initialValues}
              validate={validateWithZod(fileUploadSchema)}
              onSubmit={handleUpload}
              enableReinitialize
            >
              {({ errors, touched }) => (
                <Form className="mt-8 space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description (Optional)
                      </label>
                      <Field
                        as="textarea"
                        id="description"
                        name="description"
                        rows={3}
                        className={`mt-1 block w-full border ${
                          errors.description && touched.description
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                        } rounded-md shadow-sm sm:text-sm`}
                        placeholder="Enter a description for your files..."
                      />
                      <ErrorMessage
                        name="description"
                        component="p"
                        className="mt-1 text-sm text-red-600"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                        Tags (Optional)
                      </label>
                      <Field
                        id="tags"
                        name="tags"
                        type="text"
                        className={`mt-1 block w-full border ${
                          errors.tags && touched.tags
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                        } rounded-md shadow-sm sm:text-sm`}
                        placeholder="work, project, document (comma-separated)"
                      />
                      <ErrorMessage
                        name="tags"
                        component="p"
                        className="mt-1 text-sm text-red-600"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Separate tags with commas. Maximum 10 tags.
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <div className="flex items-center">
                        <Field
                          id="isPublic"
                          name="isPublic"
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                          Make files publicly accessible
                        </label>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Public files can be accessed by anyone with the link
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => navigate({ to: '/files' })}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View My Files
                    </button>
                    
                    <button
                      type="submit"
                      disabled={uploadMutation.isPending || selectedFiles.length === 0}
                      className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                        uploadMutation.isPending || selectedFiles.length === 0
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      }`}
                    >
                      {uploadMutation.isPending ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading...
                        </>
                      ) : (
                        `Upload ${selectedFiles.length} File${selectedFiles.length === 1 ? '' : 's'}`
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  )
}
