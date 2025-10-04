// src/routes/index.tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import { Building2, Shield, Upload, FolderOpen, FileText, Users, ArrowRight, CheckCircle, Clock, Target } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                <Target className="h-4 w-4" />
                <span>Take-Home Assessment Project</span>
              </div>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Secure Virtual
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 block">
                Data Room
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              A modern, secure document management platform designed for enterprise due diligence processes. 
              Built with React, TypeScript, and cutting-edge web technologies.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/files"
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                <FolderOpen className="h-5 w-5 mr-2" />
                Explore Data Room
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              <Link 
                to="/upload"
                className="inline-flex items-center px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-colors"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Documents
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Overview */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Assessment Overview</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              This project demonstrates real-world engineering capabilities through the development of 
              a comprehensive Data Room solution for Acme Corp's multi-billion dollar acquisition.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center mb-4">
                <Clock className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Timeline</h3>
              </div>
              <p className="text-gray-600 mb-3">Expected: 4-6 hours</p>
              <p className="text-sm text-gray-500">
                Flexible timeline allowing for creative exploration and thorough implementation
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-center mb-4">
                <Target className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Objectives</h3>
              </div>
              <p className="text-gray-600 mb-3">Multi-faceted evaluation</p>
              <p className="text-sm text-gray-500">
                Technical skills, problem-solving, creativity, documentation, and decision articulation
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
              <div className="flex items-center mb-4">
                <Users className="h-8 w-8 text-purple-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Use Case</h3>
              </div>
              <p className="text-gray-600 mb-3">Corporate Due Diligence</p>
              <p className="text-sm text-gray-500">
                Secure document repository for high-stakes business acquisitions and sensitive data sharing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Functionality</h2>
            <p className="text-lg text-gray-600">
              Comprehensive CRUD operations optimized for user experience and security
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Folder Management */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <FolderOpen className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Folder Management</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Create and nest folders hierarchically
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  View folder contents and navigation
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Rename and organize folders
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Delete folders with cascade operations
                </li>
              </ul>
            </div>

            {/* File Management */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">File Operations</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Upload PDF files with validation
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  View and preview documents
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Rename files with conflict handling
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Secure file deletion and cleanup
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Stack */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Technical Implementation</h2>
            <p className="text-lg text-gray-600">
              Built with modern technologies and best practices for scalability and maintainability
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'React 19', desc: 'Latest React with concurrent features' },
              { name: 'TypeScript', desc: 'Type-safe development' },
              { name: 'TanStack Router', desc: 'Type-safe routing solution' },
              { name: 'Tailwind CSS', desc: 'Utility-first styling' },
              { name: 'Vite', desc: 'Fast build tooling' },
              { name: 'Drizzle ORM', desc: 'Type-safe database operations' },
              { name: 'Lucide Icons', desc: 'Beautiful icon library' },
              { name: 'Monorepo', desc: 'Scalable code organization' }
            ].map((tech, index) => (
              <div key={index} className="text-center p-4 rounded-lg bg-gray-50 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">{tech.name}</h4>
                <p className="text-sm text-gray-600">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Explore the Data Room?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Experience secure document management with intuitive folder structures, 
            seamless file uploads, and enterprise-grade functionality.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/files"
              className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              <Shield className="h-5 w-5 mr-2" />
              Access Data Room
            </Link>
            <Link 
              to="/upload"
              className="inline-flex items-center px-8 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors border-2 border-blue-500"
            >
              <Upload className="h-5 w-5 mr-2" />
              Start Uploading
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-blue-400 mr-2" />
            <span className="text-lg font-semibold">DataRoom MVP</span>
          </div>
          <p className="text-sm">
            A take-home assessment project demonstrating modern web development practices 
            and enterprise-grade document management solutions.
          </p>
        </div>
      </footer>
    </div>
  )
}