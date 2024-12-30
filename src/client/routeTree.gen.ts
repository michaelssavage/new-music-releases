/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from "./routes/__root"
import { Route as ReleasesImport } from "./routes/releases"
import { Route as LoginImport } from "./routes/login"
import { Route as CallbackImport } from "./routes/callback"
import { Route as IndexImport } from "./routes/index"

// Create/Update Routes

const ReleasesRoute = ReleasesImport.update({
  id: "/releases",
  path: "/releases",
  getParentRoute: () => rootRoute,
} as any)

const LoginRoute = LoginImport.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => rootRoute,
} as any)

const CallbackRoute = CallbackImport.update({
  id: "/callback",
  path: "/callback",
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: "/",
  path: "/",
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/": {
      id: "/"
      path: "/"
      fullPath: "/"
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    "/callback": {
      id: "/callback"
      path: "/callback"
      fullPath: "/callback"
      preLoaderRoute: typeof CallbackImport
      parentRoute: typeof rootRoute
    }
    "/login": {
      id: "/login"
      path: "/login"
      fullPath: "/login"
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    "/releases": {
      id: "/releases"
      path: "/releases"
      fullPath: "/releases"
      preLoaderRoute: typeof ReleasesImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  "/": typeof IndexRoute
  "/callback": typeof CallbackRoute
  "/login": typeof LoginRoute
  "/releases": typeof ReleasesRoute
}

export interface FileRoutesByTo {
  "/": typeof IndexRoute
  "/callback": typeof CallbackRoute
  "/login": typeof LoginRoute
  "/releases": typeof ReleasesRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  "/": typeof IndexRoute
  "/callback": typeof CallbackRoute
  "/login": typeof LoginRoute
  "/releases": typeof ReleasesRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: "/" | "/callback" | "/login" | "/releases"
  fileRoutesByTo: FileRoutesByTo
  to: "/" | "/callback" | "/login" | "/releases"
  id: "__root__" | "/" | "/callback" | "/login" | "/releases"
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  CallbackRoute: typeof CallbackRoute
  LoginRoute: typeof LoginRoute
  ReleasesRoute: typeof ReleasesRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  CallbackRoute: CallbackRoute,
  LoginRoute: LoginRoute,
  ReleasesRoute: ReleasesRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/callback",
        "/login",
        "/releases"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/callback": {
      "filePath": "callback.tsx"
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/releases": {
      "filePath": "releases.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
