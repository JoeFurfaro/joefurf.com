/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as RoadmapImport } from './routes/roadmap'
import { Route as BlogImport } from './routes/blog'
import { Route as ArticleImport } from './routes/article'
import { Route as IndexImport } from './routes/index'

// Create/Update Routes

const RoadmapRoute = RoadmapImport.update({
  id: '/roadmap',
  path: '/roadmap',
  getParentRoute: () => rootRoute,
} as any)

const BlogRoute = BlogImport.update({
  id: '/blog',
  path: '/blog',
  getParentRoute: () => rootRoute,
} as any)

const ArticleRoute = ArticleImport.update({
  id: '/article',
  path: '/article',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/article': {
      id: '/article'
      path: '/article'
      fullPath: '/article'
      preLoaderRoute: typeof ArticleImport
      parentRoute: typeof rootRoute
    }
    '/blog': {
      id: '/blog'
      path: '/blog'
      fullPath: '/blog'
      preLoaderRoute: typeof BlogImport
      parentRoute: typeof rootRoute
    }
    '/roadmap': {
      id: '/roadmap'
      path: '/roadmap'
      fullPath: '/roadmap'
      preLoaderRoute: typeof RoadmapImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/article': typeof ArticleRoute
  '/blog': typeof BlogRoute
  '/roadmap': typeof RoadmapRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/article': typeof ArticleRoute
  '/blog': typeof BlogRoute
  '/roadmap': typeof RoadmapRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/article': typeof ArticleRoute
  '/blog': typeof BlogRoute
  '/roadmap': typeof RoadmapRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/article' | '/blog' | '/roadmap'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/article' | '/blog' | '/roadmap'
  id: '__root__' | '/' | '/article' | '/blog' | '/roadmap'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  ArticleRoute: typeof ArticleRoute
  BlogRoute: typeof BlogRoute
  RoadmapRoute: typeof RoadmapRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  ArticleRoute: ArticleRoute,
  BlogRoute: BlogRoute,
  RoadmapRoute: RoadmapRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.jsx",
      "children": [
        "/",
        "/article",
        "/blog",
        "/roadmap"
      ]
    },
    "/": {
      "filePath": "index.jsx"
    },
    "/article": {
      "filePath": "article.jsx"
    },
    "/blog": {
      "filePath": "blog.jsx"
    },
    "/roadmap": {
      "filePath": "roadmap.jsx"
    }
  }
}
ROUTE_MANIFEST_END */
