import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { FolderPlus, X, Loader2 } from 'lucide-react'
import { createFolder } from '@/lib/api'
import { z } from 'zod'
import { validateWithZod } from '@/lib/form-utils'

interface CreateFolderModalProps {
  isOpen: boolean
  onClose: () => void
  parentFolderId?: string | null
  parentFolderName?: string
}

interface FolderCreateRequest {
  name: string
  parentId?: string
  description?: string
  isPublic?: boolean
}

const folderSchema = z.object({
  name: z.string()
    .min(1, 'Folder name is required')
    .max(255, 'Folder name must be less than 255 characters')
    .refine(
      (name) => !/[<>:"/\\|?*]/.test(name),
      'Folder name contains invalid characters'
    ),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  isPublic: z.boolean().optional(),
})

export function CreateFolderModal({ 
  isOpen, 
  onClose, 
  parentFolderId, 
  parentFolderName 
}: CreateFolderModalProps) {
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)

  const createFolderMutation = useMutation({
    mutationFn: (folderData: FolderCreateRequest) => createFolder(folderData),
    onSuccess: () => {
      // Invalidate queries to refresh the folder list
      queryClient.invalidateQueries({ queryKey: ['folderContents'] })
      onClose()
    },
    onError: (error: Error) => {
      console.error('Failed to create folder:', error)
    },
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <FolderPlus className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New Folder</h2>
              {parentFolderName && (
                <p className="text-sm text-gray-600 mt-1">
                  In: <span className="font-semibold">{parentFolderName}</span>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isCreating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <Formik
            initialValues={{
              name: '',
              description: '',
              isPublic: false,
            }}
            validate={validateWithZod(folderSchema)}
            onSubmit={async (values, { setSubmitting, setFieldError }) => {
              try {
                setIsCreating(true)
                setSubmitting(true)
                
                await createFolderMutation.mutateAsync({
                  name: values.name.trim(),
                  parentId: parentFolderId || undefined,
                  description: values.description.trim() || undefined,
                  isPublic: values.isPublic,
                })
              } catch (error) {
                if (error instanceof Error) {
                  if (error.message.includes('already exists')) {
                    setFieldError('name', 'A folder with this name already exists')
                  } else {
                    setFieldError('name', error.message)
                  }
                }
              } finally {
                setIsCreating(false)
                setSubmitting(false)
              }
            }}
          >
            {({ isSubmitting, values }) => (
              <Form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Folder Name *
                  </label>
                  <Field
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter folder name..."
                    disabled={isSubmitting}
                  />
                  <ErrorMessage name="name" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <Field
                    as="textarea"
                    id="description"
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter folder description..."
                    disabled={isSubmitting}
                  />
                  <ErrorMessage name="description" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div className="flex items-center">
                  <Field
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                    Make folder public (anyone can view)
                  </label>
                </div>

                {createFolderMutation.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">
                      {createFolderMutation.error.message}
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !values.name.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FolderPlus className="w-4 h-4 mr-2" />
                        Create Folder
                      </>
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}