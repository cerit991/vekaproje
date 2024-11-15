'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { initDB, getCart, addRequest, clearCart } from '@/lib/db';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [requestForm, setRequestForm] = useState({
    requesterName: '',
    companyName: '',
    phoneNumber: '',
    message: ''
  });
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    try {
      const items = await getCart();
      setCartItems(items);
      calculateTotal(items);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Sepet yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  }

  function calculateTotal(items) {
    const sum = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotal(sum);
  }

  async function handleSubmitRequest() {
    if (!requestForm.requesterName || !requestForm.companyName || !requestForm.phoneNumber) {
      toast({
        title: "Hata",
        description: "Lütfen gerekli alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    try {
      const request = {
        ...requestForm,
        items: cartItems,
        date: new Date().toISOString(),
        status: 'new'
      };

      await addRequest(request);
      await clearCart();

      toast({
        title: "Başarılı",
        description: "Talebiniz başarıyla oluşturuldu.",
      });

      // WhatsApp mesajı gönderme seçeneği
      const shouldSendWhatsApp = confirm('WhatsApp üzerinden de bildirim göndermek ister misiniz?');
      if (shouldSendWhatsApp) {
        const phoneNumber = '905363177100'; // Firma telefon numarası
        const message = `Yeni Talep:\n\nTalep Eden: ${requestForm.requesterName}\nFirma: ${requestForm.companyName}\nTelefon: ${requestForm.phoneNumber}\n\nÜrünler:\n${cartItems.map(item => `${item.name} - ${item.quantity} adet (${item.categoryName}${item.companyName ? ` - ${item.companyName}` : ''})`).join('\n')}${requestForm.message ? `\n\nMesaj: ${requestForm.message}` : ''}`;
        
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }

      // Sepeti temizle ve anasayfaya yönlendir
      setCartItems([]);
      setTotal(0);
      setRequestForm({
        requesterName: '',
        companyName: '',
        phoneNumber: '',
        message: ''
      });
      router.push('/');
    } catch (error) {
      toast({
        title: "Hata",
        description: "Talep oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Sepetim</h1>

      <div className="grid gap-4">
        {cartItems.map((item) => (
          <Card key={item.productId || item.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.categoryName && (
                      <span className="bg-gray-100 px-2 py-1 rounded-full text-sm">
                        Kategori: {item.categoryName}
                      </span>
                    )}
                    {item.companyName && (
                      <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-sm">
                        Firma: {item.companyName}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Miktar: {item.quantity} | Birim Fiyat: {item.price} TL
                  </p>
                </div>
                <p className="font-semibold text-lg">
                  Toplam: {item.price * item.quantity} TL
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cartItems.length > 0 && (
        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Talep Özeti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold">Seçilen Ürünler:</h3>
                {cartItems.map((item) => (
                  <div key={item.productId || item.id} className="text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-600"> - {item.quantity} adet</span>
                    {item.categoryName && (
                      <span className="text-gray-600"> | Kategori: {item.categoryName}</span>
                    )}
                    {item.companyName && (
                      <span className="text-blue-600"> | Firma: {item.companyName}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Talep Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Adınız Soyadınız"
                value={requestForm.requesterName}
                onChange={(e) => setRequestForm({ ...requestForm, requesterName: e.target.value })}
                required
              />
              <Input
                placeholder="Ticari Ünvan"
                value={requestForm.companyName}
                onChange={(e) => setRequestForm({ ...requestForm, companyName: e.target.value })}
                required
              />
              <Input
                placeholder="Telefon Numarası (5XX) XXX XX XX"
                value={requestForm.phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) {
                    setRequestForm({ ...requestForm, phoneNumber: value });
                  }
                }}
                required
                maxLength="10"
              />
              <Textarea
                placeholder="Talep Mesajınız"
                value={requestForm.message}
                onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sipariş Özeti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Toplam Tutar:</span>
                <span className="font-bold text-lg">{total} TL</span>
              </div>
              <Button 
                onClick={handleSubmitRequest} 
                className="w-full"
                disabled={!requestForm.requesterName || !requestForm.companyName || !requestForm.phoneNumber}
              >
                Talep Oluştur
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}