# sfs_inventory/models.py
from django.db import models
from django.conf import settings
from decimal import Decimal
from sfs_products.models import Product

class StockLocation(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'stock_locations'
    
    def __str__(self):
        return self.name

class Stock(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stocks')
    location = models.ForeignKey(StockLocation, on_delete=models.CASCADE, related_name='stocks')
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    reserved_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    low_stock_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=10)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'stocks'
        unique_together = ['product', 'location']
    
    @property
    def available_quantity(self):
        return max(self.quantity - self.reserved_quantity, 0)
    
    @property
    def is_low_stock(self):
        return self.available_quantity <= self.low_stock_threshold
    
    def __str__(self):
        return f"{self.product.name} @ {self.location.name}"

class StockMovement(models.Model):
    TYPES = [('IN', 'Entrée'), ('OUT', 'Sortie'), ('ADJUSTMENT', 'Ajustement')]
    
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    movement_type = models.CharField(max_length=20, choices=TYPES)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    reference = models.CharField(max_length=100, blank=True)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'stock_movements'
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            if self.movement_type == 'IN':
                self.stock.quantity += abs(self.quantity)
            elif self.movement_type == 'OUT':
                self.stock.quantity -= abs(self.quantity)
            self.stock.save()
