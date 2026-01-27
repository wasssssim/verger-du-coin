from django.contrib import admin
from .models import StockLocation, Stock, StockMovement

@admin.register(StockLocation)
class StockLocationAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'is_active']

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ['product', 'location', 'quantity', 'available_quantity', 'is_low_stock']
    list_filter = ['location']

@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ['stock', 'movement_type', 'quantity', 'created_at']
    list_filter = ['movement_type']