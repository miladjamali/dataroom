import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'
import { Building2 } from 'lucide-react'

const config: DocsThemeConfig = {
  logo: (
    <div className="flex items-center space-x-2">
      <Building2 className="h-6 w-6 text-blue-600" />
      <span className="font-bold text-lg">DataRoom MVP Docs</span>
    </div>
  ),
  project: {
    link: 'https://github.com/miladjamali/dataroom',
  },
  docsRepositoryBase: 'https://github.com/miladjamali/dataroom/tree/main/apps/docs',
  footer: {
    content: (
      <span>
        DataRoom MVP Documentation - Take-Home Assessment Project
      </span>
    ),
  },
  head: (
    <>
      <meta name="description" content="DataRoom MVP - Secure Virtual Data Room Documentation" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>DataRoom MVP Documentation</title>
    </>
  ),
  sidebar: {
    defaultMenuCollapseLevel: 1,
  },
  toc: {
    backToTop: true,
  },
  editLink: {
    content: 'Edit this page on GitHub →'
  },
  feedback: {
    content: 'Question? Give us feedback →'
  }
}

export default config