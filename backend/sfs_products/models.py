# sfs_products/models.py
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal

class ProductCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'product_categories'
        ordering = ['display_order']
    
    def __str__(self):
        return self.name

class Product(models.Model):
    UNIT_CHOICES = [('KG', 'Kg'), ('UNIT', 'Unité'), ('BUNCH', 'Botte'), ('BASKET', 'Panier')]
    
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    category = models.ForeignKey(ProductCategory, on_delete=models.PROTECT, related_name='products')
    description = models.TextField(blank=True)
    # Image désactivée pour éviter problème Pillow sur Windows
    # image = models.ImageField(upload_to='products/', blank=True, null=True)
    base_price = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='KG')
    vat_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('5.50'))
    is_active = models.BooleanField(default=True)
    is_seasonal = models.BooleanField(default=True)
    season_start_month = models.IntegerField(null=True, blank=True)
    season_end_month = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        ordering = ['category', 'name']
    
    def __str__(self):
        return self.name
    
    @property
    def is_in_season(self):
        if not self.is_seasonal:
            return True
        from datetime import date
        month = date.today().month
        if self.season_start_month and self.season_end_month:
            if self.season_start_month <= self.season_end_month:
                return self.season_start_month <= month <= self.season_end_month
            return month >= self.season_start_month or month <= self.season_end_month
        return True
