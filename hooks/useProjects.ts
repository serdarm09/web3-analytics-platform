'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Project {
  _id: string
  name: string
  symbol: string
  logo: string
  description: string
  category: string
  website: string
  social: {
    twitter?: string
    telegram?: string
    discord?: string
  }
  marketData: {
    price: number
    marketCap: number
    volume24h: number
    change24h: number
    change7d: number
    circulatingSupply: number
    totalSupply: number
  }
  metrics: {
    starRating: number
    trendingScore?: number
    holders: number
  }
  blockchain: string
  contractAddress?: string
  isActive: boolean
  isPublic?: boolean
  addedBy?: {
    _id: string
    username?: string
    name?: string
    email?: string
  } | string
  createdBy?: {
    userId: string
    username?: string
    email?: string
    isVerifiedCreator?: boolean
  }
  viewCount?: number
  addCount?: number
  likeCount?: number
  createdAt: string
  updatedAt: string
}

export interface ProjectsResponse {
  projects: Project[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface UseProjectsOptions {
  search?: string
  category?: string
  page?: number
  limit?: number
  autoFetch?: boolean
}

export interface UseProjectsReturn {
  projects: Project[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  } | null
  fetchProjects: () => Promise<void>
  refetch: () => Promise<void>
  createProject: (projectData: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>) => Promise<Project>
}

export function useProjects(options: UseProjectsOptions = {}): UseProjectsReturn {
  const {
    search = '',
    category = '',
    page = 1,
    limit = 20,
    autoFetch = true
  } = options

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    total: number
    totalPages: number
  } | null>(null)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(category && { category })
      })

      const response = await fetch(`/api/projects?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`)
      }

      const data: ProjectsResponse = await response.json()
      
      setProjects(data.projects)
      setPagination(data.pagination)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      console.error('Failed to fetch projects:', err)
    } finally {
      setLoading(false)
    }
  }, [search, category, page, limit])

  const refetch = useCallback(() => {
    return fetchProjects()
  }, [fetchProjects])

  const createProject = useCallback(async (projectData: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
    setError(null)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create project')
      }

      const newProject: Project = await response.json()
      
      setProjects(prevProjects => [newProject, ...prevProjects])
      
      if (pagination) {
        setPagination(prev => ({
          ...prev!,
          total: prev!.total + 1
        }))
      }

      return newProject
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project'
      setError(errorMessage)
      throw err
    }
  }, [pagination])

  useEffect(() => {
    if (autoFetch) {
      fetchProjects()
    }
  }, [fetchProjects, autoFetch])

  return {
    projects,
    loading,
    error,
    pagination,
    fetchProjects,
    refetch,
    createProject
  }
}

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProject = useCallback(async () => {
    if (!projectId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${projectId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch project: ${response.statusText}`)
      }

      const projectData: Project = await response.json()
      setProject(projectData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      console.error('Failed to fetch project:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (projectId) {
      fetchProject()
    }
  }, [fetchProject])

  return {
    project,
    loading,
    error,
    refetch: fetchProject
  }
}