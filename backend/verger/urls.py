from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Imports directs depuis api_complete
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from api_complete import (
    ProductViewSet, ProductCategoryViewSet,
    StockViewSet, StockLocationViewSet,
    CustomerViewSet, LoyaltyCardViewSet,
    SaleViewSet, DailyReportViewSet
)

router = routers.DefaultRouter()
router.register(r'products/categories', ProductCategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'inventory/locations', StockLocationViewSet, basename='location')
router.register(r'inventory/stocks', StockViewSet, basename='stock')
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'loyalty', LoyaltyCardViewSet, basename='loyalty')
router.register(r'sales', SaleViewSet, basename='sale')
router.register(r'reports', DailyReportViewSet, basename='report')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/token/', TokenObtainPairView.as_view()),
    path('api/auth/token/refresh/', TokenRefreshView.as_view()),
    path('api/', include(router.urls)),
]