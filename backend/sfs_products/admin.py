from django.contrib import admin
from .models import ProductCategory, Product

@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'display_order', 'is_active']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'category', 'base_price', 'unit', 'is_active']
    list_filter = ['category', 'is_active', 'is_seasonal']
    search_fields = ['name', 'code']