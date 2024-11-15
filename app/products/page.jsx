'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getProducts, getCategories, getCompanies, addToCart } from '@/lib/db';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [quantities, setQuantities] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [productsData, categoriesData, companiesData] = await Promise.all([
        getProducts(),
        getCategories(),
        getCompanies()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setCompanies(companiesData);

      const initialQuantities = {};
      productsData.forEach(product => {
        initialQuantities[product.id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Ürünler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  function handleProductSelect(productId) {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  }

  async function handleAddToCart() {
    if (selectedProducts.size === 0) {
      toast({
        title: "Uyarı",
        description: "Lütfen en az bir ürün seçin.",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedItems = Array.from(selectedProducts).map(productId => {
        const product = products.find(p => p.id === productId);
        return {
          productId: product.id,
          quantity: quantities[productId],
          price: product.price,
          name: product.name,
          categoryName: product.categoryName,
          companyName: product.companyName,
          image: product.image
        };
      });

      // Her ürünü tek tek sepete ekle
      for (const item of selectedItems) {
        await addToCart(item);
      }

      toast({
        title: "Başarılı",
        description: "Ürünler sepete eklendi.",
      });

      // Seçimleri sıfırla
      setSelectedProducts(new Set());

      if (confirm('Ürünler sepete eklendi. Sepete gitmek ister misiniz?')) {
        router.push('/cart');
      }
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      toast({
        title: "Hata",
        description: "Ürünler sepete eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Ürünlerimiz</h1>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Kategori Seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Ürün ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64"
          />
          <Button 
            onClick={handleAddToCart} 
            disabled={selectedProducts.size === 0}
            className="w-full md:w-auto"
          >
            Seçilenleri Sepete Ekle ({selectedProducts.size})
          </Button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Bu kriterlere uygun ürün bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className={`flex flex-col cursor-pointer transition-all ${
                selectedProducts.has(product.id) ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleProductSelect(product.id)}
            >
              <div className="relative">
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selectedProducts.has(product.id)}
                    onCheckedChange={() => handleProductSelect(product.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                {product.image && (
                  <div className="relative pt-[60%]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="absolute top-0 left-0 w-full h-full object-cover rounded-t-lg"
                    />
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {product.categoryName && (
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                      Kategori: {product.categoryName}
                    </span>
                  )}
                  {product.companyName && (
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm">
                      Firma: {product.companyName}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-2xl font-bold text-blue-600">{product.price} TL</p>
                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <label className="text-sm font-medium">Adet:</label>
                    <Input
                      type="number"
                      min="1"
                      value={quantities[product.id]}
                      onChange={(e) => setQuantities({
                        ...quantities,
                        [product.id]: parseInt(e.target.value) || 1
                      })}
                      className="w-24"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}