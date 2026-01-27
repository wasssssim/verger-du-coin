# sfs_customers/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import uuid

class Customer(models.Model):
    internal_id = models.CharField(max_length=50, unique=True, editable=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    address_line1 = models.CharField(max_length=255, blank=True)
    postal_code = models.CharField(max_length=10, blank=True)
    city = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    is_anonymized = models.BooleanField(default=False)
    marketing_consent = models.BooleanField(default=False)
    marketing_consent_date = models.DateTimeField(null=True, blank=True)
    newsletter_consent = models.BooleanField(default=False)
    newsletter_consent_date = models.DateTimeField(null=True, blank=True)
    last_purchase_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'customers'
    
    def save(self, *args, **kwargs):
        if not self.internal_id:
            self.internal_id = str(uuid.uuid4())[:13].upper()
        super().save(*args, **kwargs)
    
    def __str__(self):
        if self.is_anonymized:
            return f"Client anonymisé ({self.internal_id})"
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        if self.is_anonymized:
            return "Client anonymisé"
        return f"{self.first_name} {self.last_name}"
    
    def anonymize(self):
        self.first_name = "ANONYME"
        self.last_name = f"CLIENT_{self.internal_id[:8]}"
        self.email = f"anonymized_{self.internal_id}@deleted.local"
        self.phone = ""
        self.address_line1 = ""
        self.postal_code = ""
        self.city = ""
        self.is_anonymized = True
        self.is_active = False
        self.save()

class LoyaltyCard(models.Model):
    customer = models.OneToOneField(Customer, on_delete=models.CASCADE, related_name='loyalty_card')
    card_number = models.CharField(max_length=20, unique=True)
    points_balance = models.IntegerField(default=0)
    total_points_earned = models.IntegerField(default=0)
    total_points_spent = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    issued_date = models.DateField(auto_now_add=True)
    
    class Meta:
        db_table = 'loyalty_cards'
    
    def __str__(self):
        return f"Carte {self.card_number}"
    
    def add_points(self, amount_spent):
        points = int(amount_spent * settings.LOYALTY_POINTS_MULTIPLIER)
        self.points_balance += points
        self.total_points_earned += points
        self.save()
        return points
    
    def redeem_points(self, points):
        if points > self.points_balance:
            raise ValueError("Solde insuffisant")
        self.points_balance -= points
        self.total_points_spent += points
        self.save()
        return (points / settings.LOYALTY_DISCOUNT_THRESHOLD) * 10
