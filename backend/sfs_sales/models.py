# sfs_sales/models.py
from django.db import models
from django.conf import settings
from decimal import Decimal
from sfs_products.models import Product
from sfs_customers.models import Customer
from sfs_inventory.models import StockLocation
from datetime import datetime
from decimal import Decimal 

class Sale(models.Model):
    CHANNELS = [('KIOSK', 'Kiosque'), ('MARKET', 'Marché'), ('WEB', 'Web'), ('SUBSCRIPTION', 'Abonnement')]
    PAYMENT_METHODS = [('CASH', 'Espèces'), ('CARD', 'Carte'), ('CHECK', 'Chèque'), ('ONLINE', 'En ligne')]
    STATUS = [('PENDING', 'En attente'), ('CONFIRMED', 'Confirmée'), ('COMPLETED', 'Complétée'), ('CANCELLED', 'Annulée')]
    
    sale_number = models.CharField(max_length=50, unique=True, editable=False)
    channel = models.CharField(max_length=20, choices=CHANNELS)
    location = models.ForeignKey(StockLocation, on_delete=models.PROTECT)
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='sales')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    vat_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    loyalty_points_used = models.IntegerField(default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    is_paid = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS, default='PENDING')
    customer_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    synced = models.BooleanField(default=True)
    offline_created_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'sales'
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if not self.sale_number:
            prefix = {'KIOSK': 'K', 'MARKET': 'M', 'WEB': 'W', 'SUBSCRIPTION': 'S'}.get(self.channel, 'X')
            self.sale_number = f"{prefix}{datetime.now().strftime('%Y%m%d%H%M%S')}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.sale_number} - {self.total}€"
    
    @property
    def items_count(self):
        return self.lines.count()

class SaleLine(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='lines')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    vat_rate = models.DecimalField(max_digits=5, decimal_places=2)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'sale_lines'
    
    @property
    def line_total(self):
        percentage = self.discount_percent / Decimal('100.00')
        return self.quantity * self.unit_price * (Decimal('1.00') - percentage)
    
    @property
    def vat_amount(self):
        return self.line_total * (self.vat_rate / 100)

class DailyReport(models.Model):
    date = models.DateField(unique=True)
    location = models.ForeignKey(StockLocation, on_delete=models.PROTECT)
    total_sales_count = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_cash = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_card = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    expected_cash = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    actual_cash = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_validated = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'daily_reports'
        ordering = ['-date']
    
    @property
    def cash_difference(self):
        return self.actual_cash - self.expected_cash
