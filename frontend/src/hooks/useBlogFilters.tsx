"use client"

import { useState } from "react"

interface UseBlogFiltersProps {
  initialCategory?: string
  initialType?: string
  categories: string[]
  contentTypes: string[]
}

export function useBlogFilters({
  initialCategory = "All Categories",
  initialType = "All Types",
  categories,
  contentTypes
}: UseBlogFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedType, setSelectedType] = useState(initialType)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

  // Toggle category dropdown
  const toggleCategoryDropdown = () => {
    setShowCategoryDropdown(!showCategoryDropdown)
    // Close other dropdown if open
    if (showTypeDropdown) setShowTypeDropdown(false)
  }

  // Toggle type dropdown
  const toggleTypeDropdown = () => {
    setShowTypeDropdown(!showTypeDropdown)
    // Close other dropdown if open
    if (showCategoryDropdown) setShowCategoryDropdown(false)
  }

  // Select category
  const selectCategory = (category: string) => {
    setSelectedCategory(category)
    setShowCategoryDropdown(false)
  }

  // Select type
  const selectType = (type: string) => {
    setSelectedType(type)
    setShowTypeDropdown(false)
  }

  // Close all dropdowns
  const closeDropdowns = () => {
    setShowCategoryDropdown(false)
    setShowTypeDropdown(false)
  }

  return {
    selectedCategory,
    selectedType,
    showCategoryDropdown,
    showTypeDropdown,
    toggleCategoryDropdown,
    toggleTypeDropdown,
    selectCategory,
    selectType,
    closeDropdowns,
    categories,
    contentTypes
  }
} 