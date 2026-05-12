import { useCallback, useEffect, useRef, useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ApiError } from '@/services/http'

import {
  deleteStockProduct,
  getStockSummary,
  listStockCategories,
  listStockProducts,
} from '../services/inventory.service'
import type {
  StockCategory,
  StockProduct,
  StockProductStatus,
  StockSummary,
} from '../types/inventory.types'

const INITIAL_PAGE_SIZE = 20

export function useInventoryPage() {
  const { showAlert } = useGlobalAlerts()
  const { user } = useAuth()
  const isOwner = user?.role === 'OWNER'

  const [summary, setSummary] = useState<StockSummary | null>(null)
  const [categories, setCategories] = useState<StockCategory[]>([])
  const [products, setProducts] = useState<StockProduct[]>([])
  const [total, setTotal] = useState(0)

  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<StockProduct | null>(null)

  const [viewingProduct, setViewingProduct] = useState<StockProduct | null>(null)
  const [deactivatingProduct, setDeactivatingProduct] = useState<StockProduct | null>(null)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [deactivateError, setDeactivateError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string | undefined>()
  const [status, setStatus] = useState<StockProductStatus | undefined>()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(INITIAL_PAGE_SIZE)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initializedRef = useRef(false)
  const [initKey, setInitKey] = useState(0)

  // Initial load: summary + categories + products in parallel
  useEffect(() => {
    setIsLoading(true)
    setError(null)
    initializedRef.current = false

    Promise.all([
      getStockSummary(),
      listStockCategories(),
      listStockProducts({ page: 1, limit: INITIAL_PAGE_SIZE }),
    ])
      .then(([s, c, p]) => {
        setSummary(s)
        setCategories(c)
        setProducts(p.data)
        setTotal(p.total)
        initializedRef.current = true
      })
      .catch((err) => {
        const message =
          err instanceof ApiError
            ? err.message
            : 'Não foi possível carregar o estoque. Tente novamente.'
        setError(message)
      })
      .finally(() => setIsLoading(false))
  }, [initKey]) // initKey allows manual retry

  // Reload products when filters/page change (skips initial run via initializedRef)
  useEffect(() => {
    if (!initializedRef.current) return

    setIsLoadingProducts(true)
    listStockProducts({
      search: debouncedSearch || undefined,
      categoryId,
      status,
      page,
      limit: pageSize,
    })
      .then((result) => {
        setProducts(result.data)
        setTotal(result.total)
      })
      .catch((err) => {
        const message =
          err instanceof ApiError ? err.message : 'Erro ao filtrar produtos.'
        showAlert({ title: 'Erro ao filtrar', description: message, tone: 'error' })
      })
      .finally(() => setIsLoadingProducts(false))
  }, [debouncedSearch, categoryId, status, page, pageSize, showAlert])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleSearchChange = (value: string) => {
    setPage(1)
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 400)
  }

  const handleCategoryChange = (value: string | undefined) => {
    setPage(1)
    setCategoryId(value)
  }

  const handleStatusChange = (value: StockProductStatus | undefined) => {
    setPage(1)
    setStatus(value)
  }

  const handleClearFilters = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSearch('')
    setDebouncedSearch('')
    setCategoryId(undefined)
    setStatus(undefined)
    setPage(1)
  }, [])

  const handleRetry = useCallback(() => {
    setInitKey((k) => k + 1)
  }, [])

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setPage(1)
  }, [])

  const reloadSummaryAndProducts = useCallback(() => {
    Promise.all([
      getStockSummary(),
      listStockProducts({
        search: debouncedSearch || undefined,
        categoryId,
        status,
        page,
        limit: pageSize,
      }),
    ])
      .then(([s, p]) => {
        setSummary(s)
        setProducts(p.data)
        setTotal(p.total)
      })
      .catch((err) => {
        const message =
          err instanceof ApiError ? err.message : 'Erro ao recarregar estoque.'
        showAlert({ title: 'Erro ao recarregar', description: message, tone: 'error' })
      })
  }, [debouncedSearch, categoryId, status, page, pageSize, showAlert])

  const handleOpenCreate = useCallback(() => setIsCreateModalOpen(true), [])

  const handleOpenEdit = useCallback((product: StockProduct) => setEditingProduct(product), [])

  const handleCloseModal = useCallback(() => {
    setIsCreateModalOpen(false)
    setEditingProduct(null)
  }, [])

  const handleProductSaved = useCallback(() => {
    reloadSummaryAndProducts()
  }, [reloadSummaryAndProducts])

  const handleOpenDetails = useCallback((product: StockProduct) => setViewingProduct(product), [])

  const handleCloseDetails = useCallback(() => setViewingProduct(null), [])

  const handleDeactivateRequest = useCallback((product: StockProduct) => {
    setDeactivateError(null)
    setDeactivatingProduct(product)
  }, [])

  const handleDeactivateCancel = useCallback(() => {
    setDeactivatingProduct(null)
    setDeactivateError(null)
  }, [])

  const handleDeactivateConfirm = useCallback(async () => {
    if (!deactivatingProduct) return
    setIsDeactivating(true)
    setDeactivateError(null)
    try {
      await deleteStockProduct(deactivatingProduct.id)
      setDeactivatingProduct(null)
      showAlert({ title: 'Produto desativado com sucesso.', tone: 'success' })
      reloadSummaryAndProducts()
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Não foi possível desativar o produto. Tente novamente.'
      setDeactivateError(message)
    } finally {
      setIsDeactivating(false)
    }
  }, [deactivatingProduct, reloadSummaryAndProducts, showAlert])

  const hasFilters = !!debouncedSearch || !!categoryId || !!status

  return {
    summary,
    categories,
    products,
    total,
    isLoading,
    isLoadingProducts,
    error,
    search,
    categoryId,
    status,
    page,
    pageSize,
    hasFilters,
    handleSearchChange,
    handleCategoryChange,
    handleStatusChange,
    handleClearFilters,
    handleRetry,
    setPage,
    handlePageSizeChange,
    isOwner,
    isCreateModalOpen,
    editingProduct,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseModal,
    handleProductSaved,
    viewingProduct,
    handleOpenDetails,
    handleCloseDetails,
    deactivatingProduct,
    isDeactivating,
    deactivateError,
    handleDeactivateRequest,
    handleDeactivateCancel,
    handleDeactivateConfirm,
  }
}
