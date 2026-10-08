'use client'

import React, { PropsWithChildren, useEffect, useRef } from 'react'
import 'lenis/dist/lenis.css'
import { usePathname } from 'next/navigation'

export default function LenisProvider({ children }: PropsWithChildren) {
  const lenisRef = useRef<any>(null)
  const tickerFnRef = useRef<((time: number) => void) | null>(null)
  const resizeFnRef = useRef<(() => void) | null>(null)
  const pathname = usePathname()

  const cleanupLenis = async () => {
    if (tickerFnRef.current) {
      try {
        const { gsap } = await import('gsap')
        gsap.ticker.remove(tickerFnRef.current)
      } catch {}
      tickerFnRef.current = null
    }
    if (resizeFnRef.current) {
      window.removeEventListener('resize', resizeFnRef.current)
      resizeFnRef.current = null
    }
    if (lenisRef.current) {
      lenisRef.current.destroy()
      lenisRef.current = null
    }
    if (typeof window !== 'undefined') {
      ;(window as any).lenis = null
      document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped', 'lenis-scrolling')
      document.documentElement.style.removeProperty('overflow')
      document.body.style.removeProperty('overflow')
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto'
      }
    }
  }

  const [shouldBeActive, setShouldBeActive] = React.useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShouldBeActive(!pathname?.startsWith('/admin') && window.innerWidth >= 1024)
    }
  }, [pathname])

  // 1. Initialize Lenis only when shouldBeActive changes (not on every route change)
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!shouldBeActive) {
      cleanupLenis()
      return
    }

    let isDestroyed = false

    const initLenis = async () => {
      if (isDestroyed || lenisRef.current) return

      try {
        window.scrollTo(0, 0)

        const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
          import('lenis'),
          import('gsap'),
          import('gsap/ScrollTrigger'),
        ])

        if (isDestroyed) return

        gsap.registerPlugin(ScrollTrigger)
        ScrollTrigger.clearScrollMemory()
        if ('scrollRestoration' in window.history) {
          window.history.scrollRestoration = 'manual'
        }

        const lenis = new Lenis({
          duration: 1.0,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 1.2,
          infinite: false,
          autoResize: true,
        })

        lenisRef.current = lenis
        ;(window as any).lenis = lenis

        lenis.on('scroll', ScrollTrigger.update)

        const updateTicker = (time: number) => {
          lenisRef.current?.raf(time * 1000)
        }
        tickerFnRef.current = updateTicker
        gsap.ticker.add(updateTicker)
        gsap.ticker.lagSmoothing(500, 33)

        const handleResize = () => {
          lenisRef.current?.resize()
          ScrollTrigger.refresh()
        }
        resizeFnRef.current = handleResize
        window.addEventListener('resize', handleResize)

        lenis.resize()
        ScrollTrigger.refresh()

      } catch (err) {
        console.error('Failed to init Lenis:', err)
      }
    }

    initLenis()

    return () => {
      isDestroyed = true
      cleanupLenis()
    }
  }, [shouldBeActive])

  // 2. Handle normal route changes (refresh triggers instead of destroying Lenis)
  useEffect(() => {
    if (shouldBeActive && lenisRef.current) {
      // Scroll to top on new page load
      lenisRef.current.scrollTo(0, { immediate: true, force: true })
      
      // Give the new page a tiny moment to render its DOM, then recalculate scroll triggers
      const timer = setTimeout(() => {
        lenisRef.current?.resize()
        import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
          ScrollTrigger.refresh()
        })
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [pathname, shouldBeActive])

  return <>{children}</>
}