'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Package, Shield, Truck, Search } from 'lucide-react';
import { getProducts, getCategories } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  async function loadFeaturedProducts() {
    try {
      const products = await getProducts();
      setFeaturedProducts(products.slice(-3));
    } catch (error) {
      toast({
        title: "Hata",
        description: "Ürünler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Modern Navbar */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              Veka Ticaret
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/products" className="text-gray-600 hover:text-blue-600 transition-colors">
              Ürünler
            </Link>
            <Link href="/cart">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section with Animation */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-white -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text animate-fade-in">
              Kaliteli Ürünler, Uygun Fiyatlar
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-600 animate-fade-in-up">
              İhtiyacınız olan tüm ürünler tek bir yerde. Hemen keşfedin!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                  Ürünleri Keşfet
                </Button>
              </Link>
              <Link href="/cart">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <ShoppingCart className="mr-2 h-5 w-5" /> Sepete Git
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-blue-50 to-white border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-semibold mb-2">Geniş Ürün Yelpazesi</h3>
                <p className="text-gray-600">Binlerce ürün arasından seçiminizi yapın</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-indigo-50 to-white border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-indigo-600" />
                <h3 className="text-xl font-semibold mb-2">Güvenli Alışveriş</h3>
                <p className="text-gray-600">%100 güvenli alışveriş deneyimi</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-white border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <Truck className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <h3 className="text-xl font-semibold mb-2">Hızlı Teslimat</h3>
                <p className="text-gray-600">Siparişleriniz hızlıca elinizde</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Öne Çıkan Ürünler</h2>
              <p className="text-gray-600">En yeni ve popüler ürünlerimizi keşfedin</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-xl transition-all">
                  {product.image && (
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-2xl font-bold text-blue-600 mb-4">{product.price} TL</p>
                    <Link href="/products">
                      <Button className="w-full">İncele</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/products">
                <Button variant="outline" size="lg">
                  Tüm Ürünleri Gör <Search className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Hakkımızda</h4>
              <p className="text-sm">
                Kaliteli ürünleri uygun fiyatlarla müşterilerimize sunmak için çalışıyoruz.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Hızlı Erişim</h4>
              <div className="space-y-2">
                <Link href="/products" className="block text-sm hover:text-white transition-colors">
                  Ürünler
                </Link>
                <Link href="/cart" className="block text-sm hover:text-white transition-colors">
                  Sepetim
                </Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">İletişim</h4>
              <div className="space-y-2 text-sm">
                <p>Email: info@firmaadi.com</p>
                <p>Tel: +90 (536) 317 71 00</p>
                <p>Adres: Antalya/Manavgat, Türkiye</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 Veka Ticaret, Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}