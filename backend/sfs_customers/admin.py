from django.contrib import admin
from .models import Customer, LoyaltyCard

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['internal_id', 'full_name', 'email', 'phone', 'is_active']
    search_fields = ['first_name', 'last_name', 'email']

@admin.register(LoyaltyCard)
class LoyaltyCardAdmin(admin.ModelAdmin):
    list_display = ['card_number', 'customer', 'points_balance', 'is_active']