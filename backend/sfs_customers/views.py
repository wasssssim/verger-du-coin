# API COMPLETE - Serializers et Views
from rest_framework import serializers, viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.utils import timezone
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from sfs_products.models import Product, ProductCategory
from sfs_inventory.models import Stock, StockLocation, StockMovement
from sfs_customers.models import Customer, LoyaltyCard
from sfs_sales.models import Sale, SaleLine, DailyReport

# === PRODUCTS SERIALIZERS ===
class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ['id', 'name', 'display_order', 'is_active']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    in_season = serializers.BooleanField(source='is_in_season', read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'code', 'name', 'category', 'category_name', 'description', 
                  'base_price', 'unit', 'vat_rate', 'is_active', 'is_seasonal', 
                  'in_season', 'created_at']

# === INVENTORY SERIALIZERS ===
class StockLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockLocation
        fields = ['id', 'code', 'name', 'is_active']

class StockSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    location_name = serializers.CharField(source='location.name', read_only=True)
    available_quantity = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Stock
        fields = ['id', 'product', 'product_name', 'location', 'location_name', 
                  'quantity', 'reserved_quantity', 'available_quantity', 
                  'low_stock_threshold', 'is_low_stock', 'last_updated']

class StockMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockMovement
        fields = ['id', 'stock', 'movement_type', 'quantity', 'reference', 'note', 'created_at']

# === CUSTOMERS SERIALIZERS ===
class CustomerSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = Customer
        fields = ['id', 'internal_id', 'first_name', 'last_name', 'full_name', 
                  'email', 'phone', 'address_line1', 'postal_code', 'city',
                  'is_active', 'is_anonymized', 'marketing_consent', 
                  'newsletter_consent', 'last_purchase_date', 'created_at']
        read_only_fields = ['internal_id', 'is_anonymized']

class LoyaltyCardSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    
    class Meta:
        model = LoyaltyCard
        fields = ['id', 'customer', 'customer_name', 'card_number', 
                  'points_balance', 'total_points_earned', 'is_active']

# === SALES SERIALIZERS ===
class SaleLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    line_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = SaleLine
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 
                  'vat_rate', 'discount_percent', 'line_total']

class SaleSerializer(serializers.ModelSerializer):
    lines = SaleLineSerializer(many=True, read_only=True)
    customer_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Sale
        fields = ['id', 'sale_number', 'channel', 'location', 'customer', 'customer_name',
                  'subtotal', 'vat_amount', 'discount_amount', 'total', 
                  'payment_method', 'is_paid', 'status', 'lines', 'created_at', 'synced']
        read_only_fields = ['sale_number']
    
    def get_customer_name(self, obj):
        return obj.customer.full_name if obj.customer else "Client anonyme"

class SaleCreateSerializer(serializers.ModelSerializer):
    lines = SaleLineSerializer(many=True)
    
    class Meta:
        model = Sale
        fields = ['channel', 'location', 'customer', 'payment_method', 'lines', 'offline_created_at']
    
    @transaction.atomic
    def create(self, validated_data):
        lines_data = validated_data.pop('lines')
        sale = Sale.objects.create(
            **validated_data,
            subtotal=0,
            vat_amount=0,
            total=0,
            is_paid=True,
            status="COMPLETED"
        )   
        subtotal = vat_amount = 0
        for line_data in lines_data:
            product = line_data['product']
            if 'unit_price' not in line_data:
                line_data['unit_price'] = product.base_price
            if 'vat_rate' not in line_data:
                line_data['vat_rate'] = product.vat_rate
            
            line = SaleLine.objects.create(sale=sale, **line_data)
            subtotal += line.line_total
            vat_amount += line.vat_amount
            
            # Décrémenter stock
            try:
                stock = Stock.objects.get(product=product, location=sale.location)
                StockMovement.objects.create(
                    stock=stock, movement_type='OUT', quantity=line.quantity,
                    reference=sale.sale_number, note=f"Vente {sale.channel}"
                )
            except Stock.DoesNotExist:
                pass
        
        sale.subtotal = subtotal
        sale.vat_amount = vat_amount
        sale.total = subtotal + vat_amount
        sale.save()
        
        # Points fidélité
        if sale.customer and sale.is_paid:
            try:
                sale.customer.loyalty_card.add_points(float(sale.total))
                sale.customer.last_purchase_date = sale.created_at
                sale.customer.save()
            except:
                pass
        
        return sale

class DailyReportSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source='location.name', read_only=True)
    cash_difference = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = DailyReport
        fields = ['id', 'date', 'location', 'location_name', 'total_sales_count', 
                  'total_revenue', 'total_cash', 'total_card', 'expected_cash', 
                  'actual_cash', 'cash_difference', 'is_validated', 'notes']

# === VIEWSETS ===
class ProductCategoryViewSet(viewsets.ModelViewSet):
    queryset = ProductCategory.objects.filter(is_active=True)
    serializer_class = ProductCategorySerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'is_seasonal']
    search_fields = ['name', 'code']
    
    @action(detail=False)
    def in_season(self, request):
        products = [p for p in self.get_queryset() if p.is_in_season]
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

class StockLocationViewSet(viewsets.ModelViewSet):
    queryset = StockLocation.objects.filter(is_active=True)
    serializer_class = StockLocationSerializer

class StockViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product', 'location']
    
    @action(detail=False)
    def low_stock(self, request):
        stocks = [s for s in self.get_queryset() if s.is_low_stock]
        serializer = self.get_serializer(stocks, many=True)
        return Response(serializer.data)

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.filter(is_active=True, is_anonymized=False)
    serializer_class = CustomerSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'email']
    permission_classes = [AllowAny]
    
    def get_permissions(self):
        if self.action == 'me':
            return [IsAuthenticated()]  # 👈 Force authentification pour 'me'
        if self.action == 'create':
            return [AllowAny()]
        return [AllowAny()]  # 👈 Allo)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Retourne les informations de l'utilisateur connecté"""
        user = request.user
        
        # Retourner les infos du User Django
        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name or '',
            'last_name': user.last_name or '',
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'is_active': user.is_active,
        }
        
        # Si l'utilisateur a un Customer lié, ajouter les infos
        try:
            if hasattr(user, 'customer'):
                customer = user.customer
                data['customer_id'] = customer.id
                data['phone'] = customer.phone
                data['address'] = customer.address_line1
                data['postal_code'] = customer.postal_code
                data['city'] = customer.city
                
                # Ajouter la carte de fidélité si elle existe
                if hasattr(customer, 'loyalty_card'):
                    card = customer.loyalty_card
                    data['loyalty_card'] = {
                        'card_number': card.card_number,
                        'points_balance': float(card.points_balance),
                        'is_active': card.is_active
                    }
        except:
            pass
        
        return Response(data)
    
    @action(detail=True, methods=['post'])
    def anonymize(self, request, pk=None):
        customer = self.get_object()
        customer.anonymize()
        return Response({'message': 'Client anonymisé'})
    
    @action(detail=False, methods=['post'])
    def search_by_card(self, request):
        card_number = request.data.get('card_number')
        try:
            card = LoyaltyCard.objects.get(card_number=card_number)
            return Response({
                'customer': CustomerSerializer(card.customer).data,
                'loyalty_card': LoyaltyCardSerializer(card).data
            })
        except LoyaltyCard.DoesNotExist:
            return Response({'error': 'Carte non trouvée'}, status=404)

class LoyaltyCardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LoyaltyCard.objects.filter(is_active=True)
    serializer_class = LoyaltyCardSerializer

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['channel', 'location', 'customer', 'status']
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SaleCreateSerializer
        return SaleSerializer
    
    @action(detail=False, methods=['post'])
    def sync(self, request):
        sales_data = request.data.get('sales', [])
        synced = []
        for sale_data in sales_data:
            serializer = SaleCreateSerializer(data=sale_data)
            if serializer.is_valid():
                sale = serializer.save()
                sale.synced = True
                sale.save()
                synced.append(sale)
        
        return Response({
            'synced_count': len(synced),
            'sales': SaleSerializer(synced, many=True).data
        })
    
    @action(detail=False)
    def statistics(self, request):
        from django.db.models import Sum, Count
        sales = self.get_queryset().filter(status='COMPLETED')
        return Response({
            'total_sales': sales.count(),
            'total_revenue': float(sales.aggregate(Sum('total'))['total__sum'] or 0),
            'by_channel': {
                channel: sales.filter(channel=code).count()
                for code, channel in Sale.CHANNELS
            }
        })

class DailyReportViewSet(viewsets.ModelViewSet):
    queryset = DailyReport.objects.all()
    serializer_class = DailyReportSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['location', 'is_validated']