import { Droplets } from "lucide-react"
import Link from "next/link"

export function OceanLearnLogo() {
  return (
    <Link href="/" className="text-base font-medium text-ocean-deep flex items-center">
      <Droplets className="mr-1 h-4 w-4 text-aqua" />
      <span>OceanLearn</span>
    </Link>
  )
}
