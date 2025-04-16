import { VariantProps } from "class-variance-authority"
import { ButtonHTMLAttributes } from "react"

const buttonVariants = {
  variants: {
    variant: {
      default: string
      destructive: string
      outline: string
      secondary: string
      ghost: string
      link: string
      ocean: string
      "ocean-outline": string
      "solid-blue": string
      "outline-blue": string
      "custom-aqua": string
    },
    size: {
      default: string
      sm: string
      lg: string
      xl: string
      icon: string
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
} as const

export type ButtonVariants = typeof buttonVariants

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Whether to render the button as a child component
   * @default false
   */
  asChild?: boolean
}

export type ButtonVariant = keyof typeof buttonVariants.variants.variant
export type ButtonSize = keyof typeof buttonVariants.variants.size 