import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import MapView from '@/components/map/MapView'
import type { Database } from '@/types/database'

type BikeRow = Database['public']['Tables']['bikes']['Row']
type BikeImageRow = Database['public']['Tables']['bike_images']['Row']
type MapBike = Pick<BikeRow, 'id' | 'title' | 'make' | 'model' | 'year' | 'price' | 'style' | 'city' | 'mileage_km' | 'is_verified'> & {
  bike_images: Pick<BikeImageRow, 'url' | 'is_cover'>[]
}

export const metadata: Metadata = {
  title: 'Bikes in deiner Nähe',
  description: 'Finde Custom Bikes in deiner Nähe auf der Karte.',
}

export default async function MapPage() {
  const supabase = await createClient()

  // Initial load: active bikes with images (SSR for fast first paint)
  const { data: bikes } = await supabase
    .from('bikes')
    .select(`
      id, title, make, model, year, price, style, city, mileage_km, is_verified,
      bike_images ( url, is_cover )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(100) as unknown as { data: MapBike[] | null }

  return <MapView initialBikes={bikes ?? []} />
}
