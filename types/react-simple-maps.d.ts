declare module 'react-simple-maps' {
  import { ReactNode, CSSProperties } from 'react'

  export interface Geography {
    rsmKey: string
    properties: {
      [key: string]: any
      NAME?: string
      NAME_EN?: string
      ISO_A2?: string
      ISO_A3?: string
    }
    geometry: {
      type: string
      coordinates: any
    }
  }

  export interface ComposableMapProps {
    projection?: string | (() => any)
    projectionConfig?: {
      scale?: number
      center?: [number, number]
      [key: string]: any
    }
    width?: number
    height?: number
    style?: CSSProperties
    className?: string
    children?: ReactNode
  }

  export interface GeographiesProps {
    geography?: string | object
    children?: (geographies: Geography[]) => ReactNode
  }

  export interface GeographyProps {
    geography: Geography
    style?: CSSProperties | ((geography: Geography) => CSSProperties)
    className?: string
    onMouseEnter?: (event: any, geography: Geography) => void
    onMouseLeave?: (event: any, geography: Geography) => void
    onMouseDown?: (event: any, geography: Geography) => void
    onMouseUp?: (event: any, geography: Geography) => void
    onClick?: (event: any, geography: Geography) => void
  }

  export interface ZoomableGroupPosition {
    coordinates: [number, number]
    zoom: number
  }

  export interface ZoomableGroupProps {
    center?: [number, number]
    zoom?: number
    minZoom?: number
    maxZoom?: number
    onMoveStart?: () => void
    onMoveEnd?: (position: ZoomableGroupPosition) => void
    children?: ReactNode
  }

  export const ComposableMap: React.FC<ComposableMapProps>
  export const Geographies: React.FC<GeographiesProps>
  export const Geography: React.FC<GeographyProps>
  export const ZoomableGroup: React.FC<ZoomableGroupProps>
}

