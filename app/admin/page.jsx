'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addProduct, getProducts, getRequests, addCompany, getCompanies, addCategory, getCategories, convertImageToBase64 } from '@/lib/db';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    categoryId: '',
    companyId: '',
    image: null
  });
  const [newCompany, setNewCompany] = useState({ name: '' });
  const [newCategory, setNewCategory] = useState({ name: '' });
  const { toast } = useToast();

  const ADMIN_PASSWORD = '123456';

  useEffect(() => {
    // Oturum durumunu kontrol et
    const isAuth = localStorage.getItem('adminAuthenticated') === 'true';
    setIsAuthenticated(isAuth);
    if (isAuth) {
      loadData();
    }
  }, []);

  async function loadData() {
    try {
      const [productsData, requestsData, companiesData, categoriesData] = await Promise.all([
        getProducts(),
        getRequests(),
        getCompanies(),
        getCategories()
      ]);
      setProducts(productsData);
      setRequests(requestsData);
      setCompanies(companiesData);
      setCategories(categoriesData);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Veriler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  }

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuthenticated', 'true');
      loadData();
      setPassword('');
    } else {
      toast({
        title: "Hata",
        description: "Geçersiz şifre!",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuthenticated');
    setPassword('');
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.categoryId) {
      toast({
        title: "Hata",
        description: "Lütfen gerekli alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    try {
      const productToAdd = {
        ...newProduct,
        price: parseFloat(newProduct.price)
      };

      await addProduct(productToAdd);
      await loadData();
      setNewProduct({
        name: '',
        price: '',
        categoryId: '',
        companyId: '',
        image: null
      });
      toast({
        title: "Başarılı",
        description: "Ürün başarıyla eklendi.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Ürün eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (!newCompany.name) {
      toast({
        title: "Hata",
        description: "Firma adı gereklidir.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addCompany(newCompany);
      await loadData();
      setNewCompany({ name: '' });
      toast({
        title: "Başarılı",
        description: "Firma başarıyla eklendi.",
      });
    } catch (error) {
      console.error('Firma ekleme hatası:', error);
      toast({
        title: "Hata",
        description: "Firma eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name) {
      toast({
        title: "Hata",
        description: "Kategori adı gereklidir.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addCategory(newCategory);
      await loadData();
      setNewCategory({ name: '' });
      toast({
        title: "Başarılı",
        description: "Kategori başarıyla eklendi.",
      });
    } catch (error) {
      console.error('Kategori ekleme hatası:', error);
      toast({
        title: "Hata",
        description: "Kategori eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await convertImageToBase64(file);
        setNewProduct({ ...newProduct, image: base64 });
      } catch (error) {
        toast({
          title: "Hata",
          description: "Resim yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Admin Girişi</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Şifre"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Giriş Yap
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Yönetim Paneli</h1>
        <Button variant="outline" onClick={handleLogout}>
          Çıkış Yap
        </Button>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Ürün Ekle</TabsTrigger>
          <TabsTrigger value="companies">Firmalar</TabsTrigger>
          <TabsTrigger value="categories">Kategoriler</TabsTrigger>
          <TabsTrigger value="requests">Talepler</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Yeni Ürün Ekle</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <Input
                  placeholder="Ürün Adı"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Fiyat"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
                <Select
                  value={newProduct.categoryId}
                  onValueChange={(value) => setNewProduct({ ...newProduct, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={newProduct.companyId}
                  onValueChange={(value) => setNewProduct({ ...newProduct, companyId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Firma Seçin (Opsiyonel)" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <Button type="submit">Ürün Ekle</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Yeni Firma Ekle</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCompany} className="space-y-4">
                  <Input
                    placeholder="Firma Adı"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  />
                  <Button type="submit">Firma Ekle</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mevcut Firmalar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span>{company.name}</span>
                      <span className="text-sm text-gray-500">ID: {company.id}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Yeni Kategori Ekle</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <Input
                    placeholder="Kategori Adı"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  />
                  <Button type="submit">Kategori Ekle</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mevcut Kategoriler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span>{category.name}</span>
                      <span className="text-sm text-gray-500">ID: {category.id}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <h3 className="font-semibold">Talep #{request.id}</h3>
                    <span className="text-gray-500">
                      {new Date(request.date).toLocaleString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="grid gap-2">
                    <p><strong>Talep Eden:</strong> {request.requesterName}</p>
                    <p><strong>Firma:</strong> {request.companyName}</p>
                    <p><strong>Telefon:</strong> {request.phoneNumber}</p>
                    {request.message && (
                      <p><strong>Mesaj:</strong> {request.message}</p>
                    )}
                    <div className="mt-2">
                      <strong>Ürünler:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {request.items.map((item, index) => (
                          <li key={index}>
                            {item.name} - {item.quantity} adet
                            {item.categoryName && ` | Kategori: ${item.categoryName}`}
                            {item.companyName && ` | Firma: ${item.companyName}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}