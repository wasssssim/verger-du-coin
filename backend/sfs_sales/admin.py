from django.contrib import admin
from .models import Sale, SaleLine, DailyReport

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ['sale_number', 'channel', 'total', 'payment_method', 'status', 'created_at']
    list_filter = ['channel', 'status', 'payment_method']

@admin.register(SaleLine)
class SaleLineAdmin(admin.ModelAdmin):
    list_display = ['sale', 'product', 'quantity', 'unit_price']

@admin.register(DailyReport)
class DailyReportAdmin(admin.ModelAdmin):
    list_display = ['date', 'location', 'total_revenue', 'is_validated']