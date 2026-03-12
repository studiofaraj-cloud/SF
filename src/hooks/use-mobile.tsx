import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  if (!mounted) {
    return undefined
  }

  return !!isMobile
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const mql = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`)
    const onChange = () => {
      const width = window.innerWidth
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    const width = window.innerWidth
    setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  if (!mounted) {
    return undefined
  }

  return !!isTablet
}

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export function useDeviceType(): DeviceType | undefined {
  const [deviceType, setDeviceType] = React.useState<DeviceType | undefined>(undefined)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const updateDeviceType = () => {
      const width = window.innerWidth
      if (width < MOBILE_BREAKPOINT) {
        setDeviceType('mobile')
      } else if (width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }
    
    const mql = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", updateDeviceType)
    updateDeviceType()
    
    return () => mql.removeEventListener("change", updateDeviceType)
  }, [])

  if (!mounted) {
    return undefined
  }

  return deviceType
}
