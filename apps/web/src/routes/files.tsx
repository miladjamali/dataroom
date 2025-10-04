import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import { Button, Card, CardContent, Input, Badge } from "@dataroom/ui";
import {
  File,
  Image,
  FileText,
  FileArchive,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Tag,
  Search,
  Filter,
  RefreshCw,
  Folder,
  FolderOpen,
  FolderPlus,
  Upload,
  ChevronRight,
  Home,
  MoreVertical,
  Edit,
} from "lucide-react";
import {
  deleteFile,
  formatFileSize,
  getFolderContents,
  deleteFolder,
  renameFolder,
  moveFile,
  moveFolder,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { UploadModal } from "@/components/UploadModal";
import { CreateFolderModal } from "@/components/CreateFolderModal";

interface FilesSearch {
  folderId?: string;
}

export const Route = createFileRoute("/files")({
  component: FilesPage,
  validateSearch: (search: Record<string, unknown>): FilesSearch => {
    return {
      folderId:
        typeof search.folderId === "string" ? search.folderId : undefined,
    };
  },
});

function FilesPage() {
  const { user, isAuthenticated } = useAuth();

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const search = Route.useSearch();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  // const [sortBy, setSortBy] = useState<"name" | "modified" | "size">("modified");
  // const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  // const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  // const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  // const [showFilters, setShowFilters] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [draggedItem, setDraggedItem] = useState<{
    id: string;
    type: "file" | "folder";
  } | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate({ to: "/login" });
    return null;
  }
  const currentFolderId = search.folderId;

  // Use folder contents or root files
  const {
    data: folderData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: currentFolderId
      ? ["folder-contents", currentFolderId]
      : ["folder-contents", "root"],
    queryFn: () => getFolderContents(currentFolderId),
    enabled: !!user,
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: currentFolderId
          ? ["folder-contents", currentFolderId]
          : ["folder-contents", "root"],
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete file: ${error.message}`);
    },
  });

  // Delete folder mutation
  const deleteFolderMutation = useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: currentFolderId
          ? ["folder-contents", currentFolderId]
          : ["folder-contents", "root"],
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete folder: ${error.message}`);
    },
  });

  // Rename folder mutation
  const renameFolderMutation = useMutation({
    mutationFn: ({
      folderId,
      newName,
    }: {
      folderId: string;
      newName: string;
    }) => renameFolder(folderId, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: currentFolderId
          ? ["folder-contents", currentFolderId]
          : ["folder-contents", "root"],
      });
      setEditingFolder(null);
      toast.success("Folder renamed successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to rename folder: ${error.message}`);
    },
  });

  // Move file mutation
  const moveFileMutation = useMutation({
    mutationFn: ({
      fileId,
      folderId,
    }: {
      fileId: string;
      folderId?: string | null;
    }) => moveFile(fileId, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: currentFolderId
          ? ["folder-contents", currentFolderId]
          : ["folder-contents", "root"],
      });
      toast.success("File moved successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to move file: ${error.message}`);
    },
  });

  // Move folder mutation
  const moveFolderMutation = useMutation({
    mutationFn: ({
      folderId,
      parentId,
    }: {
      folderId: string;
      parentId?: string | null;
    }) => moveFolder(folderId, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: currentFolderId
          ? ["folder-contents", currentFolderId]
          : ["folder-contents", "root"],
      });
      toast.success("Folder moved successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to move folder: ${error.message}`);
    },
  });

  // Unused selection handlers - commented out for now
  // const handleFileSelect = (fileId: string) => {
  //   const newSelected = new Set(selectedFiles);
  //   if (newSelected.has(fileId)) {
  //     newSelected.delete(fileId);
  //   } else {
  //     newSelected.add(fileId);
  //   }
  //   setSelectedFiles(newSelected);
  // };

  // const handleFolderSelect = (folderId: string) => {
  //   const newSelected = new Set(selectedFolders);
  //   if (newSelected.has(folderId)) {
  //     newSelected.delete(folderId);
  //   } else {
  //     newSelected.add(folderId);
  //   }
  //   setSelectedFolders(newSelected);
  // };

  const handleDeleteFile = async (fileId: string, filename: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${filename}"? This action cannot be undone.`
      )
    ) {
      toast.promise(deleteFileMutation.mutateAsync(fileId), {
        pending: "Deleting file...",
        success: `"${filename}" deleted successfully!`,
        error: "Failed to delete file",
      });
    }
  };

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete folder "${folderName}"? This will delete all files and subfolders within it. This action cannot be undone.`
      )
    ) {
      toast.promise(deleteFolderMutation.mutateAsync(folderId), {
        pending: "Deleting folder...",
        success: `Folder "${folderName}" deleted successfully!`,
        error: "Failed to delete folder",
      });
    }
  };

  const handleFolderDoubleClick = (folderId: string) => {
    navigate({
      to: "/files",
      search: { folderId },
    });
  };

  const handleBreadcrumbClick = (folderId?: string) => {
    if (folderId) {
      navigate({
        to: "/files",
        search: { folderId },
      });
    } else {
      navigate({
        to: "/files",
        search: {},
      });
    }
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    if (newName.trim() && newName !== editingFolder?.name) {
      renameFolderMutation.mutate({ folderId, newName: newName.trim() });
    } else {
      setEditingFolder(null);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (
    e: React.DragEvent,
    itemId: string,
    itemType: "file" | "folder"
  ) => {
    setDraggedItem({ id: itemId, type: itemType });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ id: itemId, type: itemType })
    );
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverFolder(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    setDragOverFolder(folderId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear drag over if we're leaving the folder entirely
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setDragOverFolder(null);
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    const dragData = e.dataTransfer.getData("text/plain");

    let draggedItemData;
    try {
      draggedItemData = JSON.parse(dragData);
    } catch {
      return; // Invalid drag data
    }

    if (!draggedItem || draggedItemData.id !== draggedItem.id) {
      return; // Safety check
    }

    // Prevent dropping folder into itself
    if (draggedItem.type === "folder" && draggedItem.id === targetFolderId) {
      setDraggedItem(null);
      setDragOverFolder(null);
      return;
    }

    if (draggedItem.type === "file") {
      moveFileMutation.mutate({
        fileId: draggedItem.id,
        folderId: targetFolderId === "root" ? null : targetFolderId,
      });
    } else if (draggedItem.type === "folder") {
      moveFolderMutation.mutate({
        folderId: draggedItem.id,
        parentId: targetFolderId === "root" ? null : targetFolderId,
      });
    }

    setDraggedItem(null);
    setDragOverFolder(null);
  };

  const handleDownload = (blobUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <Image className="w-5 h-5 text-blue-500" />;
    } else if (mimeType === "application/pdf") {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else if (mimeType.includes("zip") || mimeType.includes("archive")) {
      return <FileArchive className="w-5 h-5 text-yellow-500" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  // Filter files and folders based on search and filter criteria
  const filteredFiles =
    folderData?.files.filter((file: any) => {
      const matchesSearch =
        file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (file.description &&
          file.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (file?.tags &&
          (Array.isArray(file.tags) ? file.tags : JSON.parse(file.tags || "[]"))
            .map((tag: string) => tag.toLowerCase())
            .includes(searchTerm.toLowerCase()));

      const matchesFilter =
        filterType === "all" ||
        (filterType === "public" && file.isPublic) ||
        (filterType === "private" && !file.isPublic);

      return matchesSearch && matchesFilter;
    }) || [];

  const filteredFolders =
    folderData?.folders.filter((folder: any) => {
      return folder.name.toLowerCase().includes(searchTerm.toLowerCase());
    }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading folder contents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Error Loading Folder
            </h2>
            <p className="text-red-600 mb-4">{(error as Error).message}</p>
            <Button onClick={() => refetch()} variant="destructive">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          {/* Header with breadcrumbs */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                {/* Breadcrumbs */}
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  <Button
                    onClick={() => handleBreadcrumbClick()}
                    variant="ghost"
                    size="sm"
                    className="flex items-center hover:text-gray-700 transition-colors"
                  >
                    <Home className="w-4 h-4 mr-1" />
                    My Files
                  </Button>
                  {folderData?.breadcrumbs?.map((crumb: any) => (
                    <div key={crumb.id} className="flex items-center">
                      <ChevronRight className="w-4 h-4 mx-1" />
                      <Button
                        onClick={() => handleBreadcrumbClick(crumb.id)}
                        variant="ghost"
                        size="sm"
                        className="hover:text-gray-700 transition-colors p-1"
                      >
                        {crumb.name}
                      </Button>
                    </div>
                  ))}
                </nav>

                <h1 className="text-2xl font-bold text-gray-900">
                  {folderData?.currentFolder?.name || "My Files"}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  {filteredFolders.length} folders, {filteredFiles.length} files
                </p>
              </div>

              <div className="mt-4 sm:mt-0 flex space-x-3">
                <Button onClick={() => refetch()} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  onClick={() => setIsCreateFolderModalOpen(true)}
                  variant="outline"
                >
                  <FolderPlus className="w-4 h-4 mr-2" />
                  New Folder
                </Button>
                <Button onClick={() => setIsUploadModalOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search folders and files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Files</option>
                  <option value="public">Public Files</option>
                  <option value="private">Private Files</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Drop zone for root folder when dragging items */}
            {draggedItem && currentFolderId && (
              <div
                className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:border-indigo-500 hover:bg-indigo-50 transition-colors cursor-pointer flex items-center justify-center"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, "root")}
              >
                <Home className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-gray-600">
                  Drop here to move to root folder
                </span>
              </div>
            )}

            {filteredFolders.length === 0 && filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                {searchTerm ? (
                  <>
                    <Search className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No items match your search
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search terms
                    </p>
                  </>
                ) : (
                  <>
                    <Folder className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      This folder is empty
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating a folder or uploading files.
                    </p>
                    <div className="mt-6 flex justify-center space-x-3">
                      <Button
                        onClick={() => setIsCreateFolderModalOpen(true)}
                        variant="outline"
                      >
                        <FolderPlus className="w-4 h-4 mr-2" />
                        Create Folder
                      </Button>
                      <Button onClick={() => setIsUploadModalOpen(true)}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Files
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* Folders */}
                {filteredFolders.map((folder: any) => (
                  <Card
                    key={folder.id}
                    className={`group cursor-pointer hover:shadow-md transition-all duration-200 ${
                      dragOverFolder === folder.id
                        ? "border-indigo-500 bg-indigo-50 border-2"
                        : ""
                    } ${
                      draggedItem?.id === folder.id ? "opacity-50 scale-95" : ""
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, folder.id, "folder")}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, folder.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, folder.id)}
                    title="Drag to move folder or drop files here"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div
                          className="flex items-center space-x-3 flex-1 min-w-0"
                          onDoubleClick={() =>
                            handleFolderDoubleClick(folder.id)
                          }
                        >
                          <FolderOpen className="w-8 h-8 text-blue-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            {editingFolder?.id === folder.id ? (
                              <Input
                                type="text"
                                defaultValue={folder.name}
                                autoFocus
                                onBlur={(e) =>
                                  handleRenameFolder(folder.id, e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleRenameFolder(
                                      folder.id,
                                      e.currentTarget.value
                                    );
                                  } else if (e.key === "Escape") {
                                    setEditingFolder(null);
                                  }
                                }}
                                className="text-sm font-medium text-gray-900 bg-transparent border-b border-indigo-500 focus:outline-none w-full"
                              />
                            ) : (
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {folder.name}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              {folder.fileCount || 0} items
                            </p>
                          </div>
                        </div>
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </Button>
                          {/* Dropdown menu would go here */}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(folder.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <Button
                          onClick={() =>
                            setEditingFolder({
                              id: folder.id,
                              name: folder.name,
                            })
                          }
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Rename
                        </Button>
                        <Button
                          onClick={() =>
                            handleDeleteFolder(folder.id, folder.name)
                          }
                          disabled={deleteFolderMutation.isPending}
                          variant="danger"
                          size="sm"
                          className="bg-red-500 text-white hover:bg-red-600 border-red-500"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Files */}
                {filteredFiles.map((file: any) => (
                  <Card
                    key={file.id}
                    className={`group hover:shadow-md transition-all duration-200 cursor-move ${
                      draggedItem?.id === file.id ? "opacity-50 scale-95" : ""
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, file.id, "file")}
                    onDragEnd={handleDragEnd}
                    title="Drag to move file to folder"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {getFileIcon(file.mimeType)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.originalName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {file.isPublic ? (
                            <div title="Public">
                              <Eye className="h-4 w-4 text-green-500" />
                            </div>
                          ) : (
                            <div title="Private">
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {file.description && (
                        <p className="mt-2 text-xs text-gray-600 line-clamp-2">
                          {file.description}
                        </p>
                      )}

                      {file?.tags && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {(Array.isArray(file.tags)
                            ? file.tags
                            : JSON.parse(file.tags || "[]")
                          )
                            .slice(0, 3)
                            ?.map((tag: string, index: number) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="inline-flex items-center"
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          {(Array.isArray(file.tags)
                            ? file.tags
                            : JSON.parse(file.tags || "[]")
                          ).length > 3 && (
                            <span className="text-xs text-gray-500">
                              +
                              {(Array.isArray(file.tags)
                                ? file.tags
                                : JSON.parse(file.tags || "[]")
                              ).length - 3}{" "}
                              more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(file.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <Button
                          onClick={() =>
                            handleDownload(file.blobUrl, file.originalName)
                          }
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                        <Button
                          onClick={() =>
                            handleDeleteFile(file.id, file.originalName)
                          }
                          disabled={deleteFileMutation.isPending}
                          variant="danger"
                          size="sm"
                          className="bg-red-500 text-white hover:bg-red-600 border-red-500"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Statistics Footer */}
          {(filteredFolders.length > 0 || filteredFiles.length > 0) && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  Showing {filteredFolders.length} folders,{" "}
                  {filteredFiles.length} files
                </div>
                <div className="flex items-center space-x-4">
                  <span>
                    Public:{" "}
                    {filteredFiles.filter((f: any) => f.isPublic).length}
                  </span>
                  <span>
                    Private:{" "}
                    {filteredFiles.filter((f: any) => !f.isPublic).length}
                  </span>
                  <span>
                    Total Size:{" "}
                    {formatFileSize(
                      filteredFiles.reduce(
                        (total: number, file: any) => total + file.size,
                        0
                      )
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          refetch(); // Refresh after closing upload modal
        }}
        currentFolderId={currentFolderId}
        currentFolderName={folderData?.currentFolder?.name}
      />

      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => {
          setIsCreateFolderModalOpen(false);
          refetch(); // Refresh after closing folder modal
        }}
        parentFolderId={currentFolderId}
        parentFolderName={folderData?.currentFolder?.name}
      />
    </div>
  );
}
